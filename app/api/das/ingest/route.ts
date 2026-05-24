import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chunkText } from "@/lib/das/chunk";
import { embedTexts, toVectorLiteral, EmbeddingError } from "@/lib/das/embeddings";
import { extractPdfText, PdfError } from "@/lib/das/pdf";
import { extractDocxText, DocxError } from "@/lib/das/docx";
import { getUsage } from "@/lib/das/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_TITLE = 300;
const MAX_TEXT_CHARS = 1_000_000;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_CHUNKS = 800;

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface ParsedInput {
  title: string;
  text: string;
  sourceType: "pdf" | "text" | "docx";
  originalUrl: string | null;
  pages: number | null;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function parseInput(req: Request): Promise<ParsedInput | NextResponse> {
  const contentType = req.headers.get("content-type") || "";

  let title = "";
  let text = "";
  let sourceType: "pdf" | "text" | "docx" = "text";
  let originalUrl: string | null = null;
  let pages: number | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    title = String(form.get("title") ?? "").trim();
    originalUrl = (form.get("originalUrl") as string | null)?.trim() || null;
    const file = form.get("file");

    if (file && typeof file !== "string") {
      if (file.size > MAX_FILE_BYTES) return bad("File exceeds 15MB limit", 413);
      const name = file.name?.toLowerCase() ?? "";
      const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
      const isDocx = file.type === DOCX_MIME || name.endsWith(".docx");
      const buffer = await file.arrayBuffer();
      if (isPdf) {
        const extract = await extractPdfText(buffer);
        text = extract.text;
        pages = extract.pages;
        sourceType = "pdf";
      } else if (isDocx) {
        text = await extractDocxText(buffer);
        sourceType = "docx";
      } else {
        return bad("Uploaded file must be a PDF or DOCX");
      }
    } else {
      text = String(form.get("text") ?? "");
      sourceType = "text";
    }
  } else if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return bad("Invalid JSON body");
    title = String(body.title ?? "").trim();
    text = String(body.text ?? "");
    originalUrl = body.originalUrl ? String(body.originalUrl).trim() : null;
    sourceType = "text";
  } else {
    return bad("Unsupported content-type; use application/json or multipart/form-data", 415);
  }

  if (!title) return bad("title is required");
  if (title.length > MAX_TITLE) return bad(`title exceeds ${MAX_TITLE} chars`);

  text = text.trim();
  if (!text) return bad("No text content to ingest");
  if (text.length > MAX_TEXT_CHARS) return bad("Document too large", 413);

  return { title, text, sourceType, originalUrl, pages };
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return bad("Unauthorized", 401);

  // Hard budget gate (429 once the month is at/over 100%).
  const pre = await getUsage(userId);
  if (pre.hardExceeded) {
    return NextResponse.json(
      { error: "Monthly embedding budget exhausted", usage: pre },
      { status: 429 },
    );
  }

  let parsed: ParsedInput | NextResponse;
  try {
    parsed = await parseInput(req);
  } catch (err) {
    if (err instanceof PdfError) return bad(err.message, err.status);
    if (err instanceof DocxError) return bad(err.message, err.status);
    return bad("Failed to read request body");
  }
  if (parsed instanceof NextResponse) return parsed;

  const chunks = chunkText(parsed.text);
  if (chunks.length === 0) return bad("No text content to ingest");
  if (chunks.length > MAX_CHUNKS) {
    return bad(`Document produces too many chunks (${chunks.length} > ${MAX_CHUNKS})`, 413);
  }

  // Embed BEFORE opening a transaction — never hold a DB txn during a network call.
  let embedding;
  try {
    embedding = await embedTexts(chunks.map((c) => c.content));
  } catch (err) {
    if (err instanceof EmbeddingError) return bad(err.message, err.status);
    return bad("Embedding failed", 502);
  }
  const { vectors, totalTokens } = embedding;

  // Atomic write: document + chunks + usage increment. userId is forced on every
  // row from the authenticated session (vector writes use parameterized raw SQL,
  // which bypasses the scoped client, so userId is passed explicitly).
  const documentId = await prisma.$transaction(async (tx) => {
    const doc = await tx.studyDocument.create({
      data: {
        userId,
        title: parsed.title,
        sourceType: parsed.sourceType,
        originalUrl: parsed.originalUrl,
        pages: parsed.pages,
        status: "ready",
        processedAt: new Date(),
      },
      select: { id: true },
    });

    for (let i = 0; i < chunks.length; i++) {
      await tx.$executeRaw`
        INSERT INTO "DocumentChunk"
          ("id", "documentId", "userId", "content", "embedding", "metadata", "position")
        VALUES (
          ${randomUUID()},
          ${doc.id},
          ${userId},
          ${chunks[i].content},
          ${toVectorLiteral(vectors[i])}::vector,
          ${JSON.stringify({ title: parsed.title, sourceType: parsed.sourceType })}::jsonb,
          ${chunks[i].position}
        )`;
    }

    await tx.userUsage.upsert({
      where: { userId_month: { userId, month: new Date().toISOString().slice(0, 7) } },
      update: { embeddingTokens: { increment: totalTokens } },
      create: {
        userId,
        month: new Date().toISOString().slice(0, 7),
        embeddingTokens: totalTokens,
      },
    });

    return doc.id;
  }, { timeout: 30_000, maxWait: 10_000 });

  const usage = await getUsage(userId);
  const res = NextResponse.json(
    {
      sourceId: documentId,
      status: "ready",
      documentId,
      chunks: chunks.length,
      embeddingTokens: totalTokens,
      usage,
      warning: usage.softExceeded
        ? `Embedding usage at ${(usage.percent * 100).toFixed(0)}% of monthly budget`
        : undefined,
    },
    { status: 201 },
  );
  if (usage.softExceeded) res.headers.set("X-Usage-Warning", "soft-limit");
  return res;
}

import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/owner";
import { forUser } from "@/lib/repositories/scoped";
import type { SearchResult } from "@/lib/research/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SOURCES: ReadonlyArray<SearchResult["source"]> = [
  "pubmed",
  "europepmc",
  "crossref",
  "scopus",
  "sciencedirect",
  "cochrane",
];

const MAX_TITLE = 1000;
const MAX_ABSTRACT = 50_000;

/**
 * POST /api/research/extract  Body: SearchResult (one item from /search)
 * Saves the result into the user's ResearchExtraction vault. Idempotent on
 * (userId, doi) and (userId, pmid) at the app layer — re-extracting an
 * already-saved paper returns the existing row.
 */
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Partial<SearchResult> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (body.title.length > MAX_TITLE) {
    return NextResponse.json({ error: "title too long" }, { status: 413 });
  }
  const source =
    body.source && ALLOWED_SOURCES.includes(body.source) ? body.source : undefined;
  const abstract =
    typeof body.abstract === "string" && body.abstract.length <= MAX_ABSTRACT
      ? body.abstract
      : undefined;
  const year =
    typeof body.year === "number" && Number.isFinite(body.year) ? body.year : undefined;

  const db = forUser(userId);

  // Idempotency: prefer DOI, fall back to PMID, then title.
  const where = body.doi
    ? { doi: body.doi }
    : body.pmid
      ? { pmid: body.pmid }
      : { title: body.title };
  const existing = await db.researchExtraction.findFirst({ where });
  if (existing) {
    return NextResponse.json({ extraction: existing, created: false });
  }

  const extraction = await db.researchExtraction.create({
    data: {
      userId,
      title: body.title,
      authors: typeof body.authors === "string" ? body.authors : undefined,
      journal: typeof body.journal === "string" ? body.journal : undefined,
      url: typeof body.url === "string" ? body.url : undefined,
      pmid: typeof body.pmid === "string" ? body.pmid : undefined,
      doi: typeof body.doi === "string" ? body.doi : undefined,
      source,
      abstract,
      year,
    },
  });
  return NextResponse.json({ extraction, created: true }, { status: 201 });
}

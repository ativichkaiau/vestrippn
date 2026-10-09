import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireUserId } from "@/lib/auth/owner";
import { forUser } from "@/lib/repositories/scoped";
import { retrieveChunks } from "@/lib/das/retrieval";
import { buildContext, createAnswerStream, type IncomingMessage } from "@/lib/das/answer";
import { recordChatTokens } from "@/lib/das/usage";
import { EmbeddingError } from "@/lib/das/embeddings";
import { assistantConfigured, assistantModel, limitError, limitState, recordRequest, recordTokens } from "@/lib/assistant/limit";
import { captureError } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_MESSAGES = 50;
const MAX_CONTENT = 20_000;

function bad(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

function sse(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

/**
 * POST /api/das/chat — answer from the caller's own ingested sources.
 * Body: { threadId?, messages: {role,content}[] }  (must end with a user turn)
 * Streams Server-Sent Events:
 *   { type: "meta", threadId, messageId }
 *   { type: "token", text }                       (repeated)
 *   { type: "citations", citations: Citation[] }
 *   { type: "done", message: { id, role, content, citations } }
 *   { type: "error", error }
 * Counts against the same request budget as /api/assistant.
 */
export async function POST(req: Request) {
  if (!assistantConfigured()) {
    return bad("Assistant is not configured", 503, { detail: "OPENAI_API_KEY is not set on this deployment." });
  }
  const userId = await requireUserId();
  if (!userId) return bad("Unauthorized", 401);

  const body = (await req.json().catch(() => null)) as { threadId?: unknown; messages?: unknown } | null;
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return bad("messages[] is required");
  }
  if (body.messages.length > MAX_MESSAGES) return bad("Too many messages", 413);

  const messages: IncomingMessage[] = [];
  for (const m of body.messages) {
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return bad("Each message needs role 'user'|'assistant' and string content");
    }
    if (content.length > MAX_CONTENT) return bad("Message too long", 413);
    messages.push({ role, content });
  }
  const lastUser = messages[messages.length - 1];
  if (lastUser.role !== "user" || !lastUser.content.trim()) {
    return bad("Conversation must end with a non-empty user message");
  }

  const state = await limitState(userId);
  if (!state.allowed) return NextResponse.json(limitError(state), { status: 429 });

  const db = forUser(userId);

  // Resolve or create the thread (scoped — cannot touch another user's thread).
  let threadId: string;
  if (typeof body.threadId === "string" && body.threadId) {
    const thread = await db.chatThread.findFirst({ where: { id: body.threadId } });
    if (!thread) return bad("Thread not found", 404);
    threadId = thread.id;
  } else {
    const thread = await db.chatThread.create({ data: { userId, title: lastUser.content.slice(0, 80) } });
    threadId = thread.id;
  }

  // Persist the incoming user turn before generating.
  await db.chatMessage.create({
    data: { userId, threadId, role: "user", content: lastUser.content, citations: [] },
  });

  const model = assistantModel();
  const assistantId = randomUUID();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(sse(obj));
      try {
        send({ type: "meta", threadId, messageId: assistantId });

        const chunks = await retrieveChunks(userId, lastUser.content);
        const { contextText, citations } = buildContext(chunks);

        const completion = await createAnswerStream(model, messages, contextText);
        // Accepted by the provider: from here the request counts.
        const usageId = await recordRequest(userId, model);

        let full = "";
        let usage: { prompt_tokens?: number; completion_tokens?: number } | null = null;
        for await (const chunk of completion) {
          if (chunk.usage) usage = chunk.usage;
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            full += delta;
            send({ type: "token", text: delta });
          }
        }

        const promptTokens = usage?.prompt_tokens ?? 0;
        const completionTokens = usage?.completion_tokens ?? 0;
        // Persist the reply and meter usage (best-effort; never fail the stream).
        await Promise.allSettled([
          db.chatMessage.create({
            data: { id: assistantId, userId, threadId, role: "assistant", content: full, citations: citations as object[] },
          }),
          recordChatTokens(userId, promptTokens + completionTokens),
          recordTokens(usageId, model, promptTokens, completionTokens),
        ]);

        send({ type: "citations", citations });
        send({ type: "done", message: { id: assistantId, role: "assistant", content: full, citations } });
      } catch (err) {
        captureError("das.chat", err, { userId });
        // Embedding errors are actionable (missing key, upstream limit); anything
        // else stays generic so internal details never reach the browser.
        send({ type: "error", error: err instanceof EmbeddingError ? err.message : "The assistant could not answer. Try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

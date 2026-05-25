import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { forUser } from "@/lib/repositories/scoped";
import { retrieveChunks } from "@/lib/das/retrieval";
import { buildContext, createChatStream, type IncomingMessage } from "@/lib/das/llm";
import { recordChatTokens } from "@/lib/das/usage";
import { EmbeddingError } from "@/lib/das/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_MESSAGES = 50;
const MAX_CONTENT = 20_000;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function sse(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

/**
 * POST /api/das/chat
 * Body: { threadId?, messages: {role,content}[] }  (must end with a user turn)
 * Streams Server-Sent Events:
 *   { type: "meta", threadId, messageId }
 *   { type: "token", text }                       (repeated)
 *   { type: "citations", citations: Citation[] }
 *   { type: "done", message: { id, role, content, citations } }
 *   { type: "error", error }
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return bad("Unauthorized", 401);

  const body = (await req.json().catch(() => null)) as {
    threadId?: unknown;
    messages?: unknown;
  } | null;
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

  const db = forUser(userId);

  // Resolve or create the thread (scoped — cannot touch another user's thread).
  let threadId: string;
  if (typeof body.threadId === "string" && body.threadId) {
    const thread = await db.chatThread.findFirst({ where: { id: body.threadId } });
    if (!thread) return bad("Thread not found", 404);
    threadId = thread.id;
  } else {
    const thread = await db.chatThread.create({
      data: { userId, title: lastUser.content.slice(0, 80) },
    });
    threadId = thread.id;
  }

  // Persist the incoming user turn before we start generating.
  // (userId is also normalized to the scope owner by the scoped client; it is
  // present here only because Prisma's create input type requires it.)
  await db.chatMessage.create({
    data: { userId, threadId, role: "user", content: lastUser.content, citations: [] },
  });

  const assistantId = randomUUID();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(sse(obj));
      try {
        send({ type: "meta", threadId, messageId: assistantId });

        const chunks = await retrieveChunks(userId, lastUser.content);
        const { contextText, citations } = buildContext(chunks);

        const llm = createChatStream(messages, contextText);
        let full = "";
        for await (const event of llm) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            send({ type: "token", text: event.delta.text });
          }
        }

        const finalMsg = await llm.finalMessage();
        const u = finalMsg.usage;
        const tokens =
          (u.input_tokens ?? 0) +
          (u.output_tokens ?? 0) +
          (u.cache_read_input_tokens ?? 0) +
          (u.cache_creation_input_tokens ?? 0);

        // Persist assistant turn + meter usage (best-effort; don't fail the stream).
        await Promise.allSettled([
          db.chatMessage.create({
            data: {
              id: assistantId,
              userId,
              threadId,
              role: "assistant",
              content: full,
              citations,
            },
          }),
          recordChatTokens(userId, tokens),
        ]);

        send({ type: "citations", citations });
        send({
          type: "done",
          message: { id: assistantId, role: "assistant", content: full, citations },
        });
      } catch (err) {
        const msg =
          err instanceof EmbeddingError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Chat failed";
        send({ type: "error", error: msg });
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

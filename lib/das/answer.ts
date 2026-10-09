import OpenAI from "openai";
import type { RetrievedChunk } from "@/lib/das/retrieval";

/**
 * Grounded answers over the user's ingested sources.
 *
 * Same provider and model as the hub assistant (OPENAI_MODEL, default
 * gpt-4o-mini), so one key and one budget cover both assistant modes. The
 * retrieved passages travel in the final user turn as a numbered context block;
 * the model cites them inline as [1], [2]… and the UI maps markers to sources.
 */

const SNIPPET_LEN = 240;
const MAX_TOKENS = 1_200;

export interface Citation {
  title: string;
  source?: string;
  url?: string;
  snippet?: string;
}

export interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the VESTRIPPN assistant answering from the user's own documents. Answer using ONLY the numbered context passages in the user's message.

Rules:
- Ground every claim in the passages. If the answer is not there, say the sources don't cover it — do not guess or fill gaps from general knowledge.
- Cite inline with bracketed markers like [1] or [2] that refer to the numbered passages, placed right after the sentence they support. Never cite a number that was not provided.
- Be concise and factual. Plain text: short paragraphs and "-" bullets, no markdown headers.
- The passages may be in Thai or English; answer in the language of the question.`;

/** The numbered context block, plus the parallel Citation[] for the UI. */
export function buildContext(chunks: RetrievedChunk[]): { contextText: string; citations: Citation[] } {
  const citations: Citation[] = chunks.map((chunk) => ({
    title: chunk.title,
    source: `passage ${chunk.position + 1}`,
    url: chunk.url ?? undefined,
    snippet: chunk.content.length > SNIPPET_LEN ? `${chunk.content.slice(0, SNIPPET_LEN).trimEnd()}…` : chunk.content,
  }));
  const contextText = chunks.length
    ? chunks.map((chunk, i) => `[${i + 1}] ${chunk.title} (passage ${chunk.position + 1})\n${chunk.content}`).join("\n\n")
    : "(no relevant passages found)";
  return { contextText, citations };
}

/** Open a streamed completion. History must end with a user turn. */
export function createAnswerStream(model: string, history: IncomingMessage[], contextText: string) {
  const last = history[history.length - 1];
  if (!last || last.role !== "user") throw new Error("Conversation must end with a user message");

  return new OpenAI().chat.completions.create({
    model,
    stream: true,
    stream_options: { include_usage: true },
    temperature: 0.2,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(0, -1).map((turn) => ({ role: turn.role, content: turn.content })),
      { role: "user", content: `<context>\n${contextText}\n</context>\n\nQuestion: ${last.content}` },
    ],
  });
}

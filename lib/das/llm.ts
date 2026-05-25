import Anthropic from "@anthropic-ai/sdk";
import type { RetrievedChunk } from "@/lib/das/retrieval";

/**
 * DAS chat LLM layer (Anthropic Messages API, streamed).
 *
 * Provider/model are env-overridable so ops can dial cost/latency (e.g. swap to
 * a Sonnet tier, drop effort, or disable thinking) without a code change. The
 * default is claude-opus-4-7 per the Claude API guidance.
 *
 * Caching: the stable system prompt carries cache_control; the volatile
 * retrieved context + question live in the user turn so the cached prefix is
 * not invalidated per request. (System prompt below the model's min cacheable
 * prefix simply won't cache — harmless.)
 */

const MODEL = process.env.DAS_CHAT_MODEL || "claude-opus-4-7";
const MAX_TOKENS = Number(process.env.DAS_CHAT_MAX_TOKENS) || 8192;
const SNIPPET_LEN = 240;

// NOTE: adaptive thinking + output_config.effort are intentionally NOT sent.
// The pinned @anthropic-ai/sdk (0.70.x) predates Opus 4.7 and only types
// thinking as 'enabled' | 'disabled'. claude-opus-4-7 runs with thinking off by
// default, so the basic request below is correct on this SDK. To enable
// adaptive thinking / effort, bump the SDK to an Opus 4.7-capable release and
// add `thinking: { type: "adaptive" }` + `output_config: { effort }` here.

// Matches components/w08/CitationPopover.tsx Citation type.
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

const SYSTEM_PROMPT = `You are DAS, a document assistant. Answer the user's question using ONLY the numbered context passages provided in the user's message.

Rules:
- Ground every claim in the context. If the answer is not in the context, say you don't have that information — do not guess.
- Cite sources inline with bracketed markers like [1], [2] that refer to the numbered passages. Place a marker immediately after the sentence it supports.
- Be concise and factual. Do not invent passage numbers that were not provided.`;

export const anthropic = new Anthropic();

/** Build the numbered context block + the parallel Citation[] for the UI. */
export function buildContext(chunks: RetrievedChunk[]): {
  contextText: string;
  citations: Citation[];
} {
  const citations: Citation[] = chunks.map((c) => ({
    title: c.title,
    url: c.url ?? undefined,
    snippet:
      c.content.length > SNIPPET_LEN
        ? `${c.content.slice(0, SNIPPET_LEN).trimEnd()}…`
        : c.content,
  }));

  const contextText = chunks.length
    ? chunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`).join("\n\n")
    : "(no relevant passages found)";

  return { contextText, citations };
}

/**
 * Open a streamed Messages request. History must end with a user turn; the
 * retrieved context is merged into that final user turn.
 */
export function createChatStream(history: IncomingMessage[], contextText: string) {
  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    throw new Error("Conversation must end with a user message");
  }

  const prior: Anthropic.MessageParam[] = history.slice(0, -1).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const messages: Anthropic.MessageParam[] = [
    ...prior,
    {
      role: "user",
      content: `<context>\n${contextText}\n</context>\n\nQuestion: ${last.content}`,
    },
  ];

  return anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages,
  });
}

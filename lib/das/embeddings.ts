/**
 * Embeddings via the OpenAI REST API (text-embedding-3-small, 1536 dims).
 * Uses fetch directly to avoid adding the openai SDK as a dependency.
 * Exact billed token counts come from the API `usage` field — that is the
 * source of truth for UserUsage.embeddingTokens.
 */

const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
const MAX_INPUTS_PER_REQUEST = 96;

export interface EmbedResult {
  vectors: number[][];
  totalTokens: number;
}

export class EmbeddingError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "EmbeddingError";
  }
}

async function embedBatch(inputs: string[], apiKey: string): Promise<EmbedResult> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: inputs,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // 429/5xx from upstream are retryable by the caller; surface the status.
    throw new EmbeddingError(
      `Embedding request failed (${res.status}): ${detail.slice(0, 300)}`,
      res.status === 429 ? 429 : 502,
    );
  }

  const json = (await res.json()) as {
    data: { embedding: number[]; index: number }[];
    usage?: { total_tokens?: number; prompt_tokens?: number };
  };

  // Preserve input order regardless of API ordering.
  const vectors = json.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);

  const totalTokens = json.usage?.total_tokens ?? json.usage?.prompt_tokens ?? 0;
  return { vectors, totalTokens };
}

export async function embedTexts(inputs: string[]): Promise<EmbedResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new EmbeddingError("OPENAI_API_KEY is not configured", 503);
  if (inputs.length === 0) return { vectors: [], totalTokens: 0 };

  const vectors: number[][] = [];
  let totalTokens = 0;

  for (let i = 0; i < inputs.length; i += MAX_INPUTS_PER_REQUEST) {
    const batch = inputs.slice(i, i + MAX_INPUTS_PER_REQUEST);
    const result = await embedBatch(batch, apiKey);
    vectors.push(...result.vectors);
    totalTokens += result.totalTokens;
  }

  return { vectors, totalTokens };
}

/** pgvector text literal: '[0.1,0.2,...]' for binding as $n::vector. */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

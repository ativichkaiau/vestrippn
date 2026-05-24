/**
 * Token-windowed chunking for embedding.
 *
 * We deliberately avoid pulling in a full BPE tokenizer (tiktoken) here: it is a
 * heavy native/wasm dep and exact token boundaries are not required to *split*
 * text — only to bill it. Exact token counts for billing come back from the
 * embeddings API response (see lib/das/embeddings.ts). For splitting we use a
 * word-window whose size is tuned to land inside the 500–800 token target.
 */

const CHUNK_TOKENS = 700; // mid of the 500–800 target band
const OVERLAP_TOKENS = 100;
const AVG_TOKENS_PER_WORD = 1.3; // English heuristic (~0.75 words/token)

const WORDS_PER_CHUNK = Math.round(CHUNK_TOKENS / AVG_TOKENS_PER_WORD); // ~538
const OVERLAP_WORDS = Math.round(OVERLAP_TOKENS / AVG_TOKENS_PER_WORD); // ~77

export interface Chunk {
  content: string;
  position: number;
}

export function chunkText(raw: string): Chunk[] {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const words = text.split(" ");
  if (words.length <= WORDS_PER_CHUNK) {
    return [{ content: text, position: 0 }];
  }

  const step = WORDS_PER_CHUNK - OVERLAP_WORDS; // guaranteed > 0
  const chunks: Chunk[] = [];
  let position = 0;

  for (let start = 0; start < words.length; start += step) {
    const slice = words.slice(start, start + WORDS_PER_CHUNK);
    if (slice.length === 0) break;
    chunks.push({ content: slice.join(" "), position: position++ });
    if (start + WORDS_PER_CHUNK >= words.length) break;
  }

  return chunks;
}

/**
 * Token-windowed chunking for embedding.
 *
 * We deliberately avoid pulling in a full BPE tokenizer (tiktoken) here: it is a
 * heavy native/wasm dep and exact token boundaries are not required to *split*
 * text — only to bill it. Exact token counts for billing come back from the
 * embeddings API response (see lib/das/embeddings.ts). For splitting we use a
 * word-window whose size is tuned to land inside the 500–800 token target.
 *
 * Scripts without spaces between words (Thai, for one) would make a single
 * "word" of a whole paragraph, so every chunk is also capped by characters:
 * any window longer than MAX_CHARS is cut into overlapping character slices.
 * That keeps each input well inside the embedding model's limit.
 */

const CHUNK_TOKENS = 700; // mid of the 500–800 target band
const OVERLAP_TOKENS = 100;
const AVG_TOKENS_PER_WORD = 1.3; // English heuristic (~0.75 words/token)

const WORDS_PER_CHUNK = Math.round(CHUNK_TOKENS / AVG_TOKENS_PER_WORD); // ~538
const OVERLAP_WORDS = Math.round(OVERLAP_TOKENS / AVG_TOKENS_PER_WORD); // ~77

// Thai and similar scripts tokenize at roughly a token per character or two.
const MAX_CHARS = 2_000;
const OVERLAP_CHARS = 200;

export interface Chunk {
  content: string;
  position: number;
}

function sliceByChars(text: string): string[] {
  if (text.length <= MAX_CHARS) return [text];
  const out: string[] = [];
  for (let start = 0; start < text.length; start += MAX_CHARS - OVERLAP_CHARS) {
    out.push(text.slice(start, start + MAX_CHARS));
    if (start + MAX_CHARS >= text.length) break;
  }
  return out;
}

export function chunkText(raw: string): Chunk[] {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const words = text.split(" ");
  const windows: string[] = [];
  if (words.length <= WORDS_PER_CHUNK) {
    windows.push(text);
  } else {
    const step = WORDS_PER_CHUNK - OVERLAP_WORDS; // guaranteed > 0
    for (let start = 0; start < words.length; start += step) {
      const slice = words.slice(start, start + WORDS_PER_CHUNK);
      if (slice.length === 0) break;
      windows.push(slice.join(" "));
      if (start + WORDS_PER_CHUNK >= words.length) break;
    }
  }

  return windows.flatMap(sliceByChars).map((content, position) => ({ content, position }));
}

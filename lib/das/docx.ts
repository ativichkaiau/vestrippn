/**
 * DOCX text extraction via `mammoth` (raw text). Imported dynamically so the
 * route still loads if the dependency is absent; callers get a clear 503.
 */

export class DocxError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DocxError";
  }
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  let mammoth: typeof import("mammoth");
  try {
    mammoth = await import("mammoth");
  } catch {
    throw new DocxError("DOCX support unavailable: install 'mammoth'", 503);
  }

  try {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return value.trim();
  } catch (err) {
    throw new DocxError(
      `Failed to parse DOCX: ${err instanceof Error ? err.message : "unknown error"}`,
      422,
    );
  }
}

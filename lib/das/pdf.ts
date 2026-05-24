/**
 * PDF text extraction via `unpdf` — a pure-JS, serverless-safe build of
 * pdf.js (no native bindings, runs on Vercel). Imported dynamically so the
 * route still loads if the dependency is absent; callers get a clear 503.
 */

export class PdfError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PdfError";
  }
}

export interface PdfExtract {
  text: string;
  pages: number;
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<PdfExtract> {
  let unpdf: typeof import("unpdf");
  try {
    unpdf = await import("unpdf");
  } catch {
    throw new PdfError("PDF support unavailable: install 'unpdf'", 503);
  }

  try {
    const pdf = await unpdf.getDocumentProxy(new Uint8Array(buffer));
    const { text, totalPages } = await unpdf.extractText(pdf, { mergePages: true });
    return {
      text: (Array.isArray(text) ? text.join("\n") : text).trim(),
      pages: typeof totalPages === "number" ? totalPages : pdf.numPages ?? 0,
    };
  } catch (err) {
    throw new PdfError(
      `Failed to parse PDF: ${err instanceof Error ? err.message : "unknown error"}`,
      422,
    );
  }
}

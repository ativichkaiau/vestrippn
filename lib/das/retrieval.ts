import { prisma } from "@/lib/prisma";
import { embedTexts, toVectorLiteral } from "@/lib/das/embeddings";

/**
 * Retrieval for DAS chat: embed the query, then run a userId-scoped ANN search
 * over DocumentChunk using the HNSW cosine index (operator <=>).
 *
 * Raw SQL bypasses the scoped Prisma client, so userId is bound explicitly as a
 * parameter — every retrieval is hard-filtered to the caller's own documents.
 */

export interface RetrievedChunk {
  content: string;
  title: string;
  url: string | null;
  position: number;
}

export async function retrieveChunks(
  userId: string,
  query: string,
  topK = 6,
): Promise<RetrievedChunk[]> {
  const clean = query.trim();
  if (!clean) return [];

  const { vectors } = await embedTexts([clean]);
  if (vectors.length === 0) return [];
  const literal = toVectorLiteral(vectors[0]);

  const rows = await prisma.$queryRaw<RetrievedChunk[]>`
    SELECT dc."content"     AS "content",
           sd."title"       AS "title",
           sd."originalUrl" AS "url",
           dc."position"    AS "position"
    FROM "DocumentChunk" dc
    JOIN "StudyDocument" sd ON sd."id" = dc."documentId"
    WHERE dc."userId" = ${userId}
    ORDER BY dc."embedding" <=> ${literal}::vector
    LIMIT ${topK}`;

  return rows;
}

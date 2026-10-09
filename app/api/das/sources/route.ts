import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/owner";
import { forUser } from "@/lib/repositories/scoped";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/das/sources
 * -> [{ id, name, status, sourceType, pages?, chunks, addedAt }]  (current user's documents)
 */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const docs = await forUser(userId).studyDocument.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        sourceType: true,
        pages: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
    });

    return NextResponse.json(
      docs.map((doc) => ({
        id: doc.id,
        name: doc.title,
        status: doc.status,
        sourceType: doc.sourceType,
        pages: doc.pages ?? undefined,
        chunks: doc._count.chunks,
        addedAt: doc.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    // Degrade to an empty list rather than 500 (e.g. before migrations are applied).
    console.error("GET /api/das/sources failed:", err);
    return NextResponse.json([]);
  }
}

/**
 * DELETE /api/das/sources?id=<documentId>
 * Removes one of the caller's documents; its chunks cascade with it.
 * -> { deleted: 0 | 1 }
 */
export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Scoped deleteMany: userId is injected, so another user's document cannot match.
  const { count } = await forUser(userId).studyDocument.deleteMany({ where: { id } });
  if (!count) return NextResponse.json({ error: "Source not found" }, { status: 404 });
  return NextResponse.json({ deleted: count });
}

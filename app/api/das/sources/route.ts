import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/auth/owner";
import { forUser } from "@/lib/repositories/scoped";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/das/sources
 * -> [{ id, name, status, pages?, addedAt }]  (current user's documents)
 */
export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = forUser(userId);
    const docs = await db.studyDocument.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        pages: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      docs.map((d) => ({
        id: d.id,
        name: d.title,
        status: d.status,
        pages: d.pages ?? undefined,
        addedAt: d.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    // Degrade to empty state rather than 500 (e.g. before migrations are applied).
    console.error("GET /api/das/sources failed:", err);
    return NextResponse.json([]);
  }
}

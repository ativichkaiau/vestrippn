import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { forUser } from "@/lib/repositories/scoped";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/das/sources
 * -> [{ id, name, status, pages?, addedAt }]  (current user's documents)
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
}

import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/auth/owner";
import { forUser } from "@/lib/repositories/scoped";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/research/extract/:id
 * Removes one saved paper from the user's ResearchExtraction vault.
 * Scoped via forUser → deleteMany enforces WHERE id = :id AND userId = owner,
 * so a caller can never delete another user's row.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const db = forUser(userId);
  const { count } = await db.researchExtraction.deleteMany({ where: { id } });

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}

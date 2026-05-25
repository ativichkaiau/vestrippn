import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolve the acting user id, "skipping" interactive sign-in.
 *
 * Order: signed-in session → OWNER_EMAIL match → single-operator fallback
 * (the sole account). Same trust model as app/api/anki's resolveOwnerId.
 *
 * ⚠️ With the fallback, endpoints using this serve/modify the owner's data to
 * UNAUTHENTICATED callers. This is intentional for a private single-user
 * deployment — do NOT reuse for a multi-tenant or public app.
 */
export async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const ownerEmail = process.env.OWNER_EMAIL?.trim();
  if (ownerEmail) {
    const u = await prisma.user.findFirst({
      where: { email: { equals: ownerEmail, mode: "insensitive" } },
      select: { id: true },
    });
    if (u) return u.id;
  }

  // Single-operator fallback: if exactly one account exists, it's the owner.
  if ((await prisma.user.count()) === 1) {
    const only = await prisma.user.findFirst({ select: { id: true } });
    return only?.id ?? null;
  }

  return null;
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PRIMARY_EMAIL } from "@/lib/auth/allow-list";

/**
 * STRICT auth: the signed-in user's id, or null. There is no owner fallback:
 * anonymous callers get null. Use it on endpoints that
 * read private data or cost money (assistant, research writes/deletes) so they
 * cannot be driven by an unauthenticated request.
 */
export async function requireUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch (err) {
    console.error("requireUserId failed:", err);
    return null;
  }
}

// The owner id never changes, so memoize it after the first successful
// resolution. Only a POSITIVE result is cached — a null (no owner yet / DB
// down) stays uncached so a later sign-up or reconnect can still resolve.
let cachedOwnerId: string | null = null;

// The app's known primary owner. Mirrors PRIMARY_EMAIL in auth.ts so owner
// resolution keeps working even when no OWNER_EMAIL/ANKI_SYNC_EMAIL env var is
// set — which is exactly what silently broke Anki sync once a 2nd account
// signed in (the single-operator fallback stops resolving at 2+ accounts).
export const PRIMARY_OWNER_EMAIL = PRIMARY_EMAIL;

/**
 * Resolve the owner account id by email, trying (in priority order) a
 * caller-preferred email, the OWNER_EMAIL env, then the hardcoded primary
 * owner. Returns null if none match a user.
 */
export async function resolveOwnerByEmail(preferred?: string | null): Promise<string | null> {
  const candidates = [preferred, process.env.OWNER_EMAIL, PRIMARY_OWNER_EMAIL]
    .map((e) => e?.trim())
    .filter((e): e is string => Boolean(e));

  for (const email of candidates) {
    const u = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });
    if (u) return u.id;
  }
  return null;
}

/**
 * Whether a signed-in user is the owner (OWNER_EMAIL, else the primary
 * owner). Owner-credential integrations — Canvas grades and the Gmail/Canvas
 * feed run on the owner's tokens — are served to the owner only, never to
 * other accounts the allow-list lets in.
 */
export async function isOwner(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  try {
    if (!cachedOwnerId) cachedOwnerId = await resolveOwnerByEmail();
    return cachedOwnerId === userId;
  } catch (err) {
    console.error("isOwner failed:", err);
    return false;
  }
}

/** The signed-in user's id when that user is the owner; otherwise null. */
export async function requireOwnerId(): Promise<string | null> {
  const userId = await requireUserId();
  return (await isOwner(userId)) ? userId : null;
}

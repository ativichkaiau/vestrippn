import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// The app's known primary owner. Mirrors PRIMARY_EMAIL in auth.ts so owner
// resolution keeps working even when no OWNER_EMAIL/ANKI_SYNC_EMAIL env var is
// set — which is exactly what silently broke Anki sync once a 2nd account
// signed in (the single-operator fallback stops resolving at 2+ accounts).
export const PRIMARY_OWNER_EMAIL = "ativichkaiau2549@gmail.com";

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
 * Resolve the acting user id, "skipping" interactive sign-in.
 *
 * Order: signed-in session → owner-by-email (preferred/OWNER_EMAIL/primary) →
 * single-operator fallback (the sole account).
 *
 * ⚠️ With the fallback, endpoints using this serve/modify the owner's data to
 * UNAUTHENTICATED callers. This is intentional for a private single-user
 * deployment — do NOT reuse for a multi-tenant or public app.
 */
export async function resolveUserId(): Promise<string | null> {
  // Never throw — callers (incl. the dashboard server component) treat null as
  // "anonymous". A thrown auth/DB error here would blank the whole page.
  try {
    const session = await auth();
    if (session?.user?.id) return session.user.id;

    const byEmail = await resolveOwnerByEmail();
    if (byEmail) return byEmail;

    // Single-operator fallback: if exactly one account exists, it's the owner.
    if ((await prisma.user.count()) === 1) {
      const only = await prisma.user.findFirst({ select: { id: true } });
      return only?.id ?? null;
    }

    return null;
  } catch (err) {
    console.error("resolveUserId failed:", err);
    return null;
  }
}

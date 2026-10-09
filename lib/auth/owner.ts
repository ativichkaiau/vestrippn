import { unstable_rethrow } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * STRICT auth: the signed-in user's id, or null — there is no owner fallback,
 * so anonymous callers get null. The site is public: use this for anything
 * that reads or writes a user's data or costs money, so none of it can be
 * driven by an unauthenticated request.
 */
export async function requireUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch (err) {
    // Let Next's own signals through (e.g. "this page reads cookies, render it
    // per request") — swallowing them would prerender the page as anonymous.
    unstable_rethrow(err);
    console.error("requireUserId failed:", err);
    return null;
  }
}

// The app's known primary owner. Mirrors PRIMARY_EMAIL in auth.ts so owner
// resolution keeps working even when no OWNER_EMAIL/ANKI_SYNC_EMAIL env var is
// set — which is exactly what silently broke Anki sync once a 2nd account
// signed in (picking "the only account" stops working at 2+ accounts).
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

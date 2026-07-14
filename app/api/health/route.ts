import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flags, envReport } from "@/lib/env";
import { resolveOwnerByEmail } from "@/lib/auth/owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — lightweight status probe. Reports booleans only (never a
 * secret value). Surfaces the class of misconfig that used to sit silently
 * broken — notably `ankiOwnerResolved`, the exact check that would have caught
 * the Anki-sync outage. Returns 503 when a core requirement is down.
 */
export async function GET() {
  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch (e) {
    console.error("[health] DB ping failed:", e);
  }

  // The Anki add-on push 404s unless an owner account resolves — probe it.
  let ankiOwnerResolved = false;
  if (database) {
    try {
      ankiOwnerResolved = Boolean(await resolveOwnerByEmail(process.env.ANKI_SYNC_EMAIL));
    } catch {
      /* leave false */
    }
  }

  const { missingCritical } = envReport();
  const checks = {
    database,
    authSecret: flags.authSecret,
    canvas: flags.canvas,
    openai: flags.openai,
    ankiSync: flags.anki,
    ankiOwnerResolved,
    push: flags.push,
  };

  const ok = database && flags.authSecret && missingCritical.length === 0;
  return NextResponse.json(
    { ok, checks, service: "vestrippn", ts: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
}

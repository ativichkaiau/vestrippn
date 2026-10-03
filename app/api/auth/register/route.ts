import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { auth } from "@/auth";
import { PRIMARY_EMAIL } from "@/lib/auth/allow-list";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function canRegister(email: string) {
  if (process.env.LOCAL_SIGNUP_OPEN === "true") return true;
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase() || PRIMARY_EMAIL;
  return email === ownerEmail;
}

export async function POST(req: Request) {
  const limit = rateLimit(`register:${clientIp(req.headers)}`, 5, 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many sign-up attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }
  const body = (await req.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!canRegister(email)) {
    return NextResponse.json(
      { error: "Local signup is locked to the owner account" },
      { status: 403 },
    );
  }

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (existing?.passwordHash) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }
  // An account created through Google or LINE has no password. Only its own
  // signed-in owner may add one; otherwise anyone who knows the address could
  // set a password on it and sign in as them.
  if (existing) {
    const session = await auth().catch(() => null);
    if (session?.user?.id !== existing.id) {
      return NextResponse.json(
        { error: "This email already signs in with Google or LINE. Use that button instead." },
        { status: 409 },
      );
    }
  }

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: name || undefined,
        emailVerified: new Date(),
        passwordHash,
      },
      select: { id: true },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        emailVerified: new Date(),
        passwordHash,
      },
      select: { id: true },
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

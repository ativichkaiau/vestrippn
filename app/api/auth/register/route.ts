import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIMARY_EMAIL = "ativichkaiau2549@gmail.com";

function canRegister(email: string) {
  if (process.env.LOCAL_SIGNUP_OPEN === "true") return true;
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase() || PRIMARY_EMAIL;
  return email === ownerEmail;
}

export async function POST(req: Request) {
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

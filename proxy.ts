import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Page-route auth gate (Next 16 "proxy", formerly middleware). A fast
// session-cookie presence check — no DB, no adapter — that sends sessionless
// visitors to sign-in. The cryptographic check still happens in the page or
// route via auth(); this layer is the redirect and first gate, so private hubs
// (academics, workspace, analytics, …) are never server-rendered for an
// anonymous visitor.
//
// PUBLIC — the portfolio and learning surfaces, built only from fixed registry
// data or shared content banks: root (anonymous view), identity, systems,
// projects, medicine, research (documentation view), logs, garage, archive,
// contact, the clinical-case bank and IELTS practice, legal, sign-in, and the
// generated social-card images. Pages that can show private data check the
// session themselves and render a public variant without it.
//
// API routes self-gate (requireUserId) and are excluded from the matcher.
const PUBLIC_EXACT = new Set(["/"]);
const PUBLIC_PREFIXES = [
  "/auth",
  "/learn",
  "/legal",
  "/identity",
  "/systems",
  "/projects",
  "/medicine",
  "/research",
  "/logs",
  "/garage",
  "/archive",
  "/contact",
  "/opengraph-image",
  "/twitter-image",
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function hasSessionCookie(req: NextRequest): boolean {
  // Auth.js v5 uses `authjs.session-token` (`__Secure-` prefixed on HTTPS);
  // match by substring so a cookie-name change can't silently lock everyone out.
  return req.cookies.getAll().some((c) => c.name.includes("session-token"));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname) || hasSessionCookie(req)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/auth/signin";
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except API routes (self-gated), Next internals, and static files
  // (anything with a file extension).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

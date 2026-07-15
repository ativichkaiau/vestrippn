import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Page-route auth gate. Runs on the edge, so it does a fast session-cookie
// presence check (no DB / adapter) and redirects sessionless visitors to
// sign-in. The cryptographic check still happens in the page/route via auth()
// — this layer is the redirect + first gate so private hubs (dashboard,
// academics, research, …) aren't reachable, and their owner data isn't
// server-rendered, for an anonymous visitor.
//
// Public prefixes stay open: the sign-in flow, the public clinical-case bank,
// and legal pages. API routes self-gate (see requireUserId) and are excluded
// from the matcher below.
const PUBLIC_PREFIXES = ["/auth", "/learn", "/legal"];

function hasSessionCookie(req: NextRequest): boolean {
  // Auth.js v5 uses `authjs.session-token` (`__Secure-` prefixed on HTTPS);
  // match by substring so a cookie-name change can't silently lock everyone out.
  return req.cookies.getAll().some((c) => c.name.includes("session-token"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API routes (self-gated), Next internals, and static files
  // (anything with a file extension).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import type { NextConfig } from "next";
import path from "node:path";

// Sent with every response. The CSP covers what can be locked down without a
// per-request nonce (the inline pre-paint theme script rules out a strict
// script-src on static pages): no framing, no plugins, no <base> hijacking.
const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  turbopack: {
    // Claude worktrees live inside the main checkout (.claude/worktrees/…),
    // which also has a lockfile, so Next would infer the parent as the root
    // and resolve packages from the parent's node_modules. Pin it here; in the
    // main checkout this is exactly what Next infers anyway.
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

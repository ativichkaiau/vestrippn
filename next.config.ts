import type { NextConfig } from "next";
import path from "node:path";

// Sent with every response. The CSP covers what can be locked down without a
// per-request nonce (the inline pre-paint theme script rules out a strict
// script-src on static pages): no framing, no plugins, no <base> hijacking.
const SECURITY_HEADERS = [
  // Only this site may frame its pages (the split editor's side group).
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
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
  // Retired registry entries and pages: WilliamsHub is now listed as
  // Studyex_Medeetomihub (the old studyex entry is gone); the logs are gone.
  async redirects() {
    return [
      { source: '/systems/williamshub', destination: '/systems/studyex_medeetomihub', permanent: true },
      { source: '/systems/studyex', destination: '/systems/studyex_medeetomihub', permanent: true },
      { source: '/projects/williamshub', destination: '/projects/studyex_medeetomihub', permanent: true },
      { source: '/projects/studyex', destination: '/projects/studyex_medeetomihub', permanent: true },
      { source: '/logs/:path*', destination: '/', permanent: true },
      { source: '/logs', destination: '/', permanent: true },
    ];
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

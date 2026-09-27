import type { NextConfig } from "next";
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;

export default nextConfig;

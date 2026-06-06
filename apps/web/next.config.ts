import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emits .next/standalone — the production Docker image only needs that,
  // ~tens of MB instead of hundreds. Documented Next.js production pattern.
  output: "standalone",
};

export default nextConfig;

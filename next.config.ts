import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  devIndicators: false,
  distDir: process.env.FDE_TEST_BUILD_DIR || ".next",
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:page(download|changelog|privacy|terms|opengraph-image)", destination: "/:page", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/en" },
        { source: "/:page(download|changelog|privacy|terms|opengraph-image)", destination: "/en/:page" },
      ],
    };
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" },
      ],
    }];
  },
};

export default config;

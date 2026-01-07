import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",            // enables static export (next build -> out/)
  // Optional, nice URLs with trailing slash on static hosts (S3, GitHub Pages, etc.)
  trailingSlash: true,
  // If you ever use next/image, add:
  images: { unoptimized: true },
  async rewrites() {
    return [
      // Proxy v1
      {
        source: "/api/v1/:path*",
        destination: "https://naraiseki.nichi.in/api/v1/:path*",
        // destination: "https://api-v2-gose.naraiseki.org/api/v1/:path*",
        // destination: "https://api.gose.nichi.in/api/v1/:path*",
        // destination: "http://192.168.0.29:3000/api/v1/:path*",
        // destination: "https://api-gose.naraiseki.org/api/v1/:path*",
      },
      // Proxy v2
      {
        source: "/api/v2/:path*",
        destination: "https://naraiseki.nichi.in/api/v2/:path*",
        // destination: "https://api-v2-gose.naraiseki.org/api/v2/:path*",
        // destination: "https://api.gose.nichi.in/api/v2/:path*",
        // destination: "http://192.168.0.29:3000/api/v2/:path*",
        // destination: "https://api-gose.naraiseki.org/api/v2/:path*",
      },
    ];
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: false,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
    // Force NetworkOnly strategy for all requests to ensure no offline handling
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkOnly",
      },
    ],
  },
});

export default withPWA(nextConfig);

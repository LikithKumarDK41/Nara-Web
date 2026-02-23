import type { NextConfig } from "next";
// @ts-ignore
import withPWAInit from "next-pwa";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://naraiseki.nichi.in/api/v1/:path*",
      },
      {
        source: "/api/v2/:path*",
        destination: "https://naraiseki.nichi.in/api/v2/:path*",
      },
    ];
  },
};

const withPWA = withPWAInit({
  dest: "public",
  register: false, // We'll manually register the service worker
  skipWaiting: false,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/naraiseki\.nichi\.in\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "tourist-app-api",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.mapbox\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "mapbox-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
      },
    },
  ],
});

export default withPWA(nextConfig);

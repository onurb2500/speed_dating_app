import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // App shell + pages: network-first so fresh content wins when online.
        urlPattern: ({ request }) =>
          request.mode === "navigate" || request.destination === "document",
        handler: "NetworkFirst",
        options: { cacheName: "pages", networkTimeoutSeconds: 3 },
      },
      {
        // Feed metadata: network-first, fall back to cache offline.
        urlPattern: ({ url }) => url.pathname.startsWith("/feed"),
        handler: "NetworkFirst",
        options: { cacheName: "feed-metadata" },
      },
      {
        // Static assets: cache-first.
        urlPattern: ({ request }) =>
          ["style", "script", "image", "font"].includes(request.destination),
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);

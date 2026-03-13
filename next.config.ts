import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "supabase-rest-api",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:wav|mp3|ogg)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "audio-samples",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
});

export default withPWA({
  // Your Next.js config here
  turbopack: {},
});

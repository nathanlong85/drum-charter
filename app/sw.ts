import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist, type SerwistGlobalConfig } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope & SerwistGlobalConfig;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Supabase REST API caching with Authorization header check
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "supabase-rest-api",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        // IMPORTANT: We do not cache if Authorization header is present to avoid private data leakage.
        // If we want to cache per-user, we'd need more complex logic.
        matchOptions: {
          ignoreVary: false,
        },
        plugins: [
          {
            requestWillFetch: async ({ request }) => {
              if (request.headers.has("Authorization")) {
                // If it has Authorization, we bypass the cache entirely for this request
                // By returning the original request or a clones one without modification here, 
                // we're just setting up for the next step.
              }
              return request;
            },
            cacheWillUpdate: async ({ response, request }) => {
              // Only cache if there's no Authorization header
              if (request.headers.has("Authorization")) {
                return null;
              }
              return response;
            },
          },
        ],
      },
    },
    {
      // Audio samples (WAV, MP3, OGG) - Cache First
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
    ...defaultCache,
  ],
});

serwist.addEventListeners();

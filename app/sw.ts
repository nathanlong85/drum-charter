/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import type { SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin } from "@serwist/expiration";
import { CacheFirst, StaleWhileRevalidate } from "@serwist/strategies";

declare const self: ServiceWorkerGlobalScope & SerwistGlobalConfig & { __SW_MANIFEST: any };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Supabase REST API caching with Authorization header check
      matcher: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
      handler: new StaleWhileRevalidate({
        cacheName: "supabase-rest-api",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
          {
            cacheWillUpdate: async ({ response, request }) => {
              // Only cache if there's no Authorization header to avoid private data leakage.
              if (request.headers.has("Authorization")) {
                return null;
              }
              return response;
            },
            cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
              // Only use from cache if there's no Authorization header.
              // This prevents authenticated requests from reading anonymous cached data,
              // ensuring strict isolation.
              if (request.headers.has("Authorization")) {
                return undefined;
              }
              return cachedResponse;
            },
          },
        ],
      }),
    },
    {
      // Audio samples (WAV, MP3, OGG) - Cache First
      matcher: /\.(?:wav|mp3|ogg)$/i,
      handler: new CacheFirst({
        cacheName: "audio-samples",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

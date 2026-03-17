/// <reference lib="webworker" />

import { ExpirationPlugin } from '@serwist/expiration';
import { defaultCache } from '@serwist/next/worker';
import { CacheFirst, StaleWhileRevalidate } from '@serwist/strategies';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare const self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig & { __SW_MANIFEST: (PrecacheEntry | string)[] | undefined };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST || [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Supabase REST API caching with Authorization header check
      matcher: ({ request, url }) => {
        // Only match if it's a Supabase REST v1 URL AND not an authenticated request.
        // This ensures authenticated requests bypass this specific cache handler entirely.
        // We explicitly check for the Authorization header.
        return (
          /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/.test(url.href) &&
          !request.headers.has('Authorization')
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: 'supabase-rest-api',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
          {
            cacheWillUpdate: async ({ response, request }) => {
              // Safety fallback: only cache if no Authorization header and response is OK.
              if (request.headers.has('Authorization') || !response || !response.ok) {
                return null;
              }
              return response;
            },
            cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
              // Safety fallback: only use cache if no Authorization header.
              // This is the critical "read" check to prevent serving anonymous data to auth'd users.
              if (request.headers.has('Authorization')) {
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
      // Restrict to same-origin sample assets to avoid third-party storage pressure.
      matcher: ({ sameOrigin, url, request }) =>
        sameOrigin &&
        request.method === 'GET' &&
        request.destination === 'audio' &&
        url.pathname.startsWith('/audio/') &&
        /\.(?:wav|mp3|ogg)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: 'audio-samples',
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

'use client';

import { Serwist } from '@serwist/window';
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (
        window.location.hostname !== 'localhost' ||
        process.env.NODE_ENV === 'production'
      ) {
        const serwist = new Serwist('/sw.js', { scope: '/' });

        serwist.register().catch((err) => {
          console.error('Service worker registration failed:', err);
        });
      }
      // For local development testing, we can force registration if needed
      else if (process.env.NEXT_PUBLIC_FORCE_SW === 'true') {
        const serwist = new Serwist('/sw.js', { scope: '/' });
        serwist.register().catch((err) => {
          console.error('Service worker registration failed:', err);
        });
      }
    }
  }, []);

  return null;
}

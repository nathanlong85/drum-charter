'use client';

import { Serwist } from '@serwist/window';
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '::1' ||
        window.location.hostname.startsWith('127.') ||
        window.location.hostname.endsWith('.localhost');

      const shouldRegister =
        !isLocalhost ||
        process.env.NODE_ENV === 'production' ||
        process.env.NEXT_PUBLIC_FORCE_SW === 'true';

      if (shouldRegister) {
        const serwist = new Serwist('/sw.js', { scope: '/' });

        serwist.register().catch((err) => {
          console.error('Service worker registration failed:', err);
        });
      }
    }
  }, []);

  return null;
}

'use client';

import { useEffect, useState } from 'react';

export type SupabaseStatus = 'connected' | 'connecting' | 'offline';

export function useSupabaseStatus(): SupabaseStatus {
  const [status, setStatus] = useState<SupabaseStatus>('connecting');

  useEffect(() => {
    let isMounted = true;

    const checkConnectivity = async () => {
      // First check navigator.onLine
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        if (isMounted) setStatus('connected');
        return;
      }

      // Use AbortController + setTimeout for wider browser support than AbortSignal.timeout
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      if (controller) {
        timeoutId = setTimeout(() => controller.abort(), 5000);
      }

      // Verify by trying to reach the local server
      try {
        const response = await fetch('/manifest.json', {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller ? controller.signal : undefined,
        });

        if (response.ok && isMounted) {
          setStatus('connected');
          return;
        }
      } catch (_err) {
        // Truly offline
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      if (isMounted) setStatus('offline');
    };

    checkConnectivity();

    const handleOnline = () => setStatus('connected');
    const handleOffline = () => checkConnectivity();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      // We check connectivity regardless of current state to ensure we recover
      checkConnectivity();
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []); // Status removed from dependencies to stabilize listeners

  return status;
}

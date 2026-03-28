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

      // Verify by trying to reach the local server
      try {
        const response = await fetch('/manifest.json', {
          method: 'HEAD',
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        });
        
        if (response.ok && isMounted) {
          setStatus('connected');
          return;
        }
      } catch (_err) {
        // Truly offline
      }

      if (isMounted) setStatus('offline');
    };

    checkConnectivity();

    const handleOnline = () => setStatus('connected');
    const handleOffline = () => checkConnectivity();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      if (status === 'offline') checkConnectivity();
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [status]);

  return status;
}

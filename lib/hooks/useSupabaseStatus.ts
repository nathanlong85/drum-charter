'use client';

import { useEffect, useState } from 'react';

export type SupabaseStatus = 'connected' | 'connecting' | 'offline';

export function useSupabaseStatus(): SupabaseStatus {
  const [status, setStatus] = useState<SupabaseStatus>('connecting');

  useEffect(() => {
    const updateStatus = () => {
      // Base status on network connectivity for now as a proxy for realtime health
      // In a real app, we would listen to supabase.auth.onAuthStateChange
      // or check the actual realtime channel status.
      setStatus(navigator.onLine ? 'connected' : 'offline');
    };

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return status;
}

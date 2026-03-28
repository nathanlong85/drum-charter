'use client';

import { WifiOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkConnectivity = async () => {
      // First check navigator.onLine as it's the fastest
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        if (isMounted) setIsOffline(false);
        return;
      }

      // If navigator says offline, verify by trying to reach the local server
      // This helps in environments where navigator.onLine is unreliable
      try {
        const response = await fetch('/manifest.json', {
          method: 'HEAD',
          cache: 'no-store',
          // Small timeout to avoid hanging
          signal: AbortSignal.timeout(3000),
        });
        
        if (response.ok && isMounted) {
          setIsOffline(false);
          return;
        }
      } catch (_err) {
        // Truly offline or server unreachable
      }

      if (isMounted) setIsOffline(true);
    };

    // Initial check
    checkConnectivity();

    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
    };
    const handleOffline = () => {
      // When browser reports offline, double check
      checkConnectivity();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 30 seconds if we are marked as offline
    const interval = setInterval(() => {
      if (isOffline) checkConnectivity();
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOffline]);

  if (!isOffline || isDismissed) return null;

  return (
    <div
      className="fixed bottom-20 right-4 bg-amber-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-right-8 duration-300 border border-white/20"
      role="alert"
    >
      <div className="bg-white/20 p-2 rounded-lg">
        <WifiOff size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black uppercase tracking-widest leading-none mb-1 text-white">
          Network Issue
        </span>
        <span className="text-[10px] font-medium opacity-90 leading-tight max-w-[180px] text-amber-50">
          Browser reports you are offline. Some features may be limited.
        </span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="ml-2 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(() => {
    // SSR-safe check for navigator availability
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  useEffect(() => {
    // Re-check initial state on mount to handle hydration mismatches
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 animate-bounce motion-reduce:animate-none"
      role="alert"
    >
      <WifiOff size={18} />
      <span className="text-sm font-medium">You are offline. Some features may be limited.</span>
    </div>
  );
}

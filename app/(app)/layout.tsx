import { type ReactNode, Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center animate-pulse text-primary font-headline font-black uppercase tracking-widest">
          Initialising...
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

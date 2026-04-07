import { type ReactNode, Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await supabaseService.getProfile(user.id, supabase) : null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center animate-pulse text-primary font-headline font-black uppercase tracking-widest">
          Initialising...
        </div>
      }
    >
      <AppShell initialUser={user} initialProfile={profile}>
        {children}
      </AppShell>
    </Suspense>
  );
}

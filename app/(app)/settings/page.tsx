import { Suspense } from 'react';
import SettingsView from '@/components/settings/SettingsView';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 uppercase tracking-wide">
          Authentication Required
        </h2>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Please sign in to access your mission control and personalization settings.
        </p>
      </div>
    );
  }

  // Fetch profile with Suspense-like behavior (handled by the page itself for now)
  const profile = await supabaseService.getProfile(user.id, supabase);

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
        <h1 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
          Settings
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsView profile={profile} />
        </Suspense>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6 animate-pulse">
      <div className="h-10 w-48 bg-surface-container-highest rounded-lg mb-4" />
      <div className="h-4 w-64 bg-surface-container-highest rounded mb-8" />

      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 bg-surface-container-low rounded-[32px] border border-outline-variant/10 shadow-xl"
          />
        ))}
      </div>
    </div>
  );
}

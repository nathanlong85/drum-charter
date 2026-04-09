import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { SetlistEditor } from '@/components/setlist/SetlistEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

interface SetlistPageProps {
  params: Promise<{ id: string }>;
}

export default async function SetlistPage({ params }: SetlistPageProps) {
  const [{ id }, supabase] = await Promise.all([params, createClient()]);

  const [authResult, setlistResult] = await Promise.allSettled([
    supabase.auth.getUser(),
    supabaseService.getSetlist(id, supabase),
  ]);

  if (authResult.status === 'rejected' || !authResult.value.data.user) {
    redirect('/login');
  }

  if (setlistResult.status === 'rejected') {
    const error = setlistResult.reason;
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    console.error('Error loading setlist:', error);
    throw error;
  }

  const formattedSetlist = setlistResult.value;

  const _user = authResult.value.data.user;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <nav className="bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-8 mb-8 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href="/library"
              className="text-xs font-headline font-black text-on-surface-variant/60 hover:text-primary flex items-center gap-2 transition-all uppercase tracking-widest"
              aria-label="Back to Library"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Library
            </Link>
            <div className="text-[10px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-[0.2em] hidden sm:block">
              DrumCharter / Setlist / {id.slice(0, 8)}
            </div>
          </div>
          <AuthStatus />
        </div>
      </nav>

      <SetlistEditor initialSetlist={formattedSetlist} />
    </div>
  );
}

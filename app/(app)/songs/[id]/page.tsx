import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import SongEditor from '@/components/chart/SongEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

interface SongPageProps {
  params: Promise<{ id: string }>;
}

export default async function SongPage({ params }: SongPageProps) {
  const [{ id }, supabase] = await Promise.all([params, createClient()]);

  const [authResult, rawChartResult] = await Promise.allSettled([
    supabase.auth.getUser(),
    supabaseService.getSongChart(id, supabase),
  ]);

  if (authResult.status === 'rejected' || !authResult.value.data.user) {
    redirect('/login');
  }

  if (rawChartResult.status === 'rejected') {
    const error = rawChartResult.reason;
    // Trigger notFound for "no rows" PostgREST error (PGRST116) or thrown "not found" message
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    console.error('Error loading song chart:', error);
    throw error; // Rethrow real DB/network failures
  }

  const rawChart = rawChartResult.value;

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div>
          <div className="flex items-center gap-3 text-primary font-headline text-xs font-bold uppercase tracking-[0.3em] mb-4">
            <Link
              href="/library/songs"
              className="hover:text-primary-dim flex items-center gap-2 transition-colors"
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
              BACK TO LIBRARY
            </Link>
            <div className="text-on-surface-variant/40 hidden sm:block">
              DrumCharter / Song / {id.slice(0, 8)}
            </div>
          </div>
        </div>
      </section>

      <ViewTransition name={`song-card-${id}`} share="morph">
        <SongEditor initialSong={rawChart} />
      </ViewTransition>
    </div>
  );
}

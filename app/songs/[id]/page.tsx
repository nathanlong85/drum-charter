import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AuthStatus } from '@/components/auth/AuthStatus';
import SongEditor from '@/components/chart/SongEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { SongChart } from '@/lib/types/groove';

interface SongPageProps {
  params: Promise<{ id: string }>;
}

export default async function SongPage({ params }: SongPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let rawChart: SongChart;
  try {
    rawChart = await supabaseService.getSongChart(id, supabase);
  } catch (error: any) {
    // Trigger notFound for "no rows" PostgREST error (PGRST116) or thrown "not found" message
    if (error?.code === 'PGRST116' || error?.message?.includes('not found')) {
      notFound();
    }

    console.error('Error loading song chart:', error);
    throw error; // Rethrow real DB/network failures
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 py-4 px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href="/library"
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              BACK TO LIBRARY
            </Link>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest hidden sm:block">
              DrumCharter / Song / {id.slice(0, 8)}
            </div>
          </div>
          <AuthStatus />
        </div>
      </nav>

      <main className="py-8">
        <SongEditor initialSong={rawChart} />
      </main>
    </div>
  );
}

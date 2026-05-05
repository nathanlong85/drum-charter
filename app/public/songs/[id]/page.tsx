import { Music } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SongChartView } from '@/components/chart/SongChartView';
import PrintButton from '@/components/common/PrintButton';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { SongChart } from '@/lib/types/groove';

interface PublicSongPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicSongPage({ params }: PublicSongPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let song: SongChart;
  try {
    song = await supabaseService.getSongChart(id, supabase);
  } catch (error: unknown) {
    // Trigger notFound for "no rows" PostgREST error (PGRST116) or thrown "not found" message
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    console.error('Error loading public song:', error);
    throw error;
  }

  if (!song.isPublic) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-surface py-12 px-6 print:bg-white print:p-0 selection:bg-primary/30 selection:text-primary">
      <div className="max-w-5xl mx-auto bg-surface-container rounded-[32px] overflow-hidden border border-outline-variant/10 shadow-2xl shadow-black/20 print:shadow-none print:rounded-none">
        <div className="bg-surface-container-low px-8 py-6 flex justify-between items-center no-print border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-lg">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-headline font-black uppercase tracking-[0.3em] text-on-surface-variant">
              Public Architecture View
            </span>
          </div>
          <PrintButton />
        </div>
        <div className="p-4 md:p-8">
          <SongChartView chart={song} />
        </div>
      </div>
      <footer className="max-w-4xl mx-auto mt-12 text-center no-print space-y-4">
        <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.4em]">
          Created via DrumCharter
        </p>
        <p className="text-xs font-headline font-bold text-on-surface-variant uppercase tracking-widest">
          Create your own at{' '}
          <Link href="/" className="text-primary hover:text-primary-dim transition-colors">
            DrumCharter.app
          </Link>
        </p>
      </footer>
    </main>
  );
}

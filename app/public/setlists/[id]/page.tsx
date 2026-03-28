import { ListMusic } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/common/PrintButton';
import { SetlistView } from '@/components/setlist/SetlistView';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { Setlist } from '@/lib/types/groove';

interface PublicSetlistPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicSetlistPage({ params }: PublicSetlistPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let setlist: Setlist;
  try {
    setlist = await supabaseService.getSetlist(id, supabase);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    console.error('Error loading public setlist:', error);
    throw error;
  }

  if (!setlist.isPublic) {
    notFound();
  }

  // Pre-fetch song titles server-side to avoid client-side RLS issues on public pages
  const songIds = Array.from(new Set(setlist.songs.map((s) => s.songId)));
  const songTitlesRes = await supabaseService.getSongTitles(songIds, supabase);
  const songTitles: Record<string, string> = {};
  if (songTitlesRes) {
    songTitlesRes.forEach((s) => {
      songTitles[s.id] = s.title;
    });
  }

  return (
    <main className="min-h-screen bg-surface py-12 px-6 print:bg-white print:p-0 selection:bg-primary/30 selection:text-primary">
      <div className="max-w-5xl mx-auto bg-surface-container rounded-[32px] overflow-hidden border border-outline-variant/10 shadow-2xl shadow-black/20 print:shadow-none print:rounded-none">
        <div className="bg-surface-container-low px-8 py-6 flex justify-between items-center no-print border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-secondary/20 flex items-center justify-center rounded-lg">
              <ListMusic className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-[10px] font-headline font-black uppercase tracking-[0.3em] text-on-surface-variant">
              Public Setlist View
            </span>
          </div>
          <PrintButton />
        </div>
        <div className="p-8 md:p-12">
          <SetlistView setlist={setlist} initialSongTitles={songTitles} />
        </div>
      </div>
      <footer className="max-w-4xl mx-auto mt-12 text-center no-print space-y-4">
        <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.4em]">
          Set Architecture by DrumCharter
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

'use client';

import { supabaseService } from '@/lib/services/supabase-service';
import { notFound } from 'next/navigation';
import { SongChartView } from '@/components/chart/SongChartView';
import { SongChart } from '@/lib/types/groove';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PublicSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [song, setSong] = useState<SongChart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      const { id } = await params;
      try {
        const data = await supabaseService.getSongChart(id);
        
        if (!data || !data.isPublic) {
          setLoading(false);
          return;
        }

        setSong(data);
      } catch (error) {
        console.error('Error fetching public song:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-zinc-400 font-mono tracking-widest uppercase">Loading Chart...</div>
      </div>
    );
  }

  if (!song) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-zinc-200 rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="bg-zinc-900 text-white px-8 py-4 flex justify-between items-center no-print">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em]">DrumCharter Public View</h2>
          <button 
            onClick={() => window.print()} 
            className="text-xs font-bold border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition-all"
          >
            PRINTER FRIENDLY
          </button>
        </div>
        <SongChartView chart={song} />
      </div>
      <footer className="max-w-4xl mx-auto mt-8 text-center no-print">
        <p className="text-sm text-zinc-400">
          Create your own charts at <Link href="/" className="text-blue-600 font-bold hover:underline">DrumCharter.com</Link>
        </p>
      </footer>
    </main>
  );
}

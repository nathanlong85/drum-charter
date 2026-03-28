'use client';

import { Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabaseService } from '@/lib/services/supabase-service';
import type { Setlist } from '@/lib/types/groove';

interface SetlistViewProps {
  setlist: Setlist;
  /**
   * Optional map of songId -> title, usually provided when titles are fetched server-side
   * to avoid client-side RLS issues on public pages.
   */
  initialSongTitles?: Record<string, string>;
}

export function SetlistView({ setlist, initialSongTitles }: SetlistViewProps) {
  const [songTitles, setSongTitles] = useState<Record<string, string>>(initialSongTitles ?? {});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialSongTitles);

  useEffect(() => {
    // If titles were provided via props, we don't need to fetch them
    if (initialSongTitles) {
      setSongTitles(initialSongTitles);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadTitles = async () => {
      setIsLoading(true);
      try {
        const songs = await supabaseService.listSongCharts();
        if (songs && isMounted) {
          const titleMap: Record<string, string> = {};
          songs.forEach((s) => {
            titleMap[s.id] = s.title;
          });
          setSongTitles(titleMap);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load song titles:', err);
          setError('Failed to load composition titles. Please try refreshing the page.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadTitles();

    return () => {
      isMounted = false;
    };
  }, [initialSongTitles]);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl lg:text-6xl font-headline font-black tracking-tighter text-on-surface leading-tight uppercase">
          {setlist.title}
        </h1>
        <div className="flex items-center gap-4 text-secondary font-label uppercase tracking-[0.3em] text-[10px] font-black">
          <span>Setlist</span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary/40"></span>
          <span>{setlist.songs.length} Compositions</span>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-error text-[10px] font-headline font-black uppercase tracking-widest text-center">
          {error}
        </div>
      )}

      <div className="bg-surface-container-low/30 rounded-[32px] border border-outline-variant/10 overflow-hidden shadow-inner">
        {setlist.songs.length === 0 ? (
          <div className="p-24 text-center text-on-surface-variant font-label font-black uppercase tracking-[0.3em] text-[10px] opacity-40">
            Empty Setlist
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/5">
            {setlist.songs.map((song, idx) => (
              <div
                key={`${song.songId}-${idx}`}
                className="flex items-center p-8 hover:bg-surface-container-high transition-all"
              >
                <div className="flex items-center gap-6 w-24">
                  <span className="text-sm font-headline font-black text-primary">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 font-headline font-bold text-2xl text-on-surface">
                  {isLoading ? 'Loading...' : songTitles[song.songId] || 'Composition Not Found'}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="pt-12 text-center opacity-40">
        <p className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-[0.3em]">
          DrumCharter Setlist Module v1.0
        </p>
      </footer>
    </div>
  );
}

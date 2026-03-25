'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAutosave } from '@/lib/hooks/useAutosave';
import { supabaseService } from '@/lib/services/supabase-service';
import type { Setlist, SetlistItem } from '@/lib/types/groove';

interface SetlistEditorProps {
  initialSetlist: Setlist;
}

export function SetlistEditor({ initialSetlist }: SetlistEditorProps) {
  const router = useRouter();
  const [setlist, setSetlist] = useState<Setlist>(initialSetlist);
  const isMounted = useRef(true);
  const isInitialRender = useRef(true);

  // Available songs to add to the setlist
  const [availableSongs, setAvailableSongs] = useState<{ id: string; title: string }[]>([]);
  const [isSelectingSong, setIsSelectingSong] = useState(false);

  const {
    isSaving,
    error: saveError,
    triggerSave,
    settleAutosave,
    cancelAutosave,
  } = useAutosave<Setlist>((dataToSave) => supabaseService.saveSetlist(dataToSave), 1000);

  useEffect(() => {
    isMounted.current = true;
    const loadSongs = async () => {
      try {
        const songs = await supabaseService.listSongCharts();
        if (songs && isMounted.current) {
          setAvailableSongs(songs.map((s) => ({ id: s.id, title: s.title })));
        }
      } catch (err) {
        console.error('Failed to load available songs:', err);
      }
    };
    loadSongs();
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Autosave when setlist changes
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    triggerSave(setlist);
  }, [setlist, triggerSave]);

  const updateSetlist = (updates: Partial<Setlist>) => {
    setSetlist((prev) => ({ ...prev, ...updates }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSetlist({ title: e.target.value });
  };

  const handleVisibilityToggle = () => {
    updateSetlist({ isPublic: !setlist.isPublic });
  };

  const addSong = (songId: string) => {
    const newSong: SetlistItem = {
      songId,
      order: setlist.songs.length,
    };
    updateSetlist({ songs: [...setlist.songs, newSong] });
    setIsSelectingSong(false);
  };

  const removeSong = (indexToRemove: number) => {
    const updatedSongs = setlist.songs
      .filter((_, idx) => idx !== indexToRemove)
      .map((song, newIdx) => ({ ...song, order: newIdx })); // Re-normalize order
    updateSetlist({ songs: updatedSongs });
  };

  const moveSong = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === setlist.songs.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSongs = [...setlist.songs];
    const temp = newSongs[index];
    newSongs[index] = newSongs[newIndex];
    newSongs[newIndex] = temp;

    // Re-normalize order
    const updatedSongs = newSongs.map((song, idx) => ({ ...song, order: idx }));
    updateSetlist({ songs: updatedSongs });
  };

  const getSongTitle = (songId: string) => {
    return availableSongs.find((s) => s.id === songId)?.title || 'Unknown Song';
  };

  return (
    <div data-testid="setlist-editor-root" className="min-h-screen bg-surface">
      <div data-testid="setlist-editor-container" className="flex flex-col h-full">
        {/* Top Actions */}
        <div className="absolute top-4 right-8 no-print flex gap-2 z-50">
          {setlist.isPublic && (
            <>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/public/setlists/${setlist.id}`,
                    );
                    alert('Public link copied to clipboard!');
                  } catch (_err) {
                    alert(
                      `Failed to copy link. Here it is: ${window.location.origin}/public/setlists/${setlist.id}`,
                    );
                  }
                }}
                className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] uppercase tracking-widest"
              >
                Copy Link
              </button>
              <a
                href={`/public/setlists/${setlist.id}`}
                target="_blank"
                className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] uppercase tracking-widest"
                rel="noopener noreferrer"
              >
                View Public
              </a>
            </>
          )}
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this setlist?')) {
                try {
                  // Prevent any further autosaves
                  cancelAutosave();
                  await settleAutosave();

                  await supabaseService.deleteSetlist(setlist.id);
                  router.push('/library');
                } catch (error) {
                  console.error('Failed to delete setlist:', error);
                  alert('Failed to delete setlist.');
                }
              }
            }}
            className="flex items-center gap-2 bg-surface-container-highest text-error px-4 py-2 rounded-lg font-bold hover:bg-error/10 transition-all text-[10px] uppercase tracking-widest"
          >
            Delete
          </button>
        </div>

        {/* Setlist Header Section */}
        <section className="p-8 pb-4 pt-16 md:pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 w-full max-w-2xl">
              <div className="flex items-center gap-4 text-secondary font-headline uppercase tracking-[0.2em] text-xs font-bold">
                <span>Setlist</span>
                <span className="w-1 h-1 rounded-full bg-secondary/40"></span>
                <span className="text-on-surface-variant flex gap-2 items-center">
                  {saveError ? (
                    <span className="text-error">{saveError}</span>
                  ) : isSaving ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <span>Saved</span>
                  )}
                </span>
                <span className="w-1 h-1 rounded-full bg-secondary/40"></span>
                <button
                  onClick={handleVisibilityToggle}
                  data-testid="toggle-public-button"
                  className={setlist.isPublic ? 'text-green-400' : 'text-on-surface-variant'}
                >
                  {setlist.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </button>
              </div>
              <input
                type="text"
                value={setlist.title}
                onChange={handleTitleChange}
                className="text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-on-surface bg-transparent border-none focus:ring-0 w-full p-0"
                placeholder="Setlist Title"
              />
            </div>
          </div>
        </section>

        {/* Setlist Content */}
        <section className="flex-1 p-8 pt-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight">
                Set Sequence
              </h2>
              <button
                onClick={() => setIsSelectingSong(!isSelectingSong)}
                className="flex items-center gap-2 text-[10px] font-headline font-bold text-primary hover:text-primary-dim uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full transition-all"
              >
                <Plus size={14} />
                Add Composition
              </button>
            </div>

            {isSelectingSong && (
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-xl animate-in fade-in slide-in-from-top-4">
                <h3 className="text-[10px] font-headline font-black text-on-surface-variant uppercase tracking-[0.3em] mb-6 ml-1">
                  Select Repository Item
                </h3>
                {availableSongs.length === 0 ? (
                  <p className="text-sm text-on-surface-variant font-body p-4 italic text-center">
                    No compositions found in your library.
                  </p>
                ) : (
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {availableSongs.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => addSong(song.id)}
                        className="text-left px-6 py-4 rounded-2xl bg-surface-container-highest border border-transparent hover:border-primary/30 hover:bg-surface-bright transition-all text-sm font-headline font-bold text-on-surface flex items-center justify-between group"
                      >
                        {song.title}
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-surface-container rounded-[32px] border border-outline-variant/10 overflow-hidden shadow-sm">
              {setlist.songs.length === 0 ? (
                <div className="p-20 text-center text-on-surface-variant font-headline uppercase tracking-widest text-xs opacity-40">
                  Initial set is empty. <br />
                  Add compositions to begin.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/5">
                  {setlist.songs.map((song, idx) => (
                    <div
                      key={`${song.songId}-${idx}`}
                      className="flex items-center p-6 hover:bg-surface-container-high group transition-all"
                    >
                      <div className="flex items-center gap-4 w-20">
                        <span className="text-xs font-headline font-black text-primary/40 group-hover:text-primary transition-colors">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex-1 font-headline font-bold text-lg text-on-surface group-hover:translate-x-1 transition-transform">
                        {getSongTitle(song.songId)}
                      </div>

                      <div className="flex items-center gap-3 z-10">
                        <button
                          onClick={() => moveSong(idx, 'up')}
                          disabled={idx === 0}
                          className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-10 rounded-xl bg-surface-container-highest transition-all focus:ring-2 focus:ring-primary outline-none"
                          title="Move Up"
                          aria-label={`Move ${getSongTitle(song.songId)} up`}
                          type="button"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveSong(idx, 'down')}
                          disabled={idx === setlist.songs.length - 1}
                          className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-10 rounded-xl bg-surface-container-highest transition-all focus:ring-2 focus:ring-primary outline-none"
                          title="Move Down"
                          aria-label={`Move ${getSongTitle(song.songId)} down`}
                          type="button"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div className="w-[1px] h-6 bg-outline-variant/20 mx-1"></div>
                        <button
                          onClick={() => removeSong(idx)}
                          className="p-2 text-on-surface-variant hover:text-error rounded-xl bg-surface-container-highest transition-all focus:ring-2 focus:ring-error outline-none"
                          title="Remove from Setlist"
                          aria-label={`Remove ${getSongTitle(song.songId)} from setlist`}
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="mt-24 pb-12 text-center">
          <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
            DrumCharter Setlist Module v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}

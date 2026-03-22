'use client';

import { debounce } from 'lodash';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabaseService } from '@/lib/services/supabase-service';
import type { Setlist, SetlistItem } from '@/lib/types/groove';

interface SetlistEditorProps {
  initialSetlist: Setlist;
}

export function SetlistEditor({ initialSetlist }: SetlistEditorProps) {
  const [setlist, setSetlist] = useState<Setlist>(initialSetlist);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Available songs to add to the setlist
  const [availableSongs, setAvailableSongs] = useState<{ id: string; title: string }[]>([]);
  const [isSelectingSong, setIsSelectingSong] = useState(false);

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

  const saveToSupabaseRef = useRef(
    debounce(async (dataToSave: Setlist) => {
      try {
        if (isMounted.current) {
          setIsSaving(true);
          setSaveError(null);
        }
        await supabaseService.saveSetlist(dataToSave);
      } catch (err) {
        console.error('Failed to save setlist:', err);
        if (isMounted.current) {
          setSaveError('Failed to save changes');
        }
      } finally {
        if (isMounted.current) {
          setIsSaving(false);
        }
      }
    }, 1000),
  );

  const saveToSupabase = saveToSupabaseRef.current;

  // Autosave when setlist changes
  useEffect(() => {
    // Skip the first render to avoid redundant save
    if (setlist !== initialSetlist) {
      saveToSupabase(setlist);
    }
  }, [setlist, saveToSupabase, initialSetlist]);

  // Cleanup the debounced function on unmount
  useEffect(() => {
    return () => {
      saveToSupabase.flush();
    };
  }, [saveToSupabase]);

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
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={setlist.title}
              onChange={handleTitleChange}
              placeholder="Setlist Title"
              className="w-full text-3xl font-black text-zinc-900 bg-transparent border-0 border-b-2 border-transparent hover:border-zinc-200 focus:border-blue-500 focus:ring-0 px-0 mb-2 transition-colors placeholder:text-zinc-300 outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            {saveError ? (
              <span className="text-red-500 text-sm">{saveError}</span>
            ) : isSaving ? (
              <span className="text-zinc-400 text-sm flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="text-emerald-500 text-sm font-medium">Saved</span>
            )}

            <button
              onClick={handleVisibilityToggle}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                setlist.isPublic
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {setlist.isPublic ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Public
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Private
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Setlist Songs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Songs</h2>
          <button
            onClick={() => setIsSelectingSong(!isSelectingSong)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-md"
          >
            <Plus size={16} />
            Add Song
          </button>
        </div>

        {isSelectingSong && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Select a Song
            </h3>
            {availableSongs.length === 0 ? (
              <p className="text-sm text-zinc-500">No songs found in your library.</p>
            ) : (
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                {availableSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => addSong(song.id)}
                    className="text-left px-4 py-3 rounded-md border border-zinc-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium text-zinc-800"
                  >
                    {song.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          {setlist.songs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No songs in this setlist yet. Click &quot;Add Song&quot; to get started.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {setlist.songs.map((song, idx) => (
                <div
                  key={`${song.songId}-${idx}`}
                  className="flex items-center p-4 hover:bg-zinc-50 group transition-colors"
                >
                  <div className="flex items-center gap-3 w-16 text-zinc-400">
                    <span className="text-sm font-mono font-medium">{idx + 1}.</span>
                  </div>

                  <div className="flex-1 font-semibold text-zinc-900">
                    {getSongTitle(song.songId)}
                  </div>

                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveSong(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-zinc-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition-colors"
                      title="Move Up"
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
                          strokeWidth="2"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSong(idx, 'down')}
                      disabled={idx === setlist.songs.length - 1}
                      className="p-1.5 text-zinc-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition-colors"
                      title="Move Down"
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
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div className="w-px h-5 bg-zinc-200 mx-1"></div>
                    <button
                      onClick={() => removeSong(idx)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded transition-colors"
                      title="Remove from Setlist"
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
    </div>
  );
}

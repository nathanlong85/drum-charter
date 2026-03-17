'use client';

import { debounce } from 'lodash';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import type { SongChart, SongSection, SongSubSection } from '@/lib/types/groove';

type SongAction =
  | { type: 'SET_SONG'; song: SongChart }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_BPM'; bpm: number }
  | {
      type: 'UPDATE_TIME_SIGNATURE';
      beatsPerMeasure: number;
      beatValue: number;
    }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'UPDATE_METRONOME'; enabled?: boolean; volume?: number }
  | { type: 'ADD_SECTION' }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Partial<SongSection> }
  | { type: 'ADD_SUBSECTION'; sectionId: string }
  | { type: 'REMOVE_SUBSECTION'; sectionId: string; subSectionId: string }
  | {
      type: 'UPDATE_SUBSECTION';
      sectionId: string;
      subSectionId: string;
      updates: Partial<SongSubSection>;
    }
  | { type: 'TOGGLE_PUBLIC' };

function songReducer(state: SongChart, action: SongAction): SongChart {
  const timestamp = new Date().toISOString();

  switch (action.type) {
    case 'SET_SONG':
      return action.song;
    case 'UPDATE_TITLE':
      return {
        ...state,
        header: { ...state.header, title: action.title },
        updatedAt: timestamp,
      };
    case 'UPDATE_BPM':
      return {
        ...state,
        header: { ...state.header, bpm: action.bpm },
        updatedAt: timestamp,
      };
    case 'UPDATE_TIME_SIGNATURE':
      return {
        ...state,
        header: {
          ...state.header,
          timeSignature: {
            beatsPerMeasure: action.beatsPerMeasure,
            beatValue: action.beatValue,
          },
        },
        updatedAt: timestamp,
      };
    case 'UPDATE_TAGS':
      return { ...state, tags: action.tags, updatedAt: timestamp };
    case 'UPDATE_METRONOME':
      return {
        ...state,
        header: {
          ...state.header,
          metronomeEnabled:
            action.enabled !== undefined ? action.enabled : state.header.metronomeEnabled,
          metronomeVolume:
            action.volume !== undefined ? action.volume : state.header.metronomeVolume,
        },
        updatedAt: timestamp,
      };
    case 'ADD_SECTION': {
      const newSection: SongSection = {
        id: crypto.randomUUID(),
        name: 'New Section',
        measuresCount: 4,
        notes: [],
        subSections: [],
      };
      return {
        ...state,
        sections: [...state.sections, newSection],
        updatedAt: timestamp,
      };
    }
    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((s) => s.id !== action.sectionId),
        updatedAt: timestamp,
      };
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, ...action.updates } : s,
        ),
        updatedAt: timestamp,
      };
    case 'ADD_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.sectionId) return s;
          const newSub: SongSubSection = {
            id: crypto.randomUUID(),
            name: 'New Subsection',
            measuresCount: 4,
            notes: [],
          };
          return { ...s, subSections: [...(s.subSections || []), newSub] };
        }),
        updatedAt: timestamp,
      };
    case 'REMOVE_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.sectionId) return s;
          return {
            ...s,
            subSections: (s.subSections || []).filter((sub) => sub.id !== action.subSectionId),
          };
        }),
        updatedAt: timestamp,
      };
    case 'UPDATE_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.sectionId) return s;
          return {
            ...s,
            subSections: (s.subSections || []).map((sub) =>
              sub.id === action.subSectionId ? { ...sub, ...action.updates } : sub,
            ),
          };
        }),
        updatedAt: timestamp,
      };
    case 'TOGGLE_PUBLIC':
      return { ...state, isPublic: !state.isPublic, updatedAt: timestamp };
    default:
      return state;
  }
}

interface SongEditorProps {
  initialSong: SongChart;
}

export default function SongEditor({ initialSong }: SongEditorProps) {
  const [state, dispatch] = useReducer(songReducer, initialSong);
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const debouncedSave = useCallback(
    debounce(async (song: SongChart) => {
      if (!isMountedRef.current) return;
      setIsSaving(true);
      try {
        await supabaseService.saveSongChart(song);
      } catch (error) {
        console.error('Failed to auto-save song chart:', error);
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    }, 2000),
    [],
  );

  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    setIsSaving(true);
    debouncedSave(state);
  }, [state, debouncedSave]);

  // Separate cleanup effect that only runs on unmount
  useEffect(() => {
    return () => {
      debouncedSave.flush();
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen relative">
      <div className="absolute top-8 right-8 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-zinc-800 transition-all text-sm shadow-lg shadow-zinc-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          PRINT
        </button>
      </div>
      <header className="mb-12 border-b-2 border-zinc-800 pb-6">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={state.header.title}
            onChange={(e) => dispatch({ type: 'UPDATE_TITLE', title: e.target.value })}
            className="text-4xl font-black uppercase tracking-tighter text-zinc-900 bg-transparent border-none focus:ring-0 w-full placeholder-zinc-300"
            placeholder="Song Title"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PUBLIC' })}
              className={`text-[10px] font-bold px-2 py-1 rounded transition-colors no-print ${
                state.isPublic
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {state.isPublic ? '● PUBLIC' : '○ PRIVATE'}
            </button>
            {isSaving && (
              <span className="text-xs font-mono text-blue-500 animate-pulse bg-blue-50 px-2 py-1 rounded no-print">
                SAVING...
              </span>
            )}
            <div className="text-right">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Type</p>
              <p className="text-sm font-bold text-zinc-900 uppercase">Song Chart</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8 mb-6">
          <div className="flex items-center">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest mr-2">
              BPM
            </span>
            <input
              type="number"
              value={state.header.bpm || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                dispatch({
                  type: 'UPDATE_BPM',
                  bpm: Number.isNaN(val) ? 0 : Math.max(0, Math.min(val, 999)),
                });
              }}
              className="w-16 text-lg font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="0"
            />
          </div>
          <div className="flex items-center">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest mr-2">
              Time
            </span>
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded px-2 py-1">
              <input
                type="number"
                value={state.header.timeSignature.beatsPerMeasure}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  dispatch({
                    type: 'UPDATE_TIME_SIGNATURE',
                    beatsPerMeasure: Number.isNaN(val) ? 4 : Math.max(1, Math.min(val, 32)),
                    beatValue: state.header.timeSignature.beatValue,
                  });
                }}
                className="w-8 text-lg font-bold text-zinc-700 bg-transparent border-none p-0 focus:ring-0 text-center"
              />
              <span className="text-zinc-400">/</span>
              <input
                type="number"
                value={state.header.timeSignature.beatValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  dispatch({
                    type: 'UPDATE_TIME_SIGNATURE',
                    beatsPerMeasure: state.header.timeSignature.beatsPerMeasure,
                    beatValue: Number.isNaN(val) ? 4 : Math.max(1, Math.min(val, 32)),
                  });
                }}
                className="w-8 text-lg font-bold text-zinc-700 bg-transparent border-none p-0 focus:ring-0 text-center"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 no-print">
          {state.isPublic && (
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${window.location.origin}/public/songs/${state.id}`,
                  );
                  alert('Public link copied to clipboard!');
                } catch (_err) {
                  alert(
                    `Failed to copy link. Here it is: ${window.location.origin}/public/songs/${state.id}`,
                  );
                }
              }}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest mr-4"
            >
              COPY PUBLIC LINK
            </button>
          )}
          {state.isPublic && (
            <a
              href={`/public/songs/${state.id}`}
              target="_blank"
              className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest mr-4"
              rel="noopener noreferrer"
            >
              VIEW PUBLIC
            </a>
          )}
          <button
            onClick={async () => {
              try {
                const duplicated = await supabaseService.duplicateSongChart(state.id);
                window.location.href = `/songs/${duplicated.id}`;
              } catch (_error) {
                alert('Failed to duplicate song chart.');
              }
            }}
            className="text-[10px] font-bold text-zinc-500 hover:text-blue-600 uppercase tracking-widest mr-4"
          >
            DUPLICATE
          </button>
          {state.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            className="text-xs text-zinc-400 bg-transparent border-none focus:ring-0 w-24 p-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget;
                if (input.value.trim()) {
                  dispatch({
                    type: 'UPDATE_TAGS',
                    tags: [...state.tags, input.value.trim()],
                  });
                  input.value = '';
                }
              }
            }}
          />
        </div>
      </header>

      <div className="space-y-12">
        {state.sections.map((section) => (
          <section key={section.id} className="relative group">
            <button
              onClick={() => dispatch({ type: 'REMOVE_SECTION', sectionId: section.id })}
              className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all no-print"
              title="Remove Section"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={section.name}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_SECTION',
                    sectionId: section.id,
                    updates: { name: e.target.value },
                  })
                }
                className="text-xl font-bold uppercase text-zinc-800 bg-zinc-100 px-3 py-1 rounded border-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Section Name"
              />
              <div className="flex items-center text-zinc-400 font-medium">
                <span className="mr-1">(</span>
                <input
                  type="number"
                  value={section.measuresCount}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SECTION',
                      sectionId: section.id,
                      updates: { measuresCount: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-8 text-center bg-transparent border-none p-0 focus:ring-0 font-bold text-zinc-600"
                />
                <span>M)</span>
              </div>
            </div>

            <div className="ml-4 space-y-6">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    Groove Grid
                  </h4>
                  {!section.grid && (
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          sectionId: section.id,
                          updates: {
                            grid: {
                              timeSignature: state.header.timeSignature,
                              resolution: 16,
                              measures: 1,
                              instruments: [
                                {
                                  instrumentId: 'kick',
                                  label: 'Kick',
                                  notes: Array(16).fill('none'),
                                },
                                {
                                  instrumentId: 'snare',
                                  label: 'Snare',
                                  notes: Array(16).fill('none'),
                                },
                                {
                                  instrumentId: 'hihat',
                                  label: 'Hi-Hat',
                                  notes: Array(16).fill('none'),
                                },
                              ],
                            },
                          },
                        })
                      }
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest no-print"
                    >
                      + ADD GRID
                    </button>
                  )}
                </div>
                {section.grid && (
                  <GrooveGridEditor
                    initialGrid={section.grid}
                    onChange={(grid) =>
                      dispatch({
                        type: 'UPDATE_SECTION',
                        sectionId: section.id,
                        updates: { grid },
                      })
                    }
                    bpm={state.header.bpm}
                    onBpmChange={(bpm) => dispatch({ type: 'UPDATE_BPM', bpm })}
                    metronomeEnabled={state.header.metronomeEnabled}
                    onMetronomeToggle={(enabled) => dispatch({ type: 'UPDATE_METRONOME', enabled })}
                    metronomeVolume={state.header.metronomeVolume}
                    onMetronomeVolumeChange={(volume) =>
                      dispatch({ type: 'UPDATE_METRONOME', volume })
                    }
                  />
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  Notes
                </h4>
                <textarea
                  value={section.notes?.join('\n') || ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SECTION',
                      sectionId: section.id,
                      updates: { notes: e.target.value.split('\n') },
                    })
                  }
                  placeholder="Bullet points (one per line)..."
                  className="w-full h-24 text-sm text-zinc-700 bg-transparent border border-zinc-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-200 resize-none transition-all"
                />
              </div>

              {/* Subsections */}
              <div className="space-y-4">
                {(section.subSections || []).map((sub) => (
                  <div key={sub.id} className="border-l-4 border-zinc-200 pl-4 relative group/sub">
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'REMOVE_SUBSECTION',
                          sectionId: section.id,
                          subSectionId: sub.id,
                        })
                      }
                      className="absolute -right-8 top-0 opacity-0 group-hover/sub:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-all no-print"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_SUBSECTION',
                            sectionId: section.id,
                            subSectionId: sub.id,
                            updates: { name: e.target.value },
                          })
                        }
                        className="text-lg font-semibold text-zinc-700 bg-transparent border-none p-0 focus:ring-0"
                        placeholder="Subsection Name"
                      />
                      <div className="flex items-center text-zinc-400 text-sm">
                        <span className="mr-1">(</span>
                        <input
                          type="number"
                          value={sub.measuresCount}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_SUBSECTION',
                              sectionId: section.id,
                              subSectionId: sub.id,
                              updates: {
                                measuresCount: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-6 text-center bg-transparent border-none p-0 focus:ring-0 font-bold text-zinc-500"
                        />
                        <span>M)</span>
                      </div>
                    </div>
                    {sub.grid && (
                      <div className="mb-3">
                        <GrooveGridEditor
                          initialGrid={sub.grid}
                          onChange={(grid) =>
                            dispatch({
                              type: 'UPDATE_SUBSECTION',
                              sectionId: section.id,
                              subSectionId: sub.id,
                              updates: { grid },
                            })
                          }
                          bpm={state.header.bpm}
                          onBpmChange={(bpm) => dispatch({ type: 'UPDATE_BPM', bpm })}
                          metronomeEnabled={state.header.metronomeEnabled}
                          onMetronomeToggle={(enabled) =>
                            dispatch({ type: 'UPDATE_METRONOME', enabled })
                          }
                          metronomeVolume={state.header.metronomeVolume}
                          onMetronomeVolumeChange={(volume) =>
                            dispatch({ type: 'UPDATE_METRONOME', volume })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => dispatch({ type: 'ADD_SUBSECTION', sectionId: section.id })}
                  className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest pl-4 no-print"
                >
                  + ADD SUBSECTION
                </button>
              </div>
            </div>
          </section>
        ))}

        <button
          onClick={() => dispatch({ type: 'ADD_SECTION' })}
          className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 font-bold uppercase tracking-widest hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500 transition-all no-print"
        >
          Add New Section
        </button>
      </div>

      <footer className="mt-16 pt-8 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em]">
          DrumCharter Song Editor v1.0
        </p>
      </footer>
    </div>
  );
}

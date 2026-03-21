'use client';

import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { TagInput } from '@/components/common/TagInput';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import {
  createDefaultDrumInstruments,
  type Notebook,
  type NotebookSection,
} from '@/lib/types/groove';

type NotebookAction =
  | { type: 'SET_NOTEBOOK'; notebook: Notebook }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'UPDATE_PUBLIC'; isPublic: boolean }
  | { type: 'ADD_SECTION' }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Partial<NotebookSection> }
  | { type: 'UPDATE_SECTION_BPM'; sectionId: string; bpm: number };

function notebookReducer(state: Notebook, action: NotebookAction): Notebook {
  const timestamp = new Date().toISOString();

  switch (action.type) {
    case 'SET_NOTEBOOK':
      return action.notebook;
    case 'UPDATE_TITLE':
      return { ...state, title: action.title, updatedAt: timestamp };
    case 'UPDATE_TAGS':
      return { ...state, tags: action.tags, updatedAt: timestamp };
    case 'UPDATE_PUBLIC':
      return { ...state, isPublic: action.isPublic, updatedAt: timestamp };
    case 'ADD_SECTION': {
      const newSection: NotebookSection = {
        id: crypto.randomUUID(),
        name: 'New Section',
        notes: [],
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
    case 'UPDATE_SECTION_BPM':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, bpm: action.bpm } : s,
        ),
        updatedAt: timestamp,
      };
    default:
      return state;
  }
}

interface NotebookEditorProps {
  initialNotebook: Notebook;
}

export default function NotebookEditor({ initialNotebook }: NotebookEditorProps) {
  const [state, dispatch] = useReducer(notebookReducer, initialNotebook);
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);
  const pendingSaveRef = useRef<Promise<any> | null>(null);
  const router = useRouter();

  const debouncedSave = useCallback(
    debounce(async (notebook: Notebook) => {
      if (!isMountedRef.current) return;
      setIsSaving(true);
      const savePromise = supabaseService.saveNotebook(notebook);
      pendingSaveRef.current = savePromise;
      try {
        await savePromise;
      } catch (error) {
        console.error('Failed to auto-save notebook:', error);
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
        if (pendingSaveRef.current === savePromise) {
          pendingSaveRef.current = null;
        }
      }
    }, 2000),
    [],
  );

  const settleAutosave = useCallback(async () => {
    debouncedSave.flush();
    if (pendingSaveRef.current) {
      await pendingSaveRef.current;
    }
  }, [debouncedSave]);

  // CodeRabbit: Use ref to skip initial render save
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
    };
  }, [debouncedSave]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <header className="mb-12 border-b-2 border-zinc-800 pb-6">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={state.title}
            onChange={(e) => dispatch({ type: 'UPDATE_TITLE', title: e.target.value })}
            className="text-4xl font-black uppercase tracking-tighter text-zinc-900 bg-transparent border-none focus:ring-0 w-full placeholder-zinc-300"
            placeholder="Notebook Title"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 no-print mr-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublicNotebook"
                  checked={state.isPublic}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PUBLIC',
                      isPublic: e.target.checked,
                    })
                  }
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label
                  htmlFor="isPublicNotebook"
                  className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer"
                >
                  Public
                </label>
                {state.isPublic && (
                  <a
                    href={`/public/notebooks/${state.id}`}
                    target="_blank"
                    className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest ml-1"
                    rel="noopener"
                  >
                    View
                  </a>
                )}
              </div>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this notebook?')) {
                    try {
                      await settleAutosave();
                      await supabaseService.deleteNotebook(state.id);
                      router.push('/library');
                    } catch (_error) {
                      alert('Failed to delete notebook.');
                    }
                  }
                }}
                className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest"
              >
                DELETE
              </button>
              <button
                onClick={async () => {
                  try {
                    await settleAutosave();
                    const duplicated = await supabaseService.duplicateNotebook(state.id);
                    router.push(`/notebooks/${duplicated.id}`);
                  } catch (_error) {
                    alert('Failed to duplicate notebook.');
                  }
                }}
                className="text-[10px] font-bold text-zinc-500 hover:text-blue-600 uppercase tracking-widest ml-4"
              >
                DUPLICATE
              </button>
            </div>
            {isSaving ? (
              <span className="text-xs font-mono text-blue-500 animate-pulse bg-blue-50 px-2 py-1 rounded no-print">
                SAVING...
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-500 bg-emerald-50 px-2 py-1 rounded no-print">
                SAVED
              </span>
            )}
            <div className="text-right">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Type</p>
              <p className="text-sm font-bold text-zinc-900 uppercase">Notebook</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <TagInput
            tags={state.tags}
            onChange={(tags) => dispatch({ type: 'UPDATE_TAGS', tags })}
            suggestions={['practice', 'ideas', 'technique', 'rudiments', 'songs']}
            placeholder="Add notebook tags..."
          />
        </div>
      </header>

      <div className="space-y-16">
        {state.sections.map((section) => (
          <div key={section.id} className="relative group" data-testid="notebook-section">
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
                className="text-2xl font-black uppercase tracking-tight text-zinc-800 bg-transparent border-none focus:ring-0 p-0"
                placeholder="Section Name"
              />
              <button
                onClick={() => dispatch({ type: 'REMOVE_SECTION', sectionId: section.id })}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-all no-print"
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
            </div>

            <div className="space-y-8">
              <textarea
                value={section.notes?.join('\n') || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_SECTION',
                    sectionId: section.id,
                    updates: { notes: e.target.value.split('\n') },
                  })
                }
                placeholder="Add notes, patterns, or exercises..."
                className="w-full h-32 text-zinc-700 bg-zinc-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />

              <div className="bg-white border-2 border-zinc-100 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    Interactive Grid
                  </h4>
                  {!section.grid && (
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          sectionId: section.id,
                          updates: {
                            grid: {
                              timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
                              resolution: 16,
                              measures: 1,
                              instruments: createDefaultDrumInstruments({
                                timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
                                resolution: 16,
                                measures: 1,
                              }),
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
                  <div className="space-y-4">
                    <GrooveGridEditor
                      initialGrid={section.grid}
                      onChange={(grid) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          sectionId: section.id,
                          updates: { grid },
                        })
                      }
                      bpm={section.bpm || 120}
                      onBpmChange={(bpm) =>
                        dispatch({
                          type: 'UPDATE_SECTION_BPM',
                          sectionId: section.id,
                          bpm,
                        })
                      }
                    />
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          sectionId: section.id,
                          updates: { grid: undefined },
                        })
                      }
                      className="text-[10px] font-bold text-zinc-400 hover:text-red-500 uppercase tracking-widest no-print"
                    >
                      Remove Grid
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => dispatch({ type: 'ADD_SECTION' })}
          className="w-full py-8 border-2 border-dashed border-zinc-100 rounded-3xl text-zinc-400 font-black uppercase tracking-widest hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500 transition-all no-print"
        >
          + Add New Section
        </button>
      </div>

      <footer className="mt-24 pt-8 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em]">
          DrumCharter Notebook Editor v1.0
        </p>
      </footer>
    </div>
  );
}

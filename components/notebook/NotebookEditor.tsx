'use client';

import { debounce } from 'lodash';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveGrid, Notebook, NotebookSection } from '@/lib/types/groove';
import { formatDateTime } from '@/lib/utils/format';

type NotebookAction =
  | { type: 'SET_NOTEBOOK'; notebook: Notebook }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'UPDATE_PUBLIC'; isPublic: boolean }
  | { type: 'ADD_SECTION' }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'UPDATE_SECTION_NAME'; sectionId: string; name: string }
  | { type: 'UPDATE_SECTION_GRID'; sectionId: string; grid?: GrooveGrid }
  | { type: 'UPDATE_SECTION_NOTES'; sectionId: string; notes: string[] }
  | { type: 'UPDATE_SECTION_BPM'; sectionId: string; bpm: number };

function notebookReducer(state: Notebook, action: NotebookAction): Notebook {
  switch (action.type) {
    case 'SET_NOTEBOOK':
      return action.notebook;
    case 'UPDATE_TITLE':
      return {
        ...state,
        title: action.title,
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_TAGS':
      return {
        ...state,
        tags: action.tags,
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_PUBLIC':
      return {
        ...state,
        isPublic: action.isPublic,
        updatedAt: new Date().toISOString(),
      };
    case 'ADD_SECTION': {
      const newSection: NotebookSection = {
        id: crypto.randomUUID(),
        name: 'New Section',
        notes: [],
      };
      return {
        ...state,
        sections: [...state.sections, newSection],
        updatedAt: new Date().toISOString(),
      };
    }
    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((s) => s.id !== action.sectionId),
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_SECTION_NAME':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, name: action.name } : s,
        ),
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_SECTION_GRID':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, grid: action.grid } : s,
        ),
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_SECTION_NOTES':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, notes: action.notes } : s,
        ),
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_SECTION_BPM':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, bpm: action.bpm } : s,
        ),
        updatedAt: new Date().toISOString(),
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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const debouncedSave = useCallback(
    debounce(async (notebook: Notebook) => {
      if (!isMountedRef.current) return;
      setIsSaving(true);
      try {
        await supabaseService.saveNotebook(notebook);
      } catch (error) {
        console.error('Failed to auto-save notebook:', error);
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    }, 2000),
    [],
  );

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
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

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
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 no-print">
              <div className="flex items-center gap-2 mr-4">
                <input
                  type="checkbox"
                  id="isPublic"
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
                  htmlFor="isPublic"
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
                  try {
                    const duplicated = await supabaseService.duplicateNotebook(state.id);
                    window.location.href = `/notebooks/${duplicated.id}`;
                  } catch (_error) {
                    alert('Failed to duplicate notebook.');
                  }
                }}
                className="text-[10px] font-bold text-zinc-500 hover:text-blue-600 uppercase tracking-widest"
              >
                DUPLICATE
              </button>
            </div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              {isSaving ? (
                <span className="text-blue-500 animate-pulse bg-blue-50 px-2 py-1 rounded">
                  SAVING...
                </span>
              ) : (
                <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded">SAVED</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-zinc-400 text-sm">Tags:</span>
          <input
            type="text"
            value={state.tags.join(', ')}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_TAGS',
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter((t) => t !== ''),
              })
            }
            className="text-sm font-medium text-zinc-600 bg-zinc-50 px-2 py-1 rounded border-none focus:ring-1 focus:ring-zinc-200"
            placeholder="add tags separated by comma"
          />
        </div>
      </header>

      <div className="space-y-16">
        {state.sections.map((section) => (
          <div key={section.id} className="relative group">
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={section.name}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_SECTION_NAME',
                    sectionId: section.id,
                    name: e.target.value,
                  })
                }
                className="text-xl font-bold uppercase text-zinc-800 bg-zinc-100 px-3 py-1 rounded border-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
                placeholder="Section Name"
              />
              <button
                onClick={() => dispatch({ type: 'REMOVE_SECTION', sectionId: section.id })}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50"
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

            <div className="ml-4 space-y-6">
              {!section.grid ? (
                <button
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_SECTION_GRID',
                      sectionId: section.id,
                      grid: {
                        timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
                        resolution: 16,
                        measures: 1,
                        instruments: [
                          {
                            instrumentId: 'hh',
                            label: 'Hi-Hat',
                            notes: Array(16).fill('none'),
                          },
                          {
                            instrumentId: 'sn',
                            label: 'Snare',
                            notes: Array(16).fill('none'),
                          },
                          {
                            instrumentId: 'bd',
                            label: 'Bass',
                            notes: Array(16).fill('none'),
                          },
                        ],
                      },
                    })
                  }
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-md transition-colors"
                >
                  + Add Grid
                </button>
              ) : (
                <div className="mb-4">
                  <GrooveGridEditor
                    initialGrid={section.grid}
                    onChange={(grid) =>
                      dispatch({
                        type: 'UPDATE_SECTION_GRID',
                        sectionId: section.id,
                        grid,
                      })
                    }
                    bpm={section.bpm}
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
                        type: 'UPDATE_SECTION_GRID',
                        sectionId: section.id,
                        grid: undefined,
                      })
                    }
                    className="mt-2 text-xs text-zinc-400 hover:text-red-500"
                  >
                    Remove Grid
                  </button>
                </div>
              )}

              <div>
                <textarea
                  value={section.notes?.join('\n')}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SECTION_NOTES',
                      sectionId: section.id,
                      notes: e.target.value.split('\n'),
                    })
                  }
                  className="w-full text-zinc-700 bg-zinc-50 p-4 rounded-lg border-none focus:ring-1 focus:ring-zinc-200 min-h-[100px] text-sm"
                  placeholder="Add notes, instructions, or practice goals..."
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => dispatch({ type: 'ADD_SECTION' })}
          className="w-full py-8 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-400 font-semibold hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all group"
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Section
          </div>
        </button>
      </div>

      <footer className="mt-24 pt-8 border-t border-zinc-100 text-center">
        <p className="text-zinc-400 text-sm">Last updated {formatDateTime(state.updatedAt)}</p>
      </footer>
    </div>
  );
}

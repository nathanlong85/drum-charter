'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef } from 'react';
import { TagInput } from '@/components/common/TagInput';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { useAutosave } from '@/lib/hooks/useAutosave';
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
        notes: '',
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

export function NotebookEditor({ initialNotebook }: NotebookEditorProps) {
  const [state, dispatch] = useReducer(notebookReducer, initialNotebook);
  const router = useRouter();
  const isInitialRender = useRef(true);

  const { isSaving, error, triggerSave, settleAutosave } = useAutosave<Notebook>(
    async (notebook) => {
      await supabaseService.saveNotebook(notebook);
    },
    2000,
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    triggerSave(state);
  }, [state, triggerSave]);

  return (
    <div data-testid="notebook-editor-root" className="min-h-screen bg-surface">
      <div data-testid="notebook-editor-container" className="flex flex-col h-full relative">
        {/* Top Actions */}
        <div className="sticky top-0 right-0 p-4 no-print flex justify-end gap-2 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
          {state.isPublic && (
            <>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/public/notebooks/${state.id}`,
                    );
                    alert('Public link copied to clipboard!');
                  } catch (_err) {
                    alert(
                      `Failed to copy link. Here it is: ${window.location.origin}/public/notebooks/${state.id}`,
                    );
                  }
                }}
                className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] uppercase tracking-widest"
              >
                Copy Link
              </button>
              <a
                href={`/public/notebooks/${state.id}`}
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
              try {
                await settleAutosave();
                const duplicated = await supabaseService.duplicateNotebook(state.id);
                router.push(`/notebooks/${duplicated.id}`);
              } catch (error) {
                console.error('Failed to duplicate notebook:', error);
                alert('Failed to duplicate notebook.');
              }
            }}
            className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] uppercase tracking-widest"
          >
            Duplicate
          </button>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this notebook?')) {
                try {
                  await settleAutosave();
                  await supabaseService.deleteNotebook(state.id);
                  router.push('/library');
                } catch (error) {
                  console.error('Failed to delete notebook:', error);
                  alert('Failed to delete notebook.');
                }
              }
            }}
            className="flex items-center gap-2 bg-surface-container-highest text-error px-4 py-2 rounded-lg font-bold hover:bg-error/10 transition-all text-[10px] uppercase tracking-widest"
          >
            Delete
          </button>
          <div className="w-[1px] h-8 bg-outline-variant/20 mx-2" />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-sm shadow-lg"
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

        {/* Notebook Header Section */}
        <section className="p-8 pb-4 pt-16 md:pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 w-full max-w-2xl">
              <div className="flex items-center gap-4 text-tertiary font-label uppercase tracking-[0.3em] text-[10px] font-black">
                <span>Notebook</span>
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary/40"></span>
                <span className="text-on-surface-variant flex gap-2 items-center">
                  {isSaving ? <span className="animate-pulse">Saving...</span> : <span>Saved</span>}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary/40"></span>
                <button
                  onClick={() => dispatch({ type: 'UPDATE_PUBLIC', isPublic: !state.isPublic })}
                  data-testid="toggle-public-button"
                  className={
                    state.isPublic
                      ? 'text-primary'
                      : 'text-on-surface-variant/50 hover:text-on-surface-variant transition-colors'
                  }
                >
                  {state.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </button>
              </div>
              <input
                type="text"
                value={state.title}
                onChange={(e) => dispatch({ type: 'UPDATE_TITLE', title: e.target.value })}
                className="text-5xl lg:text-6xl font-headline font-black tracking-tighter text-on-surface bg-transparent border-none focus:ring-0 w-full p-0 leading-tight"
                placeholder="Notebook Title"
              />

              <div className="mt-6">
                <TagInput
                  tags={state.tags}
                  onChange={(tags) => dispatch({ type: 'UPDATE_TAGS', tags })}
                  suggestions={['practice', 'ideas', 'technique', 'rudiments', 'songs']}
                  placeholder="+ ADD TAG"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sections Container */}
        <section className="flex-1 p-8 pt-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {state.sections.map((section) => (
              <section
                key={section.id}
                className="relative group bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-sm"
                data-testid="notebook-section"
              >
                <button
                  onClick={() => dispatch({ type: 'REMOVE_SECTION', sectionId: section.id })}
                  className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 active:opacity-100 p-2 text-on-surface-variant hover:text-error transition-all no-print outline-none"
                  title="Remove Section"
                  aria-label="Remove Section"
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

                <div className="flex items-center gap-4 mb-8">
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
                    className="text-3xl font-headline font-black uppercase tracking-tighter text-on-surface bg-transparent border-b border-transparent focus:border-primary px-0 py-1 focus:ring-0 transition-colors w-full leading-none"
                    placeholder="Section Name"
                  />
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-label font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                      PRACTICE_NOTES
                    </h4>
                    <textarea
                      value={
                        Array.isArray(section.notes)
                          ? section.notes.join('\n')
                          : section.notes || ''
                      }
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          sectionId: section.id,
                          updates: { notes: e.target.value },
                        })
                      }
                      placeholder="Add notes, patterns, or exercises..."
                      className="w-full h-32 text-sm text-on-surface bg-surface-container-lowest border border-outline-variant/10 shadow-inner rounded-xl p-6 focus:outline-none focus:border-primary/50 resize-none transition-all placeholder:text-on-surface-variant/30 font-body leading-relaxed"
                    />
                  </div>

                  <div className="glass-panel border border-white/5 rounded-2xl p-8 bg-surface-container-low/50">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-[0.2em]">
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
                          className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-headline font-bold tracking-widest uppercase hover:bg-primary/20 transition-colors"
                        >
                          + Add Grid
                        </button>
                      )}
                    </div>

                    {section.grid && (
                      <div className="space-y-6">
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
                          className="text-[10px] font-headline font-bold text-on-surface-variant hover:text-error uppercase tracking-widest transition-colors no-print"
                        >
                          Remove Grid
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}

            <button
              onClick={() => dispatch({ type: 'ADD_SECTION' })}
              className="w-full py-12 border border-dashed border-outline-variant/30 rounded-3xl text-on-surface-variant font-headline font-bold uppercase tracking-widest hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all no-print flex flex-col items-center justify-center gap-3 group"
            >
              <svg
                className="w-8 h-8 group-hover:scale-110 transition-transform"
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
            </button>
          </div>
        </section>

        <footer className="mt-24 pb-12 text-center">
          <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
            DrumCharter Notebook Console v1.0
          </p>
        </footer>
      </div>

      {/* Floating Save Status */}
      <div
        className="fixed bottom-8 right-8 z-50 pointer-events-none"
        data-testid="floating-save-status"
      >
        {isSaving && (
          <div className="bg-surface-container-highest/80 backdrop-blur-md border border-outline-variant/20 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-[10px] font-headline font-black text-primary uppercase tracking-[0.2em]">
              Saving...
            </span>
          </div>
        )}
        {error && (
          <div className="bg-error/10 backdrop-blur-md border border-error/20 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-error rounded-full"></div>
            <span className="text-[10px] font-headline font-black text-error uppercase tracking-[0.2em]">
              {error}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';
import { TagInput } from '@/components/common/TagInput';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { SnippetPickerModal } from '@/components/groove/SnippetPickerModal';
import { createDefaultDrumInstruments, type SongChart } from '@/lib/types/groove';
import {
  MAX_BEATS_PER_MEASURE,
  MIN_BEATS_PER_MEASURE,
  VALID_BEAT_VALUES,
} from '@/lib/utils/constants';
import { EditorToolbar } from '../layout/EditorToolbar';
import { LiveModeView } from './LiveModeView';
import { SongEditorProvider, useSongEditor } from './SongEditorContext';

interface SongEditorProps {
  initialSong: SongChart;
  children?: ReactNode;
}

/**
 * Root component that provides the SongEditorContext.
 */
export function SongEditorRoot({ initialSong, children }: SongEditorProps) {
  return (
    <SongEditorProvider initialSong={initialSong}>
      <SongEditorLayout>{children}</SongEditorLayout>
    </SongEditorProvider>
  );
}

function SongEditorLayout({ children }: { children?: ReactNode }) {
  const { state, isLiveMode, setIsLiveMode, pickerConfig, setPickerConfig, handleSnippetSelect } =
    useSongEditor();

  if (isLiveMode) {
    return <LiveModeView chart={state} onExit={() => setIsLiveMode(false)} />;
  }

  return (
    <div data-testid="song-editor-root" className="min-h-screen bg-surface">
      <div data-testid="song-editor-container" className="flex flex-col h-full relative">
        {children || (
          <>
            <SongEditorToolbar />
            <SongEditorHeader />
            <SongEditorSections />
          </>
        )}
      </div>

      {pickerConfig && (
        <SnippetPickerModal onClose={() => setPickerConfig(null)} onSelect={handleSnippetSelect} />
      )}

      <SongEditorSaveStatus />
    </div>
  );
}

/**
 * Toolbar for song editor actions like duplication, deletion, and going live.
 */
export function SongEditorToolbar() {
  const { state, dispatch, handleDuplicate, handleDelete, setIsLiveMode } = useSongEditor();

  return (
    <EditorToolbar
      type="song"
      id={state.id}
      isPublic={state.isPublic}
      onTogglePublic={() => dispatch({ type: 'TOGGLE_PUBLIC' })}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onGoLive={() => {
        window.scrollTo(0, 0);
        setIsLiveMode(true);
      }}
    />
  );
}

/**
 * Header section for title, BPM, time signature, and tags.
 */
export function SongEditorHeader() {
  const { state, dispatch, isSaving } = useSongEditor();

  return (
    <section className="p-8 pb-4 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 w-full max-w-2xl">
          <div className="flex items-center gap-4 text-primary font-headline uppercase tracking-[0.2em] text-xs font-bold">
            <span>DrumChart</span>
            <span className="w-1 h-1 rounded-full bg-primary/40"></span>
            <span className="text-on-surface-variant flex gap-2 items-center">
              {isSaving ? <span className="animate-pulse">Saving...</span> : <span>Saved</span>}
            </span>
          </div>
          <input
            type="text"
            value={state.header.title}
            onChange={(e) => dispatch({ type: 'UPDATE_TITLE', title: e.target.value })}
            className="text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-on-surface bg-transparent border-none focus:ring-0 w-full p-0"
            placeholder="Song Title"
          />

          <div className="mt-4">
            <TagInput
              tags={state.tags}
              onChange={(tags) => dispatch({ type: 'UPDATE_TAGS', tags })}
              suggestions={['rock', 'funk', 'jazz', 'metal', 'latin', 'pop', 'worship']}
              placeholder="+ ADD TAG"
            />
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-label text-[10px] font-black uppercase text-on-surface-variant/50 tracking-[0.2em]">
                Order Override
              </span>
              <span className="text-[10px] text-on-surface-variant/30 font-bold italic">
                (Leave blank for auto-generation)
              </span>
            </div>
            <input
              type="text"
              value={state.header.manualOrder || ''}
              data-testid="song-order-override-input"
              onChange={(e) =>
                dispatch({ type: 'UPDATE_MANUAL_ORDER', manualOrder: e.target.value })
              }
              className="w-full bg-surface-container-low/50 border border-outline-variant/10 rounded-xl px-4 py-2 text-sm font-body text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50"
              placeholder={state.sections.map((s) => s.name).join(', ')}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-surface-container-low/50 p-4 rounded-2xl flex flex-col items-center min-w-[110px] border border-outline-variant/10 shadow-sm">
            <span className="font-label text-[10px] font-black uppercase text-on-surface-variant/50 tracking-[0.2em] mb-1">
              BPM
            </span>
            <input
              type="number"
              value={state.header.bpm || ''}
              data-testid="bpm-input"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                dispatch({
                  type: 'UPDATE_BPM',
                  bpm: Number.isNaN(val) ? 120 : Math.max(1, Math.min(val, 999)),
                });
              }}
              className="font-headline text-3xl font-black text-primary bg-transparent border-none p-0 focus:ring-0 text-center w-full leading-none"
            />
          </div>
          <div className="bg-surface-container-low/50 p-4 rounded-2xl flex flex-col items-center min-w-[110px] border border-outline-variant/10 shadow-sm">
            <span className="font-label text-[10px] font-black uppercase text-on-surface-variant/50 tracking-[0.2em] mb-1">
              TIME
            </span>
            <div className="flex items-center justify-center">
              <input
                type="number"
                value={state.header.timeSignature.beatsPerMeasure}
                data-testid="time-signature-beats"
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (Number.isNaN(val)) return;
                  dispatch({
                    type: 'UPDATE_TIME_SIGNATURE',
                    beatsPerMeasure: Math.min(
                      Math.max(val, MIN_BEATS_PER_MEASURE),
                      MAX_BEATS_PER_MEASURE,
                    ),
                    beatValue: state.header.timeSignature.beatValue,
                  });
                }}
                className="font-headline text-3xl font-black text-primary bg-transparent border-none p-0 focus:ring-0 text-center w-10 leading-none"
                min={MIN_BEATS_PER_MEASURE}
                max={MAX_BEATS_PER_MEASURE}
              />
              <span className="text-primary text-3xl font-black opacity-50 px-1 leading-none">
                /
              </span>
              <select
                value={state.header.timeSignature.beatValue}
                data-testid="time-signature-value"
                onChange={(e) => {
                  dispatch({
                    type: 'UPDATE_TIME_SIGNATURE',
                    beatsPerMeasure: state.header.timeSignature.beatsPerMeasure,
                    beatValue: parseInt(e.target.value, 10),
                  });
                }}
                className="font-headline text-3xl font-black text-primary bg-transparent border-none p-0 focus:ring-0 text-center cursor-pointer appearance-none outline-none leading-none"
              >
                {VALID_BEAT_VALUES.map((v) => (
                  <option
                    key={v}
                    value={v}
                    className="bg-surface-container-low text-on-surface text-sm"
                  >
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Main sections of the song, including grids and subsections.
 */
export function SongEditorSections() {
  const { state, dispatch, setPickerConfig } = useSongEditor();

  return (
    <section className="flex-1 p-8 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Section List */}
      <div className="lg:col-span-3 space-y-6 hidden lg:block">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-2">
          <h3 className="font-label font-black uppercase text-[10px] tracking-[0.2em] text-on-surface-variant/60">
            Song Sections
          </h3>
          <button
            onClick={() => dispatch({ type: 'ADD_SECTION' })}
            className="text-primary hover:text-primary-dim transition-colors"
            title="Add Section"
            aria-label="Add section"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-3 sticky top-24">
          {state.sections.map((section) => (
            <div
              key={section.id}
              className="bg-surface-container-low/50 p-4 rounded-xl flex items-center justify-between border border-outline-variant/5 shadow-sm"
            >
              <div>
                <p className="font-headline font-black text-on-surface truncate w-32 tracking-tight">
                  {section.name || 'Untitled'}
                </p>
                <p className="text-[9px] font-label font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mt-1">
                  {section.measuresCount} MEASURES
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        {state.sections.map((section) => (
          <section
            key={section.id}
            data-testid="song-section"
            className="relative group bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-sm"
          >
            <button
              onClick={() => dispatch({ type: 'REMOVE_SECTION', sectionId: section.id })}
              className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-on-surface-variant hover:text-error transition-all no-print outline-none"
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

            <div className="flex items-center gap-4 mb-6">
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
                className="text-3xl font-headline font-black uppercase tracking-tighter text-on-surface bg-transparent border-b border-transparent focus:border-primary px-0 py-1 focus:ring-0 transition-colors w-1/2 leading-none"
                placeholder="Section Name"
              />
              <div className="flex items-center text-on-surface-variant font-label text-[11px] font-black tracking-[0.2em] bg-surface-container-highest/50 border border-outline-variant/10 px-3 py-1.5 rounded-lg shadow-inner">
                <input
                  type="number"
                  value={section.measuresCount}
                  data-testid="song-editor-measures-input"
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SECTION',
                      sectionId: section.id,
                      updates: {
                        measuresCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                      },
                    })
                  }
                  className="w-8 text-center bg-transparent border-none p-0 focus:ring-0 font-black text-on-surface leading-none"
                />
                <span className="ml-1 opacity-50 text-[9px]">MEASURES</span>
              </div>
            </div>

            <div className="space-y-6">
              <div
                data-testid="grid-container"
                className="glass-panel border border-white/5 rounded-xl p-6 bg-surface-container-low/50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                    Main Groove
                  </h4>
                  {!section.grid && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setPickerConfig({
                            sectionId: section.id,
                          })
                        }
                        data-testid="insert-snippet-button"
                        className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-headline font-bold tracking-widest uppercase hover:bg-secondary/20 transition-colors"
                      >
                        + Insert Snippet
                      </button>
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
                                instruments: createDefaultDrumInstruments({
                                  timeSignature: state.header.timeSignature,
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
                    </div>
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
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() =>
                          setPickerConfig({
                            sectionId: section.id,
                          })
                        }
                        data-testid="replace-snippet-button"
                        className="text-[10px] font-headline font-bold text-secondary hover:text-secondary/80 uppercase tracking-widest transition-colors no-print"
                      >
                        Replace with Snippet
                      </button>
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
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                  Performance Notes
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
                  placeholder="Add specific cues, dynamics, or fill ideas..."
                  className="w-full h-24 text-sm text-on-surface bg-surface-container-highest border border-transparent rounded-lg p-4 focus:outline-none focus:border-primary/50 resize-none transition-all placeholder:text-on-surface-variant/50 font-body"
                />
              </div>

              {/* Subsections */}
              {section.subSections && section.subSections.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                  <h4 className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                    Variations & Fills
                  </h4>
                  {section.subSections.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-surface-container-highest rounded-xl p-4 relative group/sub"
                    >
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'REMOVE_SUBSECTION',
                            sectionId: section.id,
                            subSectionId: sub.id,
                          })
                        }
                        className="absolute right-3 top-3 opacity-0 group-hover/sub:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all no-print"
                        data-testid="remove-subsection-btn"
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
                      <div className="flex items-center gap-3 mb-4">
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
                          className="text-sm font-headline font-bold text-on-surface bg-transparent border-b border-transparent focus:border-primary p-0 focus:ring-0 w-48"
                          placeholder="Subsection Name"
                        />
                        <div className="flex items-center text-on-surface-variant text-[10px] font-headline tracking-widest uppercase bg-surface-container-low px-2 py-0.5 rounded">
                          <input
                            type="number"
                            value={sub.measuresCount}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_SUBSECTION',
                                sectionId: section.id,
                                subSectionId: sub.id,
                                updates: {
                                  measuresCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                                },
                              })
                            }
                            className="w-6 text-center bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface"
                          />
                          <span className="ml-1">M</span>
                        </div>
                      </div>
                      {!sub.grid && (
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() =>
                              setPickerConfig({
                                sectionId: section.id,
                                subSectionId: sub.id,
                              })
                            }
                            data-testid="insert-snippet-button"
                            className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-headline font-bold tracking-widest uppercase hover:bg-secondary/20 transition-colors"
                          >
                            + Insert Snippet
                          </button>
                          <button
                            onClick={() =>
                              dispatch({
                                type: 'UPDATE_SUBSECTION',
                                sectionId: section.id,
                                subSectionId: sub.id,
                                updates: {
                                  grid: {
                                    timeSignature: state.header.timeSignature,
                                    resolution: 16,
                                    measures: 1,
                                    instruments: createDefaultDrumInstruments({
                                      timeSignature: state.header.timeSignature,
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
                        </div>
                      )}
                      {sub.grid && (
                        <div className="bg-surface-container-low/50 rounded-lg p-4 border border-white/5 space-y-4">
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
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() =>
                                setPickerConfig({
                                  sectionId: section.id,
                                  subSectionId: sub.id,
                                })
                              }
                              data-testid="replace-snippet-button"
                              className="text-[10px] font-headline font-bold text-secondary hover:text-secondary/80 uppercase tracking-widest transition-colors no-print"
                            >
                              Replace with Snippet
                            </button>
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'UPDATE_SUBSECTION',
                                  sectionId: section.id,
                                  subSectionId: sub.id,
                                  updates: { grid: undefined },
                                })
                              }
                              className="text-[10px] font-headline font-bold text-on-surface-variant hover:text-error uppercase tracking-widest transition-colors no-print"
                            >
                              Remove Grid
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => dispatch({ type: 'ADD_SUBSECTION', sectionId: section.id })}
                className="text-[10px] font-headline font-bold text-primary hover:text-primary-dim uppercase tracking-[0.2em] transition-colors"
              >
                + Add Variation
              </button>
            </div>
          </section>
        ))}

        <button
          onClick={() => dispatch({ type: 'ADD_SECTION' })}
          className="w-full py-8 border border-dashed border-outline-variant/30 rounded-2xl text-on-surface-variant font-headline font-bold uppercase tracking-widest hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all no-print flex flex-col items-center justify-center gap-2 group"
        >
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Section
        </button>
      </div>
    </section>
  );
}

/**
 * Save status indicator (floating).
 */
export function SongEditorSaveStatus() {
  const { isSaving, error } = useSongEditor();

  return (
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
  );
}

/**
 * Compound component for the Song Editor.
 */
const SongEditor = Object.assign(SongEditorRoot, {
  Header: SongEditorHeader,
  Toolbar: SongEditorToolbar,
  Sections: SongEditorSections,
  SaveStatus: SongEditorSaveStatus,
});

export default SongEditor;

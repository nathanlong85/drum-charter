'use client';

import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { useAudioPlayback } from '@/lib/hooks/useAudioPlayback';
import { type GrooveAction, grooveReducer } from '@/lib/state/groove-reducer';
import {
  type BeatResolution,
  createInstrument,
  type DrumSymbol,
  type GrooveGrid,
  getVelocityForSymbol,
  type TimeSignature,
} from '@/lib/types/groove';
import { GrooveGridToolbar } from './GrooveGridToolbar';
import { InstrumentRow } from './InstrumentRow';
import { InstrumentSettingsModal } from './InstrumentSettingsModal';
import { SymbolPicker } from './SymbolPicker';

export interface GrooveGridEditorProps {
  initialGrid: GrooveGrid;
  onChange?: (grid: GrooveGrid) => void;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  metronomeEnabled?: boolean;
  onMetronomeToggle?: (enabled: boolean) => void;
  metronomeVolume?: number;
  onMetronomeVolumeChange?: (volume: number) => void;
  readOnly?: boolean;
}

export const GrooveGridEditor: React.FC<GrooveGridEditorProps> = ({
  initialGrid,
  onChange,
  bpm: parentBpm,
  onBpmChange,
  metronomeEnabled: parentMetronomeEnabled,
  onMetronomeToggle,
  metronomeVolume: parentMetronomeVolume,
  onMetronomeVolumeChange,
  readOnly = false,
}) => {
  const [state, dispatch] = useReducer(grooveReducer, initialGrid);
  const latestStateRef = React.useRef(state);

  React.useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const [pickerPos, setPickerPos] = useState<{
    top: number;
    left: number;
    id: string;
    noteIndex: number;
  } | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [localBpm, setLocalBpm] = useState(120);
  const [isEditingInstruments, setIsEditingInstruments] = useState(false);
  const [editingInstrumentId, setEditingInstrumentId] = useState<string | null>(null);

  const [selectionRange, setSelectionRange] = useState<{
    start: { instIdx: number; noteIdx: number };
    end: { instIdx: number; noteIdx: number };
  } | null>(null);
  const isDraggingRef = useRef(false);

  const bpm = parentBpm !== undefined ? parentBpm : localBpm;

  const {
    isPlaying,
    isSamplesLoaded,
    togglePlayback,
    metronomeEnabled,
    setMetronomeEnabled,
    metronomeVolume,
    setMetronomeVolume,
  } = useAudioPlayback({
    grid: state,
    bpm,
    onStepChange: (step) => setActiveStep(step),
    initialMetronomeEnabled: parentMetronomeEnabled,
    initialMetronomeVolume: parentMetronomeVolume,
  });

  // Sync internal audio state with external props if they change
  useEffect(() => {
    if (parentMetronomeEnabled !== undefined && parentMetronomeEnabled !== metronomeEnabled) {
      setMetronomeEnabled(parentMetronomeEnabled);
    }
  }, [parentMetronomeEnabled, setMetronomeEnabled, metronomeEnabled]);

  useEffect(() => {
    if (parentMetronomeVolume !== undefined && parentMetronomeVolume !== metronomeVolume) {
      setMetronomeVolume(parentMetronomeVolume);
    }
  }, [parentMetronomeVolume, setMetronomeVolume, metronomeVolume]);

  useEffect(() => {
    if (!isPlaying) {
      setActiveStep(null);
    }
  }, [isPlaying]);

  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    if (initialGrid) {
      const isDifferent =
        JSON.stringify(initialGrid.instruments) !== JSON.stringify(state.instruments) ||
        initialGrid.measures !== state.measures ||
        initialGrid.resolution !== state.resolution ||
        initialGrid.timeSignature.beatsPerMeasure !== state.timeSignature.beatsPerMeasure ||
        initialGrid.timeSignature.beatValue !== state.timeSignature.beatValue ||
        initialGrid.playbackOptionalHits !== state.playbackOptionalHits;

      if (isDifferent) {
        dispatch({ type: 'SET_FULL_GRID', grid: initialGrid });
      }
    }
  }, [
    initialGrid,
    state.instruments,
    state.measures,
    state.resolution,
    state.timeSignature.beatValue,
    state.timeSignature.beatsPerMeasure,
    state.playbackOptionalHits,
  ]);

  const wrappedDispatch = useCallback(
    (action: GrooveAction) => {
      if (readOnly) return;
      const nextState = grooveReducer(latestStateRef.current, action);
      dispatch(action);
      onChange?.(nextState);
      latestStateRef.current = nextState;
    },
    [onChange, readOnly],
  );

  const handleNoteClick = (id: string, noteIndex: number, e: React.MouseEvent) => {
    if (readOnly) return;
    if (selectionRange) {
      const instIdx = state.instruments.findIndex((i) => i.id === id);
      const isSameCell =
        selectionRange.start.instIdx === instIdx && selectionRange.start.noteIdx === noteIndex;
      const isSingleCell =
        selectionRange.start.instIdx === selectionRange.end.instIdx &&
        selectionRange.start.noteIdx === selectionRange.end.noteIdx;

      if (!isSameCell || !isSingleCell) {
        setSelectionRange(null);
        return;
      }
    }

    if (e.shiftKey) {
      wrappedDispatch({ type: 'TOGGLE_OPTIONAL', id, noteIndex });
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.altKey) {
      setPickerPos({
        top: rect.bottom,
        left: rect.left,
        id,
        noteIndex,
      });
      return;
    }

    wrappedDispatch({ type: 'TOGGLE_NOTE', id, noteIndex });
  };

  const handleNoteMouseDown = (instIdx: number, noteIdx: number, e?: React.MouseEvent) => {
    if (readOnly) return;
    if (e && e.button !== 0) return; // Only left click
    setSelectionRange({
      start: { instIdx, noteIdx },
      end: { instIdx, noteIdx },
    });
    isDraggingRef.current = true;
  };

  const handleNoteMouseEnter = (instIdx: number, noteIdx: number) => {
    if (readOnly || !isDraggingRef.current) return;
    setSelectionRange((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        end: { instIdx, noteIdx },
      };
    });
  };

  const handleNoteContextMenu = (id: string, noteIndex: number, e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();

    // If context menu is opened outside current selection, clear it
    if (selectionRange) {
      const instIdx = state.instruments.findIndex((i) => i.id === id);
      const minInst = Math.min(selectionRange.start.instIdx, selectionRange.end.instIdx);
      const maxInst = Math.max(selectionRange.start.instIdx, selectionRange.end.instIdx);
      const minNote = Math.min(selectionRange.start.noteIdx, selectionRange.end.noteIdx);
      const maxNote = Math.max(selectionRange.start.noteIdx, selectionRange.end.noteIdx);

      if (instIdx < minInst || instIdx > maxInst || noteIndex < minNote || noteIndex > maxNote) {
        setSelectionRange(null);
      }
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPickerPos({
      top: rect.bottom,
      left: rect.left,
      id,
      noteIndex,
    });
  };

  const handleVelocityChange = (id: string, noteIndex: number, velocity: number) => {
    if (selectionRange) {
      wrappedDispatch({
        type: 'SET_SELECTION_VELOCITY',
        selection: selectionRange,
        velocity,
      });
    } else {
      wrappedDispatch({
        type: 'SET_VELOCITY',
        id,
        noteIndex,
        velocity,
      });
    }
  };

  const handleSymbolSelect = (symbol: DrumSymbol) => {
    if (!pickerPos) return;
    if (selectionRange) {
      wrappedDispatch({
        type: 'SET_SELECTION_SYMBOLS',
        selection: selectionRange,
        symbol,
      });
    } else {
      wrappedDispatch({
        type: 'SET_SYMBOL',
        id: pickerPos.id,
        noteIndex: pickerPos.noteIndex,
        symbol,
      });
    }
  };

  useEffect(() => {
    const isClipboardSelection = (
      value: unknown,
    ): value is Array<{ notes: DrumSymbol[]; velocities?: number[] }> =>
      Array.isArray(value) &&
      value.every((row) => {
        if (!row || typeof row !== 'object') return false;
        const record = row as Record<string, unknown>;
        return (
          Array.isArray(record.notes) &&
          record.notes.every((note) => typeof note === 'string') &&
          (record.velocities === undefined ||
            (Array.isArray(record.velocities) &&
              record.velocities.every((velocity) => typeof velocity === 'number')))
        );
      });

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (readOnly) return;
      // Don't trigger global actions if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectionRange) {
        e.preventDefault();
        wrappedDispatch({
          type: 'SET_SELECTION_SYMBOLS',
          selection: selectionRange,
          symbol: 'none',
        });
      }
      // Copy functionality (internal JSON to clipboard)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectionRange) {
        const { start, end } = selectionRange;
        const minInst = Math.min(start.instIdx, end.instIdx);
        const maxInst = Math.max(start.instIdx, end.instIdx);
        const minNote = Math.min(start.noteIdx, end.noteIdx);
        const maxNote = Math.max(start.noteIdx, end.noteIdx);

        const selectedData = state.instruments.slice(minInst, maxInst + 1).map((inst) => ({
          category: inst.category,
          presetVariety: inst.presetVariety,
          notes: inst.notes.slice(minNote, maxNote + 1),
          velocities: inst.velocities?.slice(minNote, maxNote + 1),
        }));

        try {
          await navigator.clipboard.writeText(JSON.stringify(selectedData));
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
        }
      }
    };

    const handlePaste = async (e: ClipboardEvent) => {
      if (readOnly) return;
      // Don't paste if user is typing in an input/textarea
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (!selectionRange) return;
      const text = e.clipboardData?.getData('text');
      if (!text) return;

      try {
        const data = JSON.parse(text);
        if (isClipboardSelection(data) && data.length > 0) {
          const { start, end } = selectionRange;
          const targetInstIdx = Math.min(start.instIdx, end.instIdx);
          const targetNoteIdx = Math.min(start.noteIdx, end.noteIdx);

          wrappedDispatch({
            type: 'PASTE_SELECTION',
            target: { instIdx: targetInstIdx, noteIdx: targetNoteIdx },
            data,
          });
        }
      } catch (_err) {
        // Not valid JSON or not our format, ignore
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [selectionRange, state.instruments, wrappedDispatch, readOnly]);

  const updateMeasures = (delta: number) => {
    const newMeasures = Math.max(1, state.measures + delta);
    if (newMeasures !== state.measures) {
      wrappedDispatch({ type: 'SET_MEASURES', measures: newMeasures });
    }
  };

  const updateResolution = (res: BeatResolution) => {
    wrappedDispatch({ type: 'SET_RESOLUTION', resolution: res });
  };

  const updateTimeSignature = (newTs: TimeSignature) => {
    wrappedDispatch({
      type: 'SET_TIME_SIGNATURE',
      beatsPerMeasure: Math.max(1, newTs.beatsPerMeasure),
      beatValue: newTs.beatValue,
    });
  };

  const handleAddInstrument = () => {
    const id = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
    const newInst = createInstrument(state, id, 'misc', 'Misc', 'New Instrument');
    wrappedDispatch({
      type: 'ADD_INSTRUMENT',
      id: newInst.id,
      category: newInst.category,
      presetVariety: newInst.presetVariety,
      label: newInst.customName,
    });
  };

  const renderHeader = () => {
    if (!state) return null;
    const { timeSignature, resolution } = state;
    const notesPerBeat = resolution / timeSignature.beatValue;
    const totalNotes = state.measures * timeSignature.beatsPerMeasure * notesPerBeat;
    const headers = [];

    for (let i = 0; i < totalNotes; i++) {
      const beatIndex = Math.floor(i / notesPerBeat);
      const beatIndexInMeasure = beatIndex % timeSignature.beatsPerMeasure;
      const subIndex = i % notesPerBeat;
      const isMeasureBoundary = (i + 1) % (timeSignature.beatsPerMeasure * notesPerBeat) === 0;

      let label = '';
      if (subIndex === 0) {
        label = (beatIndexInMeasure + 1).toString();
      } else if (notesPerBeat === 4) {
        if (subIndex === 1) label = 'e';
        else if (subIndex === 2) label = '+';
        else if (subIndex === 3) label = 'a';
      } else if (notesPerBeat === 2) {
        if (subIndex === 1) label = '+';
      }

      headers.push(
        <div
          key={i}
          data-testid={activeStep === i ? 'active-step' : `step-${i}`}
          className={`w-10 h-10 flex items-center justify-center text-[9px] font-headline font-black border-r border-outline-variant/10 bg-surface-container-highest select-none
            ${isMeasureBoundary ? 'border-r-2 border-r-outline-variant/30' : ''}
            ${activeStep === i ? 'bg-primary/20' : ''}
          `}
        >
          {subIndex === 0 ? (
            <span className="text-primary" data-testid={`beat-label-${beatIndex + 1}`}>
              {label}
            </span>
          ) : (
            <span className="text-on-surface-variant/30">{label}</span>
          )}
        </div>,
      );
    }

    return (
      <div className="flex border-b border-outline-variant/10 sticky top-0 z-20">
        <div className="w-32 h-10 bg-surface-container-low border-r border-outline-variant/10 flex-shrink-0" />
        <div className="flex bg-surface-container">{headers}</div>
      </div>
    );
  };

  const notesPerMeasure =
    state.timeSignature.beatsPerMeasure * (state.resolution / state.timeSignature.beatValue);
  const twoMeasuresWidth = 128 + notesPerMeasure * 2 * 40;

  return (
    <div className="flex flex-col gap-6 print:gap-1 no-print-break" data-testid="groove-editor">
      <GrooveGridToolbar
        state={state}
        isPlaying={isPlaying}
        isSamplesLoaded={isSamplesLoaded}
        togglePlayback={togglePlayback}
        bpm={bpm}
        onBpmChange={(newBpm) => {
          if (onBpmChange) {
            onBpmChange(newBpm);
          } else {
            setLocalBpm(newBpm);
          }
        }}
        metronomeEnabled={metronomeEnabled}
        onMetronomeToggle={(newState) => {
          setMetronomeEnabled(newState);
          onMetronomeToggle?.(newState);
        }}
        metronomeVolume={metronomeVolume}
        onMetronomeVolumeChange={(newVal) => {
          setMetronomeVolume(newVal);
          onMetronomeVolumeChange?.(newVal);
        }}
        updateMeasures={updateMeasures}
        updateResolution={updateResolution}
        updateTimeSignature={updateTimeSignature}
        isEditingInstruments={isEditingInstruments}
        onToggleEditInstruments={() => setIsEditingInstruments(!isEditingInstruments)}
        onToggleOptionalHits={(enabled) =>
          wrappedDispatch({
            type: 'SET_GRID_SETTINGS',
            settings: { playbackOptionalHits: enabled },
          })
        }
        onClearGrid={() => wrappedDispatch({ type: 'CLEAR_GRID' })}
        readOnly={readOnly}
      />

      <div
        className="relative border border-outline-variant/10 shadow-xl rounded-2xl bg-surface-container-low overflow-hidden print:border-none print:shadow-none print:overflow-visible"
        style={{
          maxWidth: `${twoMeasuresWidth}px`,
          width: 'fit-content',
        }}
        data-testid="groove-grid"
      >
        <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div className="flex flex-col min-w-max">
            {renderHeader()}
            <div className="flex flex-col">
              {state?.instruments.map((inst, instIdx) => (
                <InstrumentRow
                  key={inst.id}
                  instrument={inst}
                  grid={state}
                  onNoteClick={(idx, e) => handleNoteClick(inst.id, idx, e)}
                  onNoteContextMenu={(idx, e) => handleNoteContextMenu(inst.id, idx, e)}
                  onNoteMouseDown={(idx, e) => handleNoteMouseDown(instIdx, idx, e)}
                  onNoteMouseEnter={(idx) => handleNoteMouseEnter(instIdx, idx)}
                  selectionRange={selectionRange}
                  instIdx={instIdx}
                  isEditing={isEditingInstruments}
                  onSettingsClick={() => setEditingInstrumentId(inst.id)}
                  onMoveUp={() =>
                    wrappedDispatch({ type: 'MOVE_INSTRUMENT', id: inst.id, direction: 'up' })
                  }
                  onMoveDown={() =>
                    wrappedDispatch({ type: 'MOVE_INSTRUMENT', id: inst.id, direction: 'down' })
                  }
                  onClear={() => wrappedDispatch({ type: 'CLEAR_ROW', id: inst.id })}
                  onPresetSelect={(preset) =>
                    wrappedDispatch({ type: 'APPLY_ROW_PRESET', id: inst.id, preset })
                  }
                  readOnly={readOnly}
                />
              ))}

              {isEditingInstruments && (
                <button
                  key="add-instrument"
                  onClick={handleAddInstrument}
                  className="flex items-center justify-center h-10 w-full bg-surface-container-highest/30 border-t border-outline-variant/10 hover:bg-primary/5 text-primary text-[10px] font-headline font-black transition-all uppercase tracking-[0.2em]"
                  data-testid="add-instrument-button"
                >
                  <Plus size={14} className="mr-2" />
                  Add Instrument
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {pickerPos && (
        <SymbolPicker
          position={{ top: pickerPos.top, left: pickerPos.left }}
          onSelect={handleSymbolSelect}
          category={state.instruments.find((i) => i.id === pickerPos.id)?.category}
          onVelocityChange={(vel) => handleVelocityChange(pickerPos.id, pickerPos.noteIndex, vel)}
          currentVelocity={
            state.instruments.find((i) => i.id === pickerPos.id)?.velocities?.[
              pickerPos.noteIndex
            ] ??
            getVelocityForSymbol(
              state.instruments.find((i) => i.id === pickerPos.id)?.notes[pickerPos.noteIndex] ??
                'none',
            )
          }
          onClose={() => setPickerPos(null)}
        />
      )}

      {(() => {
        const editingInstrument = editingInstrumentId
          ? state.instruments.find((i) => i.id === editingInstrumentId)
          : undefined;

        if (!editingInstrument) return null;

        return (
          <InstrumentSettingsModal
            instrument={editingInstrument}
            onClose={() => setEditingInstrumentId(null)}
            onSave={(updates) => {
              wrappedDispatch({ type: 'UPDATE_INSTRUMENT', id: editingInstrument.id, updates });
            }}
            onDelete={() => {
              wrappedDispatch({ type: 'REMOVE_INSTRUMENT', id: editingInstrument.id });
            }}
          />
        );
      })()}
    </div>
  );
};

'use client';

import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useReducer, useState } from 'react';

import { useAudioPlayback } from '@/lib/hooks/useAudioPlayback';
import { type GrooveAction, grooveReducer } from '@/lib/state/groove-reducer';
import {
  type BeatResolution,
  createInstrument,
  type DrumSymbol,
  type GrooveGrid,
  getVelocityForSymbol,
} from '@/lib/types/groove';
import { GrooveGridToolbar } from './GrooveGridToolbar';
import { InstrumentRow } from './InstrumentRow';
import { InstrumentSettingsModal } from './InstrumentSettingsModal';
import { SymbolPicker } from './SymbolPicker';

interface GrooveGridEditorProps {
  initialGrid: GrooveGrid;
  onChange?: (grid: GrooveGrid) => void;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  metronomeEnabled?: boolean;
  onMetronomeToggle?: (enabled: boolean) => void;
  metronomeVolume?: number;
  onMetronomeVolumeChange?: (volume: number) => void;
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
}) => {
  const [state, dispatch] = useReducer(grooveReducer, initialGrid);
  const [pickerPos, setPickerPos] = useState<{
    top: number;
    left: number;
    id: string;
    noteIndex: number;
  } | null>(null);
  const [_showSettings, _setShowSettings] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [localBpm, setLocalBpm] = useState(120);
  const [isEditingInstruments, setIsEditingInstruments] = useState(false);
  const [editingInstrumentId, setEditingInstrumentId] = useState<string | null>(null);

  const bpm = parentBpm !== undefined ? parentBpm : localBpm;

  const {
    isPlaying,
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
      dispatch(action);
      // Note: This is a bit tricky because useReducer's state isn't updated yet.
      // We should ideally use the reducer function directly to get the next state for the callback.
      onChange?.(grooveReducer(state, action));
    },
    [onChange, state],
  );

  const handleNoteClick = (id: string, noteIndex: number) => {
    wrappedDispatch({ type: 'TOGGLE_NOTE', id, noteIndex });
  };

  const handleNoteContextMenu = (id: string, noteIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setPickerPos({
      top: e.clientY,
      left: e.clientX,
      id,
      noteIndex,
    });
  };

  const handleVelocityChange = (id: string, noteIndex: number, velocity: number) => {
    wrappedDispatch({
      type: 'SET_VELOCITY',
      id,
      noteIndex,
      velocity,
    });
  };

  const handleSymbolSelect = (symbol: DrumSymbol) => {
    if (!pickerPos) return;
    wrappedDispatch({
      type: 'SET_SYMBOL',
      id: pickerPos.id,
      noteIndex: pickerPos.noteIndex,
      symbol,
    });
  };

  const updateMeasures = (delta: number) => {
    const newMeasures = Math.max(1, state.measures + delta);
    if (newMeasures !== state.measures) {
      wrappedDispatch({ type: 'SET_MEASURES', measures: newMeasures });
    }
  };

  const updateResolution = (res: BeatResolution) => {
    wrappedDispatch({ type: 'SET_RESOLUTION', resolution: res });
  };

  const updateTimeSignature = (beats: number, value: number) => {
    wrappedDispatch({
      type: 'SET_TIME_SIGNATURE',
      beatsPerMeasure: Math.max(1, beats),
      beatValue: value,
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

  // Generate headers (1 e + a)
  const renderHeader = () => {
    if (!state) return null;
    const { timeSignature, resolution, measures } = state;
    const notesPerBeat = resolution / timeSignature.beatValue;
    const totalNotes = timeSignature.beatsPerMeasure * notesPerBeat * measures;

    const headers = [];
    for (let i = 0; i < totalNotes; i++) {
      let label = '';
      const beatIndex = Math.floor(i / notesPerBeat) % timeSignature.beatsPerMeasure;
      const subIndex = i % notesPerBeat;

      if (subIndex === 0) {
        label = (beatIndex + 1).toString();
      } else if (resolution === 16) {
        if (subIndex === 1) label = 'e';
        else if (subIndex === 2) label = '+';
        else if (subIndex === 3) label = 'a';
      } else if (resolution === 8 && subIndex === 1) {
        label = '+';
      }

      const isMeasureBoundary = (i + 1) % (timeSignature.beatsPerMeasure * notesPerBeat) === 0;

      headers.push(
        <div
          key={i}
          data-testid={activeStep === i ? 'active-step' : `step-${i}`}
          className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-r border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 select-none
            ${subIndex === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
            ${isMeasureBoundary ? 'border-r-2 border-r-gray-800 dark:border-r-gray-200' : ''}
            ${activeStep === i ? 'bg-yellow-200 dark:bg-yellow-900' : ''}
          `}
        >
          {label}
        </div>,
      );
    }

    return (
      <div className="flex border-b-2 border-gray-400 dark:border-gray-600">
        <div className="w-32 h-8 bg-gray-200 dark:bg-gray-800 border-r border-gray-400 dark:border-gray-600" />
        <div className="flex">{headers}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 print:gap-1 no-print-break" data-testid="groove-editor">
      <GrooveGridToolbar
        state={state}
        isPlaying={isPlaying}
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
      />

      <div
        className="inline-block border border-gray-400 dark:border-gray-600 shadow-sm rounded-sm bg-white dark:bg-gray-950 overflow-x-auto max-w-full print:border-none print:shadow-none print:overflow-visible dark:print:bg-white dark:print:border-none"
        data-testid="groove-grid"
      >
        {renderHeader()}
        <div className="flex flex-col">
          {state?.instruments.map((inst) => (
            <InstrumentRow
              key={inst.id}
              instrument={inst}
              grid={state}
              onNoteClick={(idx) => handleNoteClick(inst.id, idx)}
              onNoteContextMenu={(idx, e) => handleNoteContextMenu(inst.id, idx, e)}
              isEditing={isEditingInstruments}
              onSettingsClick={() => setEditingInstrumentId(inst.id)}
              onMoveUp={() =>
                wrappedDispatch({ type: 'MOVE_INSTRUMENT', id: inst.id, direction: 'up' })
              }
              onMoveDown={() =>
                wrappedDispatch({ type: 'MOVE_INSTRUMENT', id: inst.id, direction: 'down' })
              }
            />
          ))}

          {isEditingInstruments && (
            <button
              onClick={handleAddInstrument}
              className="flex items-center justify-center h-8 w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors uppercase tracking-wider"
              data-testid="add-instrument-button"
            >
              <Plus size={14} className="mr-1" />
              Add Instrument
            </button>
          )}
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
    </div>
  );
};

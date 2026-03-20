'use client';

import React, { useEffect, useReducer, useState } from 'react';

import { useAudioPlayback } from '@/lib/hooks/useAudioPlayback';
import { type GrooveAction, grooveReducer } from '@/lib/state/groove-reducer';
import {
  type BeatResolution,
  type DrumSymbol,
  type GrooveGrid,
  getVelocityForSymbol,
} from '@/lib/types/groove';
import { GrooveGridToolbar } from './GrooveGridToolbar';
import { InstrumentRow } from './InstrumentRow';
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
    instrumentId: string;
    noteIndex: number;
  } | null>(null);
  const [_showSettings, _setShowSettings] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [localBpm, setLocalBpm] = useState(120);

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
        initialGrid.timeSignature.beatValue !== state.timeSignature.beatValue;

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
  ]);

  const wrappedDispatch = (action: GrooveAction) => {
    dispatch(action);
    // Note: This is a bit tricky because useReducer's state isn't updated yet.
    // We should ideally use the reducer function directly to get the next state for the callback.
    onChange?.(grooveReducer(state, action));
  };

  const handleNoteClick = (instrumentId: string, noteIndex: number) => {
    wrappedDispatch({ type: 'TOGGLE_NOTE', instrumentId, noteIndex });
  };

  const handleNoteContextMenu = (instrumentId: string, noteIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setPickerPos({
      top: e.clientY,
      left: e.clientX,
      instrumentId,
      noteIndex,
    });
  };

  const handleVelocityChange = (instrumentId: string, noteIndex: number, velocity: number) => {
    wrappedDispatch({
      type: 'SET_VELOCITY',
      instrumentId,
      noteIndex,
      velocity,
    });
  };

  const handleSymbolSelect = (symbol: DrumSymbol) => {
    if (!pickerPos) return;
    wrappedDispatch({
      type: 'SET_SYMBOL',
      instrumentId: pickerPos.instrumentId,
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
        <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 border-r border-gray-400 dark:border-gray-600" />
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
      />

      <div
        className="inline-block border border-gray-400 dark:border-gray-600 shadow-sm rounded-sm bg-white dark:bg-gray-950 overflow-x-auto max-w-full print:border-none print:shadow-none print:overflow-visible dark:print:bg-white dark:print:border-none"
        data-testid="groove-grid"
      >
        {renderHeader()}
        <div className="flex flex-col">
          {state?.instruments.map((inst) => (
            <InstrumentRow
              key={inst.instrumentId}
              instrumentId={inst.instrumentId}
              label={inst.label}
              notes={inst.notes}
              velocities={inst.velocities}
              grid={state}
              onNoteClick={(idx) => handleNoteClick(inst.instrumentId, idx)}
              onNoteContextMenu={(idx, e) => handleNoteContextMenu(inst.instrumentId, idx, e)}
            />
          ))}
        </div>

        {pickerPos && (
          <SymbolPicker
            position={{ top: pickerPos.top, left: pickerPos.left }}
            onSelect={handleSymbolSelect}
            onVelocityChange={(vel) =>
              handleVelocityChange(pickerPos.instrumentId, pickerPos.noteIndex, vel)
            }
            currentVelocity={
              state.instruments.find((i) => i.instrumentId === pickerPos.instrumentId)
                ?.velocities?.[pickerPos.noteIndex] ??
              getVelocityForSymbol(
                state.instruments.find((i) => i.instrumentId === pickerPos.instrumentId)?.notes[
                  pickerPos.noteIndex
                ] ?? 'none',
              )
            }
            onClose={() => setPickerPos(null)}
          />
        )}
      </div>
    </div>
  );
};

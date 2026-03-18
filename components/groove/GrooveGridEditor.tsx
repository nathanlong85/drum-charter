'use client';

import { Bell, BellOff, Minus, Play, Plus, Square, Volume2 } from 'lucide-react';
import React, { useEffect, useReducer, useState } from 'react';
import { useAudioPlayback } from '@/lib/hooks/useAudioPlayback';
import { type GrooveAction, grooveReducer } from '@/lib/state/groove-reducer';
import type { BeatResolution, DrumSymbol, GrooveGrid } from '@/lib/types/groove';
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
  const [showMetronomeSettings, setShowMetronomeSettings] = useState(false);

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

  const getVelocityForSymbol = (symbol: DrumSymbol): number => {
    if (symbol.includes('accent')) return 1.0;
    if (symbol.includes('ghost')) return 0.3;
    if (symbol === 'none') return 0;
    return 0.7; // Standard
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
    <div className="flex flex-col gap-2 print:gap-1 no-print-break">
      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-800 text-sm no-print">
        <div className="flex items-center gap-2 pr-4 border-r border-gray-300 dark:border-gray-700">
          <button
            onClick={togglePlayback}
            className={`flex items-center gap-2 px-4 py-1.5 rounded font-bold transition-colors ${
              isPlaying
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={16} fill="currentColor" />
                Stop
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Play
              </>
            )}
          </button>

          <div className="flex items-center gap-2 ml-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium">BPM:</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => {
                const newBpm = parseInt(e.target.value, 10) || 60;
                if (onBpmChange) {
                  onBpmChange(newBpm);
                } else {
                  setLocalBpm(newBpm);
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-center font-bold"
              min="40"
              max="300"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-4 relative">
          <button
            onClick={() => {
              const newState = !metronomeEnabled;
              setMetronomeEnabled(newState);
              onMetronomeToggle?.(newState);
            }}
            className={`p-1.5 rounded transition-colors ${
              metronomeEnabled
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title={metronomeEnabled ? 'Disable Metronome' : 'Enable Metronome'}
          >
            {metronomeEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>

          <button
            onClick={() => setShowMetronomeSettings(!showMetronomeSettings)}
            className={`p-1.5 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 ${
              showMetronomeSettings ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Metronome Settings"
          >
            <Volume2 size={18} />
          </button>

          {showMetronomeSettings && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-3 min-w-[120px]">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                  Click Volume
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={metronomeVolume}
                  onChange={(e) => {
                    const newVal = parseFloat(e.target.value);
                    setMetronomeVolume(newVal);
                    onMetronomeVolumeChange?.(newVal);
                  }}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                  <span>Soft</span>
                  <span>Loud</span>
                </div>
              </div>
              <button
                className="w-full mt-2 text-[10px] text-blue-600 dark:text-blue-400 hover:underline text-center"
                onClick={() => setShowMetronomeSettings(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Measures:</span>
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
            <button
              onClick={() => updateMeasures(-1)}
              className="px-2 py-1 hover:bg-gray-100 border-r border-gray-300"
              title="Decrease measures"
            >
              <Minus size={14} />
            </button>
            <span className="px-3 py-1 font-bold min-w-[2rem] text-center">{state.measures}</span>
            <button
              onClick={() => updateMeasures(1)}
              className="px-2 py-1 hover:bg-gray-100"
              title="Increase measures"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Resolution:</span>
          <div className="flex border border-gray-300 rounded overflow-hidden bg-white">
            {[4, 8, 16].map((res) => (
              <button
                key={res}
                onClick={() => updateResolution(res as BeatResolution)}
                className={`px-3 py-1 border-r last:border-r-0 border-gray-300 hover:bg-gray-100 ${
                  state.resolution === res ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Time Sig:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={state.timeSignature.beatsPerMeasure}
              onChange={(e) =>
                updateTimeSignature(
                  parseInt(e.target.value, 10) || 1,
                  state.timeSignature.beatValue,
                )
              }
              className="w-12 px-2 py-1 border border-gray-300 rounded text-center font-bold"
              min="1"
            />
            <span className="text-gray-400">/</span>
            <select
              value={state.timeSignature.beatValue}
              onChange={(e) =>
                updateTimeSignature(
                  state.timeSignature.beatsPerMeasure,
                  parseInt(e.target.value, 10),
                )
              }
              className="px-2 py-1 border border-gray-300 rounded bg-white font-bold"
            >
              {[2, 4, 8, 16].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="inline-block border border-gray-400 shadow-sm rounded-sm bg-white overflow-x-auto max-w-full print:border-none print:shadow-none print:overflow-visible">
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

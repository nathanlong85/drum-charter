import { Bell, BellOff, Minus, Play, Plus, Square, Volume2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { BeatResolution, GrooveGrid } from '@/lib/types/groove';

const toolbarContainerClass =
  'flex items-center bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-800 text-sm no-print';
const controlGroupClass =
  'flex items-center gap-2 pr-4 border-r border-gray-300 dark:border-gray-700';
const subGroupClass =
  'flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-4 relative';
const lastGroupClass = 'flex items-center gap-2';
const mutedLabelClass = 'text-gray-600 dark:text-gray-400 font-medium';
const borderedInputClass =
  'w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-center font-bold';
const iconButtonClass = 'p-1.5 rounded transition-colors';
const panelClass =
  'absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-3 min-w-[120px]';
const controlBoxClass =
  'flex items-center border border-gray-300 dark:border-gray-700 rounded overflow-hidden bg-white dark:bg-gray-800';
const controlBtnClass =
  'px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300';

export interface GrooveGridToolbarProps {
  state: GrooveGrid;
  isPlaying: boolean;
  togglePlayback: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  metronomeEnabled: boolean;
  onMetronomeToggle: (enabled: boolean) => void;
  metronomeVolume: number;
  onMetronomeVolumeChange: (volume: number) => void;
  updateMeasures: (delta: number) => void;
  updateResolution: (res: BeatResolution) => void;
  updateTimeSignature: (beats: number, value: number) => void;
}

export const GrooveGridToolbar: React.FC<GrooveGridToolbarProps> = ({
  state,
  isPlaying,
  togglePlayback,
  bpm,
  onBpmChange,
  metronomeEnabled,
  onMetronomeToggle,
  metronomeVolume,
  onMetronomeVolumeChange,
  updateMeasures,
  updateResolution,
  updateTimeSignature,
}) => {
  const [showMetronomeSettings, setShowMetronomeSettings] = useState(false);

  return (
    <div className={`${toolbarContainerClass} gap-4`} data-testid="groove-toolbar">
      <div className={controlGroupClass}>
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
          <span className={mutedLabelClass}>BPM:</span>
          <input
            type="number"
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value, 10) || 60)}
            className={borderedInputClass}
            min="40"
            max="300"
          />
        </div>
      </div>

      <div className={subGroupClass}>
        <button
          onClick={() => onMetronomeToggle(!metronomeEnabled)}
          className={`${iconButtonClass} ${
            metronomeEnabled
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          title={metronomeEnabled ? 'Disable Metronome' : 'Enable Metronome'}
          aria-label={metronomeEnabled ? 'Disable Metronome' : 'Enable Metronome'}
        >
          {metronomeEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        </button>

        <button
          onClick={() => setShowMetronomeSettings(!showMetronomeSettings)}
          className={`${iconButtonClass} hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 ${
            showMetronomeSettings ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Metronome Settings"
          aria-label="Metronome Settings"
        >
          <Volume2 size={18} />
        </button>

        {showMetronomeSettings && (
          <div className={panelClass} data-testid="metronome-settings-panel">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Click Volume
              </span>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">
                  Level
                </span>
                <span
                  className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded"
                  data-testid="metronome-volume-value"
                >
                  {Math.round(metronomeVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={metronomeVolume}
                onChange={(e) => onMetronomeVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
                data-testid="metronome-volume-slider"
              />
              <div className="flex justify-between mt-1">
                <button
                  onClick={() => onMetronomeVolumeChange(0.3)}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                >
                  Ghost
                </button>
                <button
                  onClick={() => onMetronomeVolumeChange(0.7)}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                >
                  Std
                </button>
                <button
                  onClick={() => onMetronomeVolumeChange(1.0)}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                >
                  Accent
                </button>
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

      <div className={lastGroupClass}>
        <span className={mutedLabelClass}>Measures:</span>
        <div className={controlBoxClass}>
          <button
            onClick={() => updateMeasures(-1)}
            className={`${controlBtnClass} border-r border-gray-300 dark:border-gray-700`}
            title="Decrease measures"
          >
            <Minus size={14} />
          </button>
          <span className="px-3 py-1 font-bold min-w-[2rem] text-center text-gray-900 dark:text-gray-100">
            {state.measures}
          </span>
          <button
            onClick={() => updateMeasures(1)}
            className={controlBtnClass}
            title="Increase measures"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className={lastGroupClass}>
        <span className={mutedLabelClass}>Resolution:</span>
        <div className={controlBoxClass}>
          {[4, 8, 16].map((res) => (
            <button
              key={res}
              onClick={() => updateResolution(res as BeatResolution)}
              className={`px-3 py-1 border-r last:border-r-0 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${
                state.resolution === res
                  ? 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700'
                  : ''
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      <div className={lastGroupClass}>
        <span className={mutedLabelClass}>Time Sig:</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={state.timeSignature.beatsPerMeasure}
            onChange={(e) =>
              updateTimeSignature(parseInt(e.target.value, 10) || 1, state.timeSignature.beatValue)
            }
            className={`${borderedInputClass} w-12`}
            min="1"
          />
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <select
            value={state.timeSignature.beatValue}
            onChange={(e) =>
              updateTimeSignature(state.timeSignature.beatsPerMeasure, parseInt(e.target.value, 10))
            }
            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
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
  );
};

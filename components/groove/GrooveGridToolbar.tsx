import {
  Bell,
  BellOff,
  Layers,
  Minus,
  Play,
  Plus,
  Settings2,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { BeatResolution, GrooveGrid } from '@/lib/types/groove';

const toolbarContainerClass =
  'flex items-center bg-surface-container-low p-2 rounded-xl border border-outline-variant/10 text-sm no-print shadow-sm';
const controlGroupClass =
  'flex items-center gap-2 pr-4 border-r border-outline-variant/10';
const subGroupClass =
  'flex items-center gap-1 border-r border-outline-variant/10 pr-4 relative';
const lastGroupClass = 'flex items-center gap-2';
const mutedLabelClass =
  'text-on-surface-variant font-headline font-bold text-[10px] uppercase tracking-widest';
const borderedInputClass =
  'w-16 px-2 py-1 border border-outline-variant/20 bg-surface-container-highest text-on-surface rounded-lg text-center font-bold font-headline focus:ring-1 focus:ring-primary/50 outline-none transition-all';
const iconButtonClass = 'p-1.5 rounded-lg transition-all';
const panelClass =
  'absolute top-full left-0 mt-2 z-50 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-4 min-w-[160px] animate-in fade-in slide-in-from-top-2';
const controlBoxClass =
  'flex items-center border border-outline-variant/20 rounded-lg overflow-hidden bg-surface-container-highest';
const controlBtnClass =
  'px-2 py-1 hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors';

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
  isEditingInstruments?: boolean;
  onToggleEditInstruments?: () => void;
  onToggleOptionalHits?: (enabled: boolean) => void;
  onClearGrid?: () => void;
  readOnly?: boolean;
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
  isEditingInstruments,
  onToggleEditInstruments,
  onToggleOptionalHits,
  onClearGrid,
  readOnly = false,
}) => {
  const [showMetronomeSettings, setShowMetronomeSettings] = useState(false);

  return (
    <div className={`${toolbarContainerClass} gap-4`} data-testid="groove-toolbar">
      <div className={controlGroupClass}>
        <button
          onClick={togglePlayback}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-black font-headline uppercase tracking-tighter transition-all ${
            isPlaying
              ? 'bg-error text-on-error hover:opacity-90'
              : 'bg-primary text-on-primary hover:opacity-90 shadow-[0_0_15px_var(--color-primary-dim)]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square size={14} fill="currentColor" />
              Stop
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              Play
            </>
          )}
        </button>

        <div className="flex items-center gap-2 ml-2">
          <span className={mutedLabelClass}>BPM:</span>
          <input
            type="number"
            value={bpm}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (Number.isNaN(val)) return;
              onBpmChange(Math.max(40, Math.min(300, val)));
            }}
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
          aria-pressed={metronomeEnabled}
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
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
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
          {!readOnly && (
            <button
              onClick={() => updateMeasures(-1)}
              className={`${controlBtnClass} border-r border-gray-300 dark:border-gray-700`}
              title="Decrease measures"
            >
              <Minus size={14} />
            </button>
          )}
          <span className="px-3 py-1 font-bold min-w-[2rem] text-center text-gray-900 dark:text-gray-100">
            {state.measures}
          </span>
          {!readOnly && (
            <button
              onClick={() => updateMeasures(1)}
              className={controlBtnClass}
              title="Increase measures"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      <div className={lastGroupClass}>
        <span className={mutedLabelClass}>Resolution:</span>
        <div className={controlBoxClass}>
          {[4, 8, 16].map((res) => (
            <button
              key={res}
              disabled={readOnly}
              data-testid={`resolution-button-${res}`}
              onClick={() => updateResolution(res as BeatResolution)}
              className={`px-3 py-1 border-r last:border-r-0 border-outline-variant/10 text-on-surface-variant font-headline font-bold ${
                state.resolution === res
                  ? 'bg-primary text-on-primary'
                  : !readOnly
                    ? 'hover:bg-primary/10 hover:text-primary'
                    : ''
              } ${readOnly && state.resolution !== res ? 'opacity-50 grayscale' : ''}`}
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
            disabled={readOnly}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (Number.isNaN(val)) return;
              updateTimeSignature(Math.max(1, val), state.timeSignature.beatValue);
            }}
            className={`${borderedInputClass} w-12 disabled:bg-transparent disabled:border-none`}
            min="1"
          />
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <select
            value={state.timeSignature.beatValue}
            disabled={readOnly}
            onChange={(e) =>
              updateTimeSignature(state.timeSignature.beatsPerMeasure, parseInt(e.target.value, 10))
            }
            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold disabled:bg-transparent disabled:border-none disabled:appearance-none"
          >
            {[2, 4, 8, 16].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1" />

      <div className={lastGroupClass}>
        {!readOnly && (
          <button
            onClick={() => {
              if (window.confirm('Clear all notes in the grid?')) {
                onClearGrid?.();
              }
            }}
            className={`${iconButtonClass} bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400`}
            title="Clear Grid"
            data-testid="clear-grid-button"
          >
            <Trash2 size={18} />
          </button>
        )}

        <button
          onClick={() => onToggleOptionalHits?.(state.playbackOptionalHits === false)}
          className={`${iconButtonClass} ${
            state.playbackOptionalHits !== false
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
          }`}
          title={state.playbackOptionalHits !== false ? 'Hide Optional Hits' : 'Play Optional Hits'}
        >
          <Layers size={18} />
        </button>

        {!readOnly && (
          <button
            onClick={() => onToggleEditInstruments?.()}
            className={`${iconButtonClass} ${
              isEditingInstruments
                ? 'bg-primary text-on-primary shadow-[0_0_10px_var(--color-primary-dim)]'
                : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
            }`}
            title={isEditingInstruments ? 'Finish Editing' : 'Edit Instruments'}
          >
            <Settings2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

'use client';

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
import type { BeatResolution, GrooveGrid, TimeSignature } from '@/lib/types/groove';
import {
  MAX_BEATS_PER_MEASURE,
  MIN_BEATS_PER_MEASURE,
  VALID_BEAT_VALUES,
} from '@/lib/utils/constants';

const toolbarContainerClass =
  'flex items-center bg-surface-container-low p-2 rounded-xl border border-outline-variant/10 text-sm no-print shadow-sm';
const controlGroupClass = 'flex items-center gap-2 pr-4 border-r border-outline-variant/10';
const subGroupClass = 'flex items-center gap-1 border-r border-outline-variant/10 pr-4 relative';
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
  updateTimeSignature: (ts: TimeSignature) => void;
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

        <div className="flex items-center gap-2">
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
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
          }`}
          title={metronomeEnabled ? 'Disable Metronome' : 'Enable Metronome'}
          aria-label={metronomeEnabled ? 'Disable Metronome' : 'Enable Metronome'}
          aria-pressed={metronomeEnabled}
        >
          {metronomeEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        </button>

        <button
          onClick={() => setShowMetronomeSettings(!showMetronomeSettings)}
          className={`${iconButtonClass} ${
            showMetronomeSettings
              ? 'bg-primary/10 text-primary'
              : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
          }`}
          title="Metronome Settings"
          aria-label="Metronome Settings"
        >
          <Volume2 size={18} />
        </button>

        {showMetronomeSettings && (
          <div className={panelClass} data-testid="metronome-settings-panel">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-headline font-black text-on-surface-variant uppercase tracking-widest">
                Click Volume
              </span>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-on-surface-variant/40 uppercase font-headline font-bold">
                  Level
                </span>
                <span
                  className="text-[10px] text-primary font-headline font-black"
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
                  className="text-[9px] font-headline font-bold text-on-surface-variant hover:text-primary uppercase tracking-tighter"
                >
                  Ghost
                </button>
                <button
                  onClick={() => onMetronomeVolumeChange(0.7)}
                  className="text-[9px] font-headline font-bold text-on-surface-variant hover:text-primary uppercase tracking-tighter"
                >
                  Standard
                </button>
                <button
                  onClick={() => onMetronomeVolumeChange(1.0)}
                  className="text-[9px] font-headline font-bold text-on-surface-variant hover:text-primary uppercase tracking-tighter"
                >
                  Full
                </button>
              </div>
              <button
                onClick={() => setShowMetronomeSettings(false)}
                data-testid="close-metronome-settings"
                className="mt-4 w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-headline font-black uppercase tracking-widest py-2 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={lastGroupClass}>
        <span className={mutedLabelClass}>Time:</span>
        <div className={controlBoxClass}>
          <input
            type="number"
            value={state.timeSignature.beatsPerMeasure}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (Number.isNaN(val)) return;
              updateTimeSignature({
                ...state.timeSignature,
                beatsPerMeasure: Math.min(
                  Math.max(val, MIN_BEATS_PER_MEASURE),
                  MAX_BEATS_PER_MEASURE,
                ),
              });
            }}
            className="w-10 px-1 py-1 bg-transparent text-center font-bold font-headline focus:outline-none"
            min={MIN_BEATS_PER_MEASURE}
            max={MAX_BEATS_PER_MEASURE}
            title="Beats per measure"
          />
          <span className="text-on-surface-variant/40">/</span>
          <select
            value={state.timeSignature.beatValue}
            onChange={(e) => {
              updateTimeSignature({
                ...state.timeSignature,
                beatValue: parseInt(e.target.value, 10),
              });
            }}
            className="bg-transparent px-1 py-1 font-bold font-headline focus:outline-none appearance-none cursor-pointer"
            title="Beat value"
          >
            {VALID_BEAT_VALUES.map((v) => (
              <option key={v} value={v} className="bg-surface-container-low text-on-surface">
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={lastGroupClass}>
        <span className={mutedLabelClass}>Measures:</span>
        <div className={controlBoxClass} data-testid="measures-control">
          {!readOnly && (
            <button
              onClick={() => updateMeasures(-1)}
              className={`${controlBtnClass} border-r border-outline-variant/10`}
              title="Decrease measures"
            >
              <Minus size={14} />
            </button>
          )}
          <span className="px-3 py-1 font-bold min-w-[2rem] text-center text-on-surface font-headline">
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
        <span className={mutedLabelClass}>Res:</span>
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

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {!readOnly && onClearGrid && (
          <button
            onClick={() => {
              if (window.confirm('Clear entire grid?')) {
                onClearGrid();
              }
            }}
            className={`${iconButtonClass} bg-error/10 text-error hover:bg-error/20`}
            title="Clear All"
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

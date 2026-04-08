'use client';

import { Bell, BellOff, Layers, Play, RefreshCw, Square, Trash2, Volume2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { BeatResolution } from '@/lib/types/groove';
import { MAX_BEATS_PER_MEASURE, MIN_BEATS_PER_MEASURE } from '@/lib/utils/constants';
import { useGrooveGrid } from './GrooveGridContext';

const VALID_BEAT_VALUES = [4, 8, 16];

const podClass =
  'flex items-center gap-3 bg-surface-container-high border border-outline-variant/10 px-4 py-2 rounded-xl shadow-sm';
const podLabelClass =
  'text-[9px] font-headline font-black text-on-surface-variant/40 uppercase tracking-[0.2em]';
const controlBtnClass =
  'p-1.5 hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors rounded-lg';

export interface GrooveGridToolbarProps {
  children?: React.ReactNode;
}

const ToolbarRoot: React.FC<GrooveGridToolbarProps> = ({ children }) => {
  return (
    <div className="flex flex-wrap gap-3 items-start no-print" data-testid="groove-toolbar">
      {children || (
        <>
          <ToolbarTransport />
          <ToolbarMetronome />
          <ToolbarSetup />
          <div className="flex-1" />
          <ToolbarTools />
        </>
      )}
    </div>
  );
};

const ToolbarTransport: React.FC = () => {
  const { isPlaying, isSamplesLoaded, togglePlayback, bpm, setBpm, readOnly } = useGrooveGrid();

  return (
    <div className={podClass}>
      <div className="flex flex-col gap-1">
        <span className={podLabelClass}>Transport</span>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayback}
            disabled={!isSamplesLoaded}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-md ${
              isPlaying
                ? 'bg-error text-on-error hover:bg-error-dim'
                : 'bg-primary text-on-primary hover:bg-primary-dim'
            } disabled:opacity-50 disabled:grayscale`}
            title={isPlaying ? 'Stop' : 'Play'}
            data-testid="playback-toggle"
          >
            {isSamplesLoaded ? (
              isPlaying ? (
                <>
                  <Square size={20} fill="currentColor" />
                  <span className="sr-only">Stop</span>
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" className="ml-1" />
                  <span className="sr-only">Play</span>
                </>
              )
            ) : (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span className="sr-only">Loading</span>
              </>
            )}
          </button>

          <div className="flex flex-col">
            <span className="text-[10px] font-headline font-bold text-on-surface-variant/60 uppercase leading-none mb-1">
              BPM
            </span>
            <input
              type="number"
              value={bpm || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!Number.isNaN(val)) {
                  setBpm(Math.max(20, Math.min(300, val)));
                }
              }}
              disabled={readOnly}
              className="w-12 bg-transparent font-headline font-black text-lg focus:outline-none p-0 border-none leading-none disabled:opacity-50"
              min="20"
              max="300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolbarMetronome: React.FC = () => {
  const { metronomeEnabled, setMetronomeEnabled, metronomeVolume, setMetronomeVolume } =
    useGrooveGrid();

  const [showMetronomeSettings, setShowMetronomeSettings] = useState(false);

  return (
    <div className={podClass}>
      <div className="flex flex-col gap-1">
        <span className={podLabelClass}>Click</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMetronomeEnabled(!metronomeEnabled)}
            className={`${controlBtnClass} ${metronomeEnabled ? 'text-primary' : ''}`}
            title={metronomeEnabled ? 'Disable Metronome' : 'Enable Metronome'}
          >
            {metronomeEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMetronomeSettings(!showMetronomeSettings)}
              className={`${controlBtnClass} ${showMetronomeSettings ? 'bg-primary/10 text-primary' : ''}`}
              title="Metronome Settings"
            >
              <Volume2 size={18} />
            </button>

            {showMetronomeSettings && (
              <div
                className="absolute top-full left-0 mt-2 z-50 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-4 min-w-[160px] animate-in fade-in slide-in-from-top-2"
                data-testid="metronome-settings-panel"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-headline font-black text-on-surface-variant uppercase tracking-widest">
                      Volume
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
                    onChange={(e) => setMetronomeVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    data-testid="metronome-volume-slider"
                  />
                  <div className="flex justify-between mt-1 gap-1 p-1 bg-surface-container-highest rounded-xl">
                    {[
                      { label: 'GHOST', val: 0.3, tid: 'metronome-preset-ghost' },
                      { label: 'STD', val: 0.5, tid: 'metronome-preset-std' },
                      { label: 'FULL', val: 1.0, tid: 'metronome-preset-full' },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => setMetronomeVolume(btn.val)}
                        data-testid={btn.tid}
                        className={`flex-1 text-[8px] font-headline font-black py-1 rounded-md transition-all ${
                          Math.abs(metronomeVolume - btn.val) < 0.05
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-on-surface-variant/60 hover:text-primary hover:bg-surface-bright'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowMetronomeSettings(false)}
                    className="mt-2 w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-headline font-black uppercase tracking-widest py-1.5 rounded-lg"
                    data-testid="close-metronome-settings"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolbarSetup: React.FC = () => {
  const { state, updateTimeSignature, updateMeasures, updateResolution, readOnly } =
    useGrooveGrid();

  return (
    <div className={podClass}>
      <div className="flex flex-col gap-1">
        <span className={podLabelClass}>Grid Setup</span>
        <div className="flex items-center gap-3">
          {/* Time Signature */}
          <div className="flex items-center bg-surface-container-highest px-2 py-1 rounded-lg border border-outline-variant/10">
            <input
              type="number"
              value={state.timeSignature.beatsPerMeasure}
              onChange={(e) => {
                if (readOnly) return;
                const val = parseInt(e.target.value, 10);
                if (!Number.isNaN(val)) {
                  updateTimeSignature({
                    ...state.timeSignature,
                    beatsPerMeasure: Math.max(
                      MIN_BEATS_PER_MEASURE,
                      Math.min(MAX_BEATS_PER_MEASURE, val),
                    ),
                  });
                }
              }}
              disabled={readOnly}
              min={MIN_BEATS_PER_MEASURE}
              max={MAX_BEATS_PER_MEASURE}
              className="w-6 bg-transparent text-center font-headline font-bold text-sm focus:outline-none disabled:opacity-50"
            />
            <span className="text-on-surface-variant/30 text-xs">/</span>
            <select
              value={state.timeSignature.beatValue}
              onChange={(e) => {
                if (readOnly) return;
                updateTimeSignature({
                  ...state.timeSignature,
                  beatValue: parseInt(e.target.value, 10),
                });
              }}
              disabled={readOnly}
              className="bg-transparent font-headline font-bold text-sm focus:outline-none appearance-none cursor-pointer disabled:cursor-default disabled:opacity-50"
            >
              {VALID_BEAT_VALUES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Measures */}
          <div className="flex items-center gap-1">
            {!readOnly && (
              <button
                onClick={() => updateMeasures(-1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-primary/10 rounded text-on-surface-variant"
                title="Decrease measures"
              >
                -
              </button>
            )}
            <div className="flex flex-col items-center">
              <span className="sr-only">Measures:</span>
              <span className="text-[10px] font-headline font-black leading-none">
                {state.measures}
              </span>
              <span className="text-[7px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-tighter">
                Measures
              </span>
            </div>
            {!readOnly && (
              <button
                onClick={() => updateMeasures(1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-primary/10 rounded text-on-surface-variant"
                title="Increase measures"
              >
                +
              </button>
            )}
          </div>

          {/* Resolution */}
          <div className="flex gap-1 bg-surface-container-highest p-0.5 rounded-lg border border-outline-variant/10">
            {[4, 8, 16].map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => !readOnly && updateResolution(res as BeatResolution)}
                disabled={readOnly}
                className={`px-2 py-1 rounded text-[10px] font-headline font-black transition-all ${
                  state.resolution === res
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant/60 hover:text-primary'
                } disabled:opacity-50 disabled:cursor-default`}
                data-testid={`resolution-button-${res}`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolbarTools: React.FC = () => {
  const { state, isEditingInstruments, setIsEditingInstruments, dispatch, readOnly } =
    useGrooveGrid();

  return (
    <div className={podClass}>
      <div className="flex flex-col gap-1">
        <span className={podLabelClass}>Tools</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              dispatch({
                type: 'SET_GRID_SETTINGS',
                settings: { playbackOptionalHits: state.playbackOptionalHits === false },
              })
            }
            className={`${controlBtnClass} ${state.playbackOptionalHits !== false ? 'text-primary bg-primary/10' : ''}`}
            title={
              state.playbackOptionalHits !== false ? 'Hide Optional Hits' : 'Play Optional Hits'
            }
          >
            <Layers size={18} />
          </button>

          {!readOnly && (
            <>
              <button
                onClick={() => setIsEditingInstruments(!isEditingInstruments)}
                className={`${controlBtnClass} ${isEditingInstruments ? 'text-primary bg-primary/10' : ''}`}
                title={isEditingInstruments ? 'Finish Editing' : 'Edit Instruments'}
              >
                <RefreshCw size={18} className={isEditingInstruments ? 'animate-spin-slow' : ''} />
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Clear entire grid?')) {
                    dispatch({ type: 'CLEAR_GRID' });
                  }
                }}
                className={`${controlBtnClass} text-error hover:bg-error/10 hover:text-error`}
                title="Clear Grid"
                data-testid="clear-grid-button"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const GrooveGridToolbar = Object.assign(ToolbarRoot, {
  Transport: ToolbarTransport,
  Metronome: ToolbarMetronome,
  Setup: ToolbarSetup,
  Tools: ToolbarTools,
});

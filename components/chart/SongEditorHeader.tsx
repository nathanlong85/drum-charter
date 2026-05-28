'use client';

import { useId } from 'react';
import { TagInput } from '@/components/common/TagInput';
import {
  MAX_BEATS_PER_MEASURE,
  MIN_BEATS_PER_MEASURE,
  VALID_BEAT_VALUES,
} from '@/lib/utils/constants';
import { useSongEditor } from './SongEditorContext';

/**
 * Header section for title, BPM, time signature, and tags.
 */
export function SongEditorHeader() {
  const { state, dispatch, isSaving } = useSongEditor();
  const manualOrderId = useId();

  return (
    <section className="p-8 pb-4 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 w-full max-w-2xl">
          <div className="flex items-center gap-4 text-primary font-headline uppercase tracking-[0.2em] text-xs font-bold">
            <span>DrumChart</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
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
              <label
                htmlFor={`manual-order-${manualOrderId}`}
                className="font-label text-[10px] font-black uppercase text-on-surface-variant/50 tracking-[0.2em] cursor-pointer hover:text-primary transition-colors"
              >
                Order Override
              </label>
              <span className="text-[10px] text-on-surface-variant/30 font-bold italic">
                (Leave blank for auto-generation)
              </span>
            </div>
            <input
              id={`manual-order-${manualOrderId}`}
              type="text"
              value={state.header.manualOrder || ''}
              data-testid="song-order-override-input"
              onChange={(e) =>
                dispatch({ type: 'UPDATE_MANUAL_ORDER', manualOrder: e.target.value })
              }
              className="w-full bg-surface-container-low/50 border border-outline-variant/10 rounded-xl px-4 py-2 text-sm font-body text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all focus:ring-1 focus:ring-primary/20"
              placeholder="e.g. Intro, Verse, Chorus"
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

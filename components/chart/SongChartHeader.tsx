'use client';

import type React from 'react';
import type { TimeSignature } from '@/lib/types/groove';

interface SongChartHeaderProps {
  title: string;
  bpm?: number;
  timeSignature: TimeSignature;
}

export const SongChartHeader: React.FC<SongChartHeaderProps> = ({ title, bpm, timeSignature }) => {
  return (
    <div className="border-b-4 border-primary pb-6 mb-10">
      <div className="flex justify-between items-end">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-on-surface font-headline leading-none">
          {title}
        </h1>
        <div className="flex gap-12 text-xl font-black text-on-surface font-label tracking-tighter">
          {bpm && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1">
                Tempo (BPM)
              </span>
              <span className="leading-none">{bpm}</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1">
              Time Sig
            </span>
            <span className="leading-none">
              {timeSignature.beatsPerMeasure}
              <span className="text-on-surface-variant/30 px-0.5">/</span>
              {timeSignature.beatValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

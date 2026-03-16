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
    <div className="border-b-2 border-gray-800 pb-4 mb-6">
      <div className="flex justify-between items-baseline">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">{title}</h1>
        <div className="flex gap-8 text-lg font-bold text-gray-700">
          {bpm && (
            <div>
              <span className="text-sm font-normal text-gray-500 uppercase mr-2 tracking-widest">
                BPM
              </span>
              {bpm}
            </div>
          )}
          <div>
            <span className="text-sm font-normal text-gray-500 uppercase mr-2 tracking-widest">
              Time
            </span>
            {timeSignature.beatsPerMeasure}/{timeSignature.beatValue}
          </div>
        </div>
      </div>
    </div>
  );
};

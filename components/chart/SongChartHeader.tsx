'use client';

import type React from 'react';
import type { SongSection, TimeSignature } from '@/lib/types/groove';

interface SongChartHeaderProps {
  title: string;
  bpm?: number;
  timeSignature: TimeSignature;
  sections: SongSection[];
  manualOrder?: string;
}

export const SongChartHeader: React.FC<SongChartHeaderProps> = ({
  title,
  bpm,
  timeSignature,
  sections,
  manualOrder,
}) => {
  const orderList = manualOrder || sections.map((s) => s.name).join(', ');

  return (
    <div className="mb-12 print:mb-8 border-b-2 border-on-surface pb-6">
      <h1 className="text-5xl font-black text-on-surface font-headline leading-tight mb-4">
        {title}
      </h1>
      <div className="flex flex-col gap-1 font-body text-sm font-bold text-on-surface">
        <div className="flex items-center gap-4">
          {bpm && (
            <span>
              BPM: <span className="font-black">{bpm}</span>
            </span>
          )}
          {bpm && <span className="text-outline-variant">|</span>}
          <span>
            Time:{' '}
            <span className="font-black">
              {timeSignature.beatsPerMeasure}/{timeSignature.beatValue}
            </span>
          </span>
        </div>
        {orderList && (
          <div className="leading-relaxed">
            Order: <span className="font-black">{orderList}</span>
          </div>
        )}
      </div>
    </div>
  );
};

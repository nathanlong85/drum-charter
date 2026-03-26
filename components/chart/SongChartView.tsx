'use client';

import type React from 'react';
import type { SongChart } from '@/lib/types/groove';
import { formatDate } from '@/lib/utils/format';
import { SongChartHeader } from './SongChartHeader';
import { SongSectionView } from './SongSectionView';

interface SongChartViewProps {
  chart: SongChart;
}

export const SongChartView: React.FC<SongChartViewProps> = ({ chart }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-surface-container-lowest min-h-screen border-x border-outline-variant/10 shadow-2xl print:p-0 print:max-w-none print:min-h-0 print:shadow-none print:border-none font-body antialiased">
      <SongChartHeader
        title={chart.header.title}
        bpm={chart.header.bpm}
        timeSignature={chart.header.timeSignature}
      />

      <div className="space-y-12 print:space-y-8">
        {chart.sections.map((section) => (
          <SongSectionView key={section.id} section={section} />
        ))}
      </div>

      <div className="mt-24 pt-8 border-t border-outline-variant/10 text-[10px] font-label font-bold tracking-[0.2em] text-on-surface-variant/40 text-center uppercase print:mt-8 print:pt-4">
        <p>Generated via DrumCharter Engine • {formatDate(chart.createdAt)}</p>
        {chart.tags && chart.tags.length > 0 && (
          <div className="flex justify-center gap-2 mt-4 print:hidden">
            {chart.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-container-highest px-2 py-1 rounded text-[9px] text-primary tracking-widest font-black"
              >
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

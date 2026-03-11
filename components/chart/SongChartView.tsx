'use client';

import React from 'react';
import { SongChart } from '@/lib/types/groove';
import { SongChartHeader } from './SongChartHeader';
import { SongSectionView } from './SongSectionView';

interface SongChartViewProps {
  chart: SongChart;
}

export const SongChartView: React.FC<SongChartViewProps> = ({ chart }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen print:p-0 print:max-w-none print:min-h-0">
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
      
      <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-400 text-center print:mt-8 print:pt-4">
        <p>Created on {new Date(chart.createdAt).toLocaleDateString()}</p>
        {chart.tags.length > 0 && (
          <div className="flex justify-center gap-2 mt-2 print:hidden">
            {chart.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-xs">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

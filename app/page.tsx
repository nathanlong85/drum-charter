'use client';

import React from 'react';
import { SongChart, GrooveGrid } from '@/lib/types/groove';
import { SongChartView } from '@/components/chart/SongChartView';

const SAMPLE_GRID: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [
    {
      instrumentId: 'hh',
      label: 'Hi-Hat',
      notes: Array(16).fill('hi_hat_closed'),
    },
    {
      instrumentId: 'sn',
      label: 'Snare',
      notes: [
        'none', 'none', 'none', 'none', 'standard', 'none', 'none', 'none', 
        'none', 'none', 'none', 'none', 'standard', 'none', 'none', 'none'
      ],
    },
    {
      instrumentId: 'bd',
      label: 'Bass',
      notes: [
        'standard', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 
        'standard', 'none', 'none', 'none', 'none', 'none', 'none', 'none'
      ],
    },
  ],
};

const SAMPLE_CHART: SongChart = {
  id: 'sample-1',
  header: {
    title: 'Sample Rock Groove',
    bpm: 120,
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  },
  sections: [
    {
      id: 'intro',
      name: 'Intro',
      measuresCount: 4,
      notes: ['Drum fill on 4th measure'],
    },
    {
      id: 'verse',
      name: 'Verse',
      measuresCount: 8,
      grid: SAMPLE_GRID,
      notes: ['Play loosely', 'Accent snare on 2 and 4'],
    },
    {
      id: 'chorus',
      name: 'Chorus',
      measuresCount: 8,
      grid: {
        ...SAMPLE_GRID,
        instruments: SAMPLE_GRID.instruments.map(inst => 
          inst.instrumentId === 'hh' ? { ...inst, notes: Array(16).fill('hi_hat_open') } : inst
        )
      },
      notes: ['Crash on beat 1'],
      subSections: [
        {
          id: 'chorus-end',
          name: 'Chorus End',
          measuresCount: 2,
          notes: ['Build up on snare'],
        }
      ]
    },
  ],
  tags: ['rock', 'demo', 'beginner'],
  isPublic: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 py-12">
      <SongChartView chart={SAMPLE_CHART} />
    </main>
  );
}

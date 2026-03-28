'use client';

import { useReducer } from 'react';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { grooveReducer } from '@/lib/state/groove-reducer';
import { createInstrument, type GrooveGrid } from '@/lib/types/groove';

const DEMO_META = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
} as const;

const INITIAL_DEMO_GRID: GrooveGrid = {
  ...DEMO_META,
  instruments: [
    createInstrument(DEMO_META, 'hh', 'hi-hat', 'Hi-Hat', 'Hi-Hat', 'hi_hat_closed'),
    {
      ...createInstrument(DEMO_META, 'sn', 'snare', 'Snare', 'Snare'),
      notes: [
        'none',
        'none',
        'none',
        'none',
        'standard',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'standard',
        'none',
        'none',
        'none',
      ],
      velocities: [0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0],
    },
    {
      ...createInstrument(DEMO_META, 'bd', 'kick', 'Kick', 'Bass'),
      notes: [
        'standard',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'standard',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
      ],
      velocities: [0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0],
    },
  ],
};

export function GrooveDemo() {
  const [grid, dispatch] = useReducer(grooveReducer, INITIAL_DEMO_GRID);

  return (
    <div className="bg-surface-container-low p-8 rounded-[40px] shadow-3xl border border-outline-variant/10 w-full max-w-4xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h3 className="text-xl font-headline font-black text-on-surface uppercase tracking-tighter">
            Sonic Architect Engine
          </h3>
          <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] mt-1">
            v1.0-alpha Live Preview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary/10 rounded-xl text-[9px] font-headline font-black text-primary uppercase tracking-widest border border-primary/20">
            Interactive Console
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest/50 rounded-[32px] p-6 border border-outline-variant/5 shadow-inner mb-6">
        <div className="overflow-x-auto">
          <GrooveGridEditor
            initialGrid={grid}
            onChange={(updatedGrid) => dispatch({ type: 'SET_FULL_GRID', grid: updatedGrid })}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="h-px w-8 bg-outline-variant/20" />
        <p className="text-[10px] text-on-surface-variant font-headline font-black uppercase tracking-[0.25em]">
          Interact with grid to explore articulation
        </p>
        <div className="h-px w-8 bg-outline-variant/20" />
      </div>
    </div>
  );
}

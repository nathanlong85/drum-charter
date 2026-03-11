'use client';

import React, { useReducer } from 'react';
import { GrooveGrid } from '@/lib/types/groove';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { grooveReducer } from '@/lib/state/groove-reducer';

const INITIAL_DEMO_GRID: GrooveGrid = {
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

export function GrooveDemo() {
  const [grid, dispatch] = useReducer(grooveReducer, INITIAL_DEMO_GRID);

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-zinc-200 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zinc-900">Try it yourself:</h3>
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
          Live Editor Demo
        </span>
      </div>
      <div className="overflow-x-auto">
        <GrooveGridEditor 
          initialGrid={grid} 
          onChange={(updatedGrid) => dispatch({ type: 'SET_GRID', payload: updatedGrid })} 
        />
      </div>
      <p className="mt-4 text-sm text-zinc-500 italic text-center">
        Click on the cells above to toggle hits or change drum symbols.
      </p>
    </div>
  );
}

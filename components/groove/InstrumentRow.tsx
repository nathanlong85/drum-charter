'use client';

import type React from 'react';
import type { DrumInstrument, GrooveGrid } from '@/lib/types/groove';
import { NoteCell } from './NoteCell';

interface InstrumentRowProps {
  instrument: DrumInstrument;
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>;
  onNoteClick: (index: number) => void;
  onNoteContextMenu: (index: number, e: React.MouseEvent) => void;
}

export const InstrumentRow: React.FC<InstrumentRowProps> = ({
  instrument,
  grid,
  onNoteClick,
  onNoteContextMenu,
}) => {
  const { timeSignature, resolution } = grid;
  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  return (
    <div
      className="flex border-b border-gray-300 dark:border-gray-700"
      data-testid={`instrument-row-${instrument.customName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="w-24 h-8 flex items-center px-2 bg-gray-50 dark:bg-gray-900 font-medium text-sm text-gray-700 dark:text-gray-300 border-r border-gray-400 dark:border-gray-600 select-none">
        <span className="truncate" title={instrument.customName}>
          {instrument.customName}
        </span>
      </div>
      <div className="flex">
        {instrument.notes.map((symbol, i) => {
          const isBeat = i % notesPerBeat === 0;
          const isMeasureBoundary = (i + 1) % totalNotesPerMeasure === 0;
          const velocity = instrument.velocities[i];

          return (
            <NoteCell
              key={i}
              symbol={symbol}
              velocity={velocity}
              onClick={() => onNoteClick(i)}
              onContextMenu={(e) => onNoteContextMenu(i, e)}
              isBeat={isBeat}
              isMeasureBoundary={isMeasureBoundary}
            />
          );
        })}
      </div>
    </div>
  );
};

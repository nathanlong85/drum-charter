'use client';

import type React from 'react';
import type { DrumSymbol, GrooveGrid } from '@/lib/types/groove';
import { NoteCell } from './NoteCell';

interface InstrumentRowProps {
  label: string;
  instrumentId: string;
  notes: DrumSymbol[];
  velocities?: number[];
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>;
  onNoteClick: (index: number) => void;
  onNoteContextMenu: (index: number, e: React.MouseEvent) => void;
}

export const InstrumentRow: React.FC<InstrumentRowProps> = ({
  label,
  notes,
  velocities,
  grid,
  onNoteClick,
  onNoteContextMenu,
}) => {
  const { timeSignature, resolution } = grid;
  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  return (
    <div className="flex border-b border-gray-300">
      <div className="w-24 h-8 flex items-center px-2 bg-gray-50 font-medium text-sm border-r border-gray-400 select-none">
        {label}
      </div>
      <div className="flex">
        {notes.map((symbol, i) => {
          const isBeat = i % notesPerBeat === 0;
          const isMeasureBoundary = (i + 1) % totalNotesPerMeasure === 0;
          const velocity = velocities ? velocities[i] : undefined;

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

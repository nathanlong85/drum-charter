'use client';

import { ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import type React from 'react';
import { type DrumInstrument, type GrooveGrid, getVelocityForSymbol } from '@/lib/types/groove';
import { NoteCell } from './NoteCell';

interface InstrumentRowProps {
  instrument: DrumInstrument;
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>;
  onNoteClick: (index: number) => void;
  onNoteContextMenu: (index: number, e: React.MouseEvent) => void;
  isEditing?: boolean;
  onSettingsClick?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const InstrumentRow: React.FC<InstrumentRowProps> = ({
  instrument,
  grid,
  onNoteClick,
  onNoteContextMenu,
  isEditing,
  onSettingsClick,
  onMoveUp,
  onMoveDown,
}) => {
  const { timeSignature, resolution } = grid;
  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  return (
    <div
      className="flex border-b border-gray-300 dark:border-gray-700 group/row"
      data-testid={`instrument-row-${instrument.customName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="w-32 h-8 flex items-center px-2 bg-gray-50 dark:bg-gray-900 font-medium text-sm text-gray-700 dark:text-gray-300 border-r border-gray-400 dark:border-gray-600 select-none relative group">
        {isEditing ? (
          <div className="flex items-center gap-1 w-full">
            <div className="flex flex-col">
              <button
                onClick={onMoveUp}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-blue-500"
                title="Move Up"
              >
                <ChevronUp size={12} strokeWidth={3} />
              </button>
              <button
                onClick={onMoveDown}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-blue-500"
                title="Move Down"
              >
                <ChevronDown size={12} strokeWidth={3} />
              </button>
            </div>
            <span className="truncate flex-1" title={instrument.customName}>
              {instrument.customName}
            </span>
            <button
              onClick={onSettingsClick}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-blue-600"
              title="Edit Settings"
            >
              <Settings2 size={14} />
            </button>
          </div>
        ) : (
          <span className="truncate w-full" title={instrument.customName}>
            {instrument.customName}
          </span>
        )}
      </div>
      <div className="flex">
        {instrument.notes.map((symbol, i) => {
          const isBeat = i % notesPerBeat === 0;
          const isMeasureBoundary = (i + 1) % totalNotesPerMeasure === 0;
          const velocity =
            instrument.velocities && instrument.velocities[i] !== undefined
              ? instrument.velocities[i]
              : getVelocityForSymbol(symbol);

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

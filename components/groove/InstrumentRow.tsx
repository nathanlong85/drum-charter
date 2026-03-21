'use client';

import { ChevronDown, ChevronUp, Settings2, Trash2 } from 'lucide-react';
import type React from 'react';
import { type DrumInstrument, type GrooveGrid, getVelocityForSymbol } from '@/lib/types/groove';
import { NoteCell } from './NoteCell';

interface InstrumentRowProps {
  instrument: DrumInstrument;
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>;
  onNoteClick: (index: number, e: React.MouseEvent) => void;
  onNoteContextMenu: (index: number, e: React.MouseEvent) => void;
  onNoteMouseDown?: (index: number, e: React.MouseEvent) => void;
  onNoteMouseEnter?: (index: number) => void;
  selectionRange?: {
    start: { instIdx: number; noteIdx: number };
    end: { instIdx: number; noteIdx: number };
  } | null;
  instIdx: number;
  isEditing?: boolean;
  onSettingsClick?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onClear?: () => void;
}

export const InstrumentRow: React.FC<InstrumentRowProps> = ({
  instrument,
  grid,
  onNoteClick,
  onNoteContextMenu,
  onNoteMouseDown,
  onNoteMouseEnter,
  selectionRange,
  instIdx,
  isEditing,
  onSettingsClick,
  onMoveUp,
  onMoveDown,
  onClear,
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
              {onMoveUp && (
                <button
                  type="button"
                  onClick={onMoveUp}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-blue-500"
                  title="Move Up"
                  aria-label="Move instrument up"
                >
                  <ChevronUp size={12} strokeWidth={3} />
                </button>
              )}
              {onMoveDown && (
                <button
                  type="button"
                  onClick={onMoveDown}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-blue-500"
                  title="Move Down"
                  aria-label="Move instrument down"
                >
                  <ChevronDown size={12} strokeWidth={3} />
                </button>
              )}
            </div>
            <span className="truncate flex-1" title={instrument.customName}>
              {instrument.customName}
            </span>
            {onSettingsClick && (
              <button
                type="button"
                onClick={onSettingsClick}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-blue-600"
                title="Edit Settings"
                aria-label="Edit instrument settings"
              >
                <Settings2 size={14} />
              </button>
            )}
            {onClear && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Clear all notes for ${instrument.customName}?`)) {
                    onClear();
                  }
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-gray-400 hover:text-red-600"
                title="Clear Row"
                aria-label={`Clear all notes for ${instrument.customName}`}
                data-testid={`clear-row-${instrument.id}`}
              >
                <Trash2 size={14} />
              </button>
            )}
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

          let isSelected = false;
          if (selectionRange) {
            const minInst = Math.min(selectionRange.start.instIdx, selectionRange.end.instIdx);
            const maxInst = Math.max(selectionRange.start.instIdx, selectionRange.end.instIdx);
            const minNote = Math.min(selectionRange.start.noteIdx, selectionRange.end.noteIdx);
            const maxNote = Math.max(selectionRange.start.noteIdx, selectionRange.end.noteIdx);
            isSelected = instIdx >= minInst && instIdx <= maxInst && i >= minNote && i <= maxNote;
          }

          return (
            <NoteCell
              key={i}
              symbol={symbol}
              velocity={velocity}
              onClick={(e) => onNoteClick(i, e)}
              onContextMenu={(e) => onNoteContextMenu(i, e)}
              onMouseDown={(e) => onNoteMouseDown?.(i, e)}
              onMouseEnter={() => onNoteMouseEnter?.(i)}
              isBeat={isBeat}
              isMeasureBoundary={isMeasureBoundary}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
};

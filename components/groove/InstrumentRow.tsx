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
  readOnly?: boolean;
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
  readOnly = false,
}) => {
  const { timeSignature, resolution } = grid;
  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  return (
    <div
      className="flex border-b border-outline-variant/10 group/row"
      data-testid={`instrument-row-${instrument.customName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="w-32 h-8 flex items-center px-2 bg-surface-container-low font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant border-r border-outline-variant/20 select-none relative group">
        {isEditing && !readOnly ? (
          <div className="flex items-center gap-1 w-full">
            <div className="flex flex-col">
              {onMoveUp && (
                <button
                  type="button"
                  onClick={onMoveUp}
                  className="p-0.5 hover:bg-surface-container-highest rounded transition-colors text-on-surface-variant/40 hover:text-primary"
                  title="Move Up"
                  aria-label="Move instrument up"
                >
                  <ChevronUp size={10} strokeWidth={4} />
                </button>
              )}
              {onMoveDown && (
                <button
                  type="button"
                  onClick={onMoveDown}
                  className="p-0.5 hover:bg-surface-container-highest rounded transition-colors text-on-surface-variant/40 hover:text-primary"
                  title="Move Down"
                  aria-label="Move instrument down"
                >
                  <ChevronDown size={10} strokeWidth={4} />
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
                className="p-1 hover:bg-surface-container-highest rounded transition-colors text-on-surface-variant/40 hover:text-primary"
                title="Edit Settings"
                aria-label="Edit instrument settings"
              >
                <Settings2 size={12} />
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
                className="p-1 hover:bg-error/10 rounded transition-colors text-on-surface-variant/40 hover:text-error"
                title="Clear Row"
                aria-label={`Clear all notes for ${instrument.customName}`}
                data-testid={`clear-row-${instrument.id}`}
              >
                <Trash2 size={12} />
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
            <div key={i} className="relative">
              {isBeat && instIdx === 0 && (
                <div
                  data-testid={`beat-label-${i / notesPerBeat + 1}`}
                  className={`
                    absolute -top-8 left-0 w-8 h-8 flex items-center justify-center text-[10px] font-headline font-black border-r border-outline-variant/20 select-none bg-surface-container-highest pointer-events-none
                    ${isMeasureBoundary ? 'border-r-2 border-r-outline' : ''}
                    ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}
                  `}
                >
                  {i / notesPerBeat + 1}
                </div>
              )}
              <NoteCell
                symbol={symbol}
                velocity={velocity}
                onClick={(e) => onNoteClick(i, e)}
                onContextMenu={(e) => onNoteContextMenu(i, e)}
                onMouseDown={(e) => onNoteMouseDown?.(i, e)}
                onMouseEnter={() => onNoteMouseEnter?.(i)}
                isBeat={isBeat}
                isMeasureBoundary={isMeasureBoundary}
                isSelected={isSelected}
                readOnly={readOnly}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

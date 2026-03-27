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
  isEditing = false,
  onSettingsClick,
  onMoveUp,
  onMoveDown,
  onClear,
  readOnly = false,
}) => {
  const { timeSignature, resolution } = grid;
  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  const isSelected = (noteIdx: number) => {
    if (!selectionRange) return false;
    const minInst = Math.min(selectionRange.start.instIdx, selectionRange.end.instIdx);
    const maxInst = Math.max(selectionRange.start.instIdx, selectionRange.end.instIdx);
    const minNote = Math.min(selectionRange.start.noteIdx, selectionRange.end.noteIdx);
    const maxNote = Math.max(selectionRange.start.noteIdx, selectionRange.end.noteIdx);

    return instIdx >= minInst && instIdx <= maxInst && noteIdx >= minNote && noteIdx <= maxNote;
  };

  return (
    <div
      className="flex group/row border-b border-outline-variant/10 hover:bg-surface-container-high/30 transition-colors"
      data-testid={`instrument-row-${instrument.customName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Instrument Info Panel */}
      <div className="w-32 h-10 flex items-center bg-surface-container-low border-r border-outline-variant/10 relative px-2 flex-shrink-0">
        {!readOnly && isEditing && (
          <div className="flex flex-col mr-1">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="p-0.5 hover:bg-primary/10 text-on-surface-variant/40 hover:text-primary transition-colors"
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
                className="p-0.5 hover:bg-primary/10 text-on-surface-variant/40 hover:text-primary transition-colors"
                title="Move Down"
                aria-label="Move instrument down"
              >
                <ChevronDown size={10} strokeWidth={4} />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-headline font-black text-on-surface truncate uppercase tracking-tight leading-none">
            {instrument.customName}
          </p>
          <p className="text-[8px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest mt-0.5 truncate">
            {instrument.category}
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity ml-1">
            {onSettingsClick && (
              <button
                type="button"
                onClick={onSettingsClick}
                className="p-1 hover:bg-primary/10 text-on-surface-variant hover:text-primary rounded transition-colors"
                title="Edit Settings"
                aria-label="Edit instrument settings"
              >
                <Settings2 size={12} />
              </button>
            )}
            {isEditing && onClear && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Clear all notes for ${instrument.customName}?`)) {
                    onClear();
                  }
                }}
                className="p-1 hover:bg-error/10 text-on-surface-variant hover:text-error rounded transition-colors"
                title="Clear Row"
                aria-label={`Clear all notes for ${instrument.customName}`}
                data-testid={`clear-row-${instrument.id}`}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      <div className="flex">
        {instrument.notes.map((symbol, noteIdx) => {
          const velocity =
            instrument.velocities && instrument.velocities[noteIdx] !== undefined
              ? instrument.velocities[noteIdx]
              : getVelocityForSymbol(symbol);

          return (
            <NoteCell
              key={noteIdx}
              symbol={symbol}
              velocity={velocity}
              isBeat={noteIdx % notesPerBeat === 0}
              isMeasureBoundary={(noteIdx + 1) % totalNotesPerMeasure === 0}
              isSelected={isSelected(noteIdx)}
              onClick={(e) => onNoteClick(noteIdx, e)}
              onContextMenu={(e) => onNoteContextMenu(noteIdx, e)}
              onMouseDown={(e) => onNoteMouseDown?.(noteIdx, e)}
              onMouseEnter={() => onNoteMouseEnter?.(noteIdx)}
              readOnly={readOnly}
            />
          );
        })}
      </div>
    </div>
  );
};

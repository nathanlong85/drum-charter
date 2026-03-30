'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronUp, Settings2, Trash2, Volume2, VolumeX, Wand2 } from 'lucide-react';
import type React from 'react';
import { type DrumInstrument, type GrooveGrid, getVelocityForSymbol } from '@/lib/types/groove';
import { getFilteredPresets, type RowPreset } from '@/lib/utils/rowPresets';
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
  onPresetSelect?: (preset: RowPreset) => void;
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
  onPresetSelect,
  readOnly = false,
}) => {
  const { timeSignature, resolution } = grid;
  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  const presets = getFilteredPresets(instrument.category, timeSignature);

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
      className={`flex group/row border-b border-outline-variant/10 hover:bg-surface-container-high/30 transition-colors ${
        instrument.muted ? 'opacity-40' : ''
      }`}
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

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex-1 min-w-0 text-left hover:bg-primary/5 rounded px-1 -ml-1 transition-colors group/name"
              title="Click for Quick Presets"
              disabled={readOnly}
            >
              <div className="flex items-baseline gap-1">
                <p className="text-[10px] font-headline font-black text-on-surface truncate uppercase tracking-tight leading-none">
                  {instrument.customName}
                </p>
                {instrument.muted && <VolumeX size={8} className="text-error flex-shrink-0" />}
                {!readOnly && (
                  <Wand2
                    size={8}
                    className="text-primary opacity-0 group-hover/name:opacity-100 transition-opacity flex-shrink-0"
                  />
                )}
              </div>
              <p className="text-[8px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest mt-0.5 truncate">
                {instrument.category}
              </p>
            </button>
          </DropdownMenu.Trigger>

          {!readOnly && (
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[140px] bg-surface-container-high rounded-lg p-1 shadow-xl border border-outline-variant/20 z-50 animate-in fade-in zoom-in-95 duration-100"
                sideOffset={5}
                align="start"
              >
                <DropdownMenu.Label className="px-2 py-1.5 text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  Quick Presets
                </DropdownMenu.Label>
                {presets.map((preset) => (
                  <DropdownMenu.Item
                    key={preset.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-on-surface hover:bg-primary hover:text-on-primary rounded cursor-pointer outline-none transition-colors"
                    onSelect={() => onPresetSelect?.(preset.id)}
                  >
                    {preset.id === 'mute' ? (
                      instrument.muted ? (
                        <>
                          <Volume2 size={12} /> Unmute
                        </>
                      ) : (
                        <>
                          <VolumeX size={12} /> Mute
                        </>
                      )
                    ) : (
                      preset.label
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          )}
        </DropdownMenu.Root>

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
              index={noteIdx}
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

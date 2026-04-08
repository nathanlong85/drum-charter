'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronUp, Settings2, Trash2, Volume2, VolumeX, Wand2 } from 'lucide-react';
import type React from 'react';
import type { DrumInstrument } from '@/lib/types/groove';
import { getFilteredPresets } from '@/lib/utils/rowPresets';
import { useGrooveGrid } from './GrooveGridContext';
import { NoteCell } from './NoteCell';

interface InstrumentRowProps {
  instrument: DrumInstrument;
  instIdx: number;
}

export const InstrumentRow: React.FC<InstrumentRowProps> = ({ instrument, instIdx }) => {
  const {
    state,
    dispatch,
    activeStep,
    isEditingInstruments: isEditing,
    setEditingInstrumentId,
    selectionRange,
    setSelectionRange,
    readOnly,
    handleNoteClick,
    handleNoteRightClick,
  } = useGrooveGrid();

  const { timeSignature, resolution } = state;
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

  const handleDragStart = (noteIdx: number) => {
    if (readOnly) return;
    setSelectionRange({ start: { instIdx, noteIdx }, end: { instIdx, noteIdx } });
  };

  const handleDragEnter = (noteIdx: number) => {
    if (!selectionRange) return;
    setSelectionRange({ ...selectionRange, end: { instIdx, noteIdx } });
  };

  const instrumentRowTestId = `instrument-row-${(
    instrument.customName ||
    instrument.category ||
    'instrument'
  )
    .toLowerCase()
    .replace(/\s+/g, '-')}`;

  return (
    <div
      className={`flex group/row border-b border-outline-variant/10 hover:bg-surface-container-high/30 transition-colors ${
        instrument.muted ? 'opacity-40' : ''
      }`}
      data-testid={instrumentRowTestId}
    >
      {/* Instrument Info Panel */}
      <div className="w-32 h-10 flex items-center bg-surface-container-low border-r border-outline-variant/10 relative px-2 flex-shrink-0">
        {!readOnly && isEditing && (
          <div className="flex flex-col mr-1">
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'MOVE_INSTRUMENT',
                  id: instrument.id,
                  direction: 'up',
                })
              }
              className="p-0.5 hover:bg-primary/10 text-on-surface-variant/40 hover:text-primary transition-colors"
              title="Move Up"
              aria-label="Move instrument up"
            >
              <ChevronUp size={10} strokeWidth={4} />
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'MOVE_INSTRUMENT',
                  id: instrument.id,
                  direction: 'down',
                })
              }
              className="p-0.5 hover:bg-primary/10 text-on-surface-variant/40 hover:text-primary transition-colors"
              title="Move Down"
              aria-label="Move instrument down"
            >
              <ChevronDown size={10} strokeWidth={4} />
            </button>
          </div>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex-1 flex items-center justify-between group/name hover:bg-primary/5 px-2 py-1 rounded transition-colors overflow-hidden"
              data-testid={`instrument-settings-trigger-${instrument.id}`}
              title="Edit Settings"
            >
              <span className="text-[10px] font-headline font-black uppercase tracking-wider truncate mr-1">
                {instrument.customName || instrument.category}
              </span>
              <Wand2
                size={10}
                className="opacity-0 group-hover/name:opacity-40 transition-opacity text-primary"
              />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[160px] bg-surface-container-low border border-outline-variant/20 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95"
              sideOffset={5}
            >
              {!readOnly && (
                <>
                  <DropdownMenu.Label className="px-2 py-1.5 text-[9px] font-headline font-black text-on-surface-variant/40 uppercase tracking-widest">
                    Presets
                  </DropdownMenu.Label>
                  {presets.map((preset) => (
                    <DropdownMenu.Item
                      key={preset.id}
                      className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-headline font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg cursor-pointer outline-none transition-colors"
                      onSelect={() =>
                        dispatch({
                          type: 'APPLY_ROW_PRESET',
                          id: instrument.id,
                          preset: preset.id,
                        })
                      }
                    >
                      <Wand2 size={12} />
                      {preset.label}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="h-px bg-outline-variant/10 my-1" />
                </>
              )}

              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-headline font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg cursor-pointer outline-none transition-colors"
                onSelect={() => setEditingInstrumentId(instrument.id)}
              >
                <Settings2 size={12} />
                Settings
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-headline font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg cursor-pointer outline-none transition-colors"
                onSelect={() =>
                  dispatch({
                    type: 'UPDATE_INSTRUMENT',
                    id: instrument.id,
                    updates: { muted: !instrument.muted },
                  })
                }
              >
                {instrument.muted ? <Volume2 size={12} /> : <VolumeX size={12} />}
                {instrument.muted ? 'Unmute' : 'Mute'}
              </DropdownMenu.Item>

              {!readOnly && (
                <>
                  <DropdownMenu.Separator className="h-px bg-outline-variant/10 my-1" />
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-headline font-bold text-error hover:bg-error/10 rounded-lg cursor-pointer outline-none transition-colors"
                    onSelect={() => {
                      if (confirm('Clear this instrument row?')) {
                        dispatch({
                          type: 'CLEAR_ROW',
                          id: instrument.id,
                        });
                      }
                    }}
                  >
                    <Trash2 size={12} />
                    Clear Row
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-headline font-bold text-error hover:bg-error/10 rounded-lg cursor-pointer outline-none transition-colors"
                    onSelect={() => dispatch({ type: 'REMOVE_INSTRUMENT', id: instrument.id })}
                  >
                    <Trash2 size={12} />
                    Delete Instrument
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Notes Grid */}
      <div className="flex bg-surface-container-high/10">
        {instrument.notes.map((note, idx) => {
          const isBeatStart = idx % notesPerBeat === 0;
          const _beatIndex = Math.floor(idx / notesPerBeat);
          const isMeasureStart = idx % (totalNotesPerMeasure || 1) === 0;

          return (
            <NoteCell
              key={`${instrument.id}-${idx}`}
              symbol={note || 'none'}
              velocity={instrument.velocities?.[idx] || 0}
              index={idx}
              isBeat={isBeatStart}
              isMeasureBoundary={isMeasureStart}
              isActive={activeStep === idx}
              onClick={(e) => handleNoteClick(instrument.id, idx, e)}
              onContextMenu={(e) => handleNoteRightClick(instrument.id, idx, e)}
              onMouseDown={(e) => {
                if (e.button === 0) {
                  // Left click
                  handleDragStart(idx);
                }
              }}
              onMouseEnter={() => handleDragEnter(idx)}
              isSelected={isSelected(idx)}
              readOnly={readOnly}
              data-testid={`note-${idx}`}
            />
          );
        })}
      </div>
    </div>
  );
};

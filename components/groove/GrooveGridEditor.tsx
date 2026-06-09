'use client';

import { Plus } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import type { GrooveGrid } from '@/lib/types/groove';
import { generateId } from '@/lib/utils/id';
import { AddInstrumentModal } from './AddInstrumentModal';
import { GrooveGridProvider, useGrooveGrid } from './GrooveGridContext';
import { GrooveGridToolbar } from './GrooveGridToolbar';
import { InstrumentRow } from './InstrumentRow';
import { InstrumentSettingsModal } from './InstrumentSettingsModal';
import { SymbolPicker } from './SymbolPicker';

export interface GrooveGridEditorProps {
  initialGrid: GrooveGrid;
  onChange?: (grid: GrooveGrid) => void;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  metronomeEnabled?: boolean;
  onMetronomeToggle?: (enabled: boolean) => void;
  metronomeVolume?: number;
  onMetronomeVolumeChange?: (volume: number) => void;
  readOnly?: boolean;
  cellSize?: number;
  measuresPerRow?: number;
  hideToolbar?: boolean;
}

/**
 * Root component that provides the GrooveGridContext.
 */
export const GrooveGridEditor: React.FC<GrooveGridEditorProps> = (props) => {
  const [localBpm, setLocalBpm] = React.useState(120);
  const bpm = props.bpm !== undefined ? props.bpm : localBpm;
  const onBpmChange = props.onBpmChange || setLocalBpm;

  return (
    <GrooveGridProvider {...props} bpm={bpm} onBpmChange={onBpmChange}>
      <EditorLayout {...props} />
    </GrooveGridProvider>
  );
};

function EditorLayout(props: GrooveGridEditorProps) {
  const { state } = useGrooveGrid();
  const { cellSize = 40, measuresPerRow: propMeasuresPerRow = 2, hideToolbar } = props;
  const measuresPerRow = Math.max(1, propMeasuresPerRow);
  const safeBeatValue = Math.max(1, state.timeSignature.beatValue);
  const notesPerBeat = state.resolution / safeBeatValue;

  return (
    <div
      className="flex flex-col gap-6 grid-editor-container"
      data-testid="groove-grid"
      style={
        {
          '--note-cell-size': `${cellSize}px`,
          '--measures-per-row': measuresPerRow,
          '--beats-per-measure': state.timeSignature.beatsPerMeasure,
          '--notes-per-beat': notesPerBeat,
        } as React.CSSProperties
      }
    >
      {!hideToolbar && <GridHeader />}
      <GridBody measuresPerRow={measuresPerRow} />
      <GridOverlays />
    </div>
  );
}

function GridHeader() {
  return <GrooveGridToolbar />;
}

function GridBody({ measuresPerRow }: { measuresPerRow: number }) {
  const {
    state,
    dispatch,
    selectionRange,
    setSelectionRange,
    isDragging,
    setIsDragging,
    readOnly,
    isEditingInstruments,
  } = useGrooveGrid();
  const [showAddModal, setShowAddModal] = useState(false);
  const { measures, timeSignature, resolution } = state;
  const safeBeatValue = Math.max(1, timeSignature.beatValue);
  const notesPerBeat = resolution / safeBeatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !selectionRange) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    const { start, end } = selectionRange;

    // If it's a single cell, let the click handler deal with it to avoid double-toggles
    if (start.instIdx === end.instIdx && start.noteIdx === end.noteIdx) {
      setSelectionRange(null);
      return;
    }

    const isClearing = state.instruments[start.instIdx].notes[start.noteIdx] !== 'none';

    if (isClearing) {
      dispatch({
        type: 'SET_SELECTION_SYMBOLS',
        selection: { start, end },
        symbol: 'none',
      });
    } else {
      dispatch({
        type: 'SET_SELECTION_SYMBOLS',
        selection: { start, end },
        symbol: 'standard',
      });
    }

    setSelectionRange(null);
  }, [isDragging, selectionRange, state.instruments, dispatch, setSelectionRange, setIsDragging]);

  React.useEffect(() => {
    document.addEventListener('mouseup', handleDragEnd);
    return () => document.removeEventListener('mouseup', handleDragEnd);
  }, [handleDragEnd]);

  const effectiveMeasuresPerRow = Math.max(1, measuresPerRow);
  const rowCount = Math.ceil(measures / effectiveMeasuresPerRow);

  return (
    <div className="relative overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex flex-col gap-10 min-w-max">
        {Array.from({ length: rowCount }).map((_, rowIndex) => {
          const startMeasure = rowIndex * effectiveMeasuresPerRow;
          const endMeasure = Math.min(startMeasure + effectiveMeasuresPerRow, measures);
          const startNoteIdx = startMeasure * totalNotesPerMeasure;
          const endNoteIdx = endMeasure * totalNotesPerMeasure;

          return (
            <div key={`grid-block-${rowIndex}`} className="flex flex-col">
              <div className="flex flex-col border border-outline-variant/10 rounded-2xl overflow-hidden bg-surface-container-low shadow-sm">
                <GridColumnLabels startMeasure={startMeasure} endMeasure={endMeasure} />
                {state.instruments.map((instrument, instIdx) => (
                  <InstrumentRow
                    key={`${instrument.id}-${rowIndex}`}
                    instrument={instrument}
                    instIdx={instIdx}
                    startNoteIdx={startNoteIdx}
                    endNoteIdx={endNoteIdx}
                    rowIndex={rowIndex}
                  />
                ))}

                {!readOnly && isEditingInstruments && rowIndex === rowCount - 1 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    data-testid="add-instrument-button"
                    className="flex items-center gap-3 px-6 py-4 hover:bg-primary/5 text-on-surface-variant/40 hover:text-primary transition-all group border-t border-outline-variant/10"
                  >
                    <div className="w-8 h-8 rounded-lg border-2 border-dashed border-outline-variant/20 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                      <Plus size={16} />
                    </div>
                    <span className="text-[10px] font-headline font-black uppercase tracking-[0.2em]">
                      Add Instrument
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showAddModal && (
        <AddInstrumentModal
          onClose={() => setShowAddModal(false)}
          onAdd={({ category, presetVariety, customName }) =>
            dispatch({
              type: 'ADD_INSTRUMENT',
              id: generateId(),
              category,
              presetVariety,
              customName,
            })
          }
        />
      )}
    </div>
  );
}

function GridColumnLabels({
  startMeasure,
  endMeasure,
}: {
  startMeasure: number;
  endMeasure: number;
}) {
  const { state } = useGrooveGrid();
  const { timeSignature, resolution } = state;

  const safeBeatValue = Math.max(1, timeSignature.beatValue);
  const notesPerBeat = resolution / safeBeatValue;
  const measuresInBlock = endMeasure - startMeasure;
  const totalNotesInBlock = measuresInBlock * timeSignature.beatsPerMeasure * notesPerBeat;

  return (
    <div className="flex border-b border-outline-variant/10 bg-surface-container-low/50 sticky top-0 z-20">
      <div className="w-32 flex-shrink-0" />
      <div className="flex">
        {Array.from({ length: totalNotesInBlock }).map((_, idxInBlock) => {
          const globalIdx =
            startMeasure * timeSignature.beatsPerMeasure * notesPerBeat + idxInBlock;
          const isBeatStart = globalIdx % notesPerBeat === 0;
          const beatIndex = Math.floor(globalIdx / notesPerBeat);
          const beatInMeasure = beatIndex % timeSignature.beatsPerMeasure;
          const subIdx = globalIdx % notesPerBeat;

          let label = '';
          if (isBeatStart) {
            label = (beatInMeasure + 1).toString();
          } else if (resolution === 8 && subIdx === 1) {
            label = '+';
          } else if (resolution === 16) {
            if (subIdx === 1) label = 'e';
            if (subIdx === 2) label = '&';
            if (subIdx === 3) label = 'a';
          }

          return (
            <div
              key={`label-${globalIdx}`}
              data-testid={isBeatStart ? `beat-label-${label}` : undefined}
              className={`flex h-6 items-center justify-center text-[10px] font-headline font-black border-r border-outline-variant/5 ${
                isBeatStart ? 'text-primary' : 'text-on-surface-variant/30'
              }`}
              style={{
                width: 'var(--note-cell-size, 40px)',
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GridOverlays() {
  const {
    state,
    dispatch,
    pickerPos,
    setPickerPos,
    editingInstrumentId,
    setEditingInstrumentId,
    handleSymbolSelect,
    handleVelocitySelect,
  } = useGrooveGrid();

  const editingInstrument = state.instruments.find((i) => i.id === editingInstrumentId);

  return (
    <>
      {pickerPos && (
        <SymbolPicker
          position={pickerPos}
          onSelect={handleSymbolSelect}
          onClose={() => setPickerPos(null)}
          onVelocityChange={handleVelocitySelect}
          currentVelocity={
            state.instruments.find((i) => i.id === pickerPos.id)?.velocities?.[
              pickerPos.noteIndex
            ] || 0
          }
          category={state.instruments.find((i) => i.id === pickerPos.id)?.category}
        />
      )}

      {editingInstrument && (
        <InstrumentSettingsModal
          instrument={editingInstrument}
          onClose={() => setEditingInstrumentId(null)}
          onSave={(updates) =>
            dispatch({
              type: 'UPDATE_INSTRUMENT',
              id: editingInstrument.id,
              updates,
            })
          }
          onDelete={() =>
            dispatch({
              type: 'REMOVE_INSTRUMENT',
              id: editingInstrument.id,
            })
          }
        />
      )}
    </>
  );
}

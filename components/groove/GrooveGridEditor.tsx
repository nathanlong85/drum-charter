'use client';

import { Plus } from 'lucide-react';
import React, { useCallback, useRef } from 'react';
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
      <div className="flex flex-col gap-6" data-testid="groove-grid">
        <GridHeader />
        <GridBody />
        <GridOverlays />
      </div>
    </GrooveGridProvider>
  );
};

function GridHeader() {
  return <GrooveGridToolbar />;
}

function GridBody() {
  const { state, dispatch, selectionRange, setSelectionRange, readOnly } = useGrooveGrid();

  const isDraggingRef = useRef(false);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current || !selectionRange) {
      isDraggingRef.current = false;
      return;
    }
    isDraggingRef.current = false;

    const { start, end } = selectionRange;
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
  }, [selectionRange, state.instruments, dispatch, setSelectionRange]);

  React.useEffect(() => {
    window.addEventListener('mouseup', handleDragEnd);
    return () => window.removeEventListener('mouseup', handleDragEnd);
  }, [handleDragEnd]);

  return (
    <div className="relative overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex flex-col min-w-max border border-outline-variant/10 rounded-2xl overflow-hidden bg-surface-container-low shadow-sm">
        <GridColumnLabels />
        {state.instruments.map((instrument, instIdx) => (
          <InstrumentRow key={instrument.id} instrument={instrument} instIdx={instIdx} />
        ))}

        {!readOnly && (
          <button
            onClick={() =>
              dispatch({
                type: 'ADD_INSTRUMENT',
                id: `inst-${Date.now()}`,
                category: 'misc',
                presetVariety: 'Misc',
                customName: 'misc',
              })
            }
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
}

function GridColumnLabels() {
  const { state } = useGrooveGrid();
  const { timeSignature, resolution, measures } = state;

  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotes = measures * timeSignature.beatsPerMeasure * notesPerBeat;

  return (
    <div className="flex border-b border-outline-variant/10 bg-surface-container-low/50 sticky top-0 z-20">
      <div className="w-32 flex-shrink-0" />
      <div className="flex">
        {Array.from({ length: totalNotes }).map((_, idx) => {
          const isBeatStart = idx % notesPerBeat === 0;
          const beatIndex = Math.floor(idx / notesPerBeat);
          const beatInMeasure = beatIndex % timeSignature.beatsPerMeasure;
          const subIdx = idx % notesPerBeat;

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
              key={`label-${idx}`}
              className={`w-10 h-6 flex items-center justify-center text-[10px] font-headline font-black border-r border-outline-variant/5 ${
                isBeatStart ? 'text-primary' : 'text-on-surface-variant/30'
              }`}
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
          top={pickerPos.top}
          left={pickerPos.left}
          onSelect={handleSymbolSelect}
          onClose={() => setPickerPos(null)}
          onVelocityChange={handleVelocitySelect}
          currentNote={
            state.instruments.find((i) => i.id === pickerPos.id)?.notes[pickerPos.noteIndex]
          }
        />
      )}

      {editingInstrument && (
        <InstrumentSettingsModal
          instrument={editingInstrument}
          onClose={() => setEditingInstrumentId(null)}
          onUpdate={(updates) =>
            dispatch({
              type: 'UPDATE_INSTRUMENT',
              id: editingInstrument.id,
              updates,
            })
          }
        />
      )}
    </>
  );
}

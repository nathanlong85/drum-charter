'use client';

import React, { useReducer, useState } from 'react';
import { GrooveGrid, DrumSymbol } from '@/lib/types/groove';
import { grooveReducer } from '@/lib/state/groove-reducer';
import { InstrumentRow } from './InstrumentRow';
import { SymbolPicker } from './SymbolPicker';

interface GrooveGridEditorProps {
  initialGrid: GrooveGrid;
  onChange?: (grid: GrooveGrid) => void;
}

export const GrooveGridEditor: React.FC<GrooveGridEditorProps> = ({
  initialGrid,
  onChange,
}) => {
  const [state, dispatch] = useReducer(grooveReducer, initialGrid);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number; instrumentId: string; noteIndex: number } | null>(null);

  const handleNoteClick = (instrumentId: string, noteIndex: number) => {
    const action = { type: 'TOGGLE_NOTE', instrumentId, noteIndex } as const;
    dispatch(action);
    onChange?.(grooveReducer(state, action));
  };

  const handleNoteContextMenu = (instrumentId: string, noteIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setPickerPos({
      top: e.clientY,
      left: e.clientX,
      instrumentId,
      noteIndex,
    });
  };

  const handleSymbolSelect = (symbol: DrumSymbol) => {
    if (!pickerPos) return;
    const action = { type: 'SET_SYMBOL', instrumentId: pickerPos.instrumentId, noteIndex: pickerPos.noteIndex, symbol } as const;
    dispatch(action);
    onChange?.(grooveReducer(state, action));
    setPickerPos(null);
  };

  // Generate headers (1 e + a)
  const renderHeader = () => {
    const { timeSignature, resolution, measures } = state;
    const notesPerBeat = resolution / timeSignature.beatValue;
    const totalNotes = (timeSignature.beatsPerMeasure * notesPerBeat) * measures;
    
    const headers = [];
    for (let i = 0; i < totalNotes; i++) {
      let label = '';
      const beatIndex = Math.floor(i / notesPerBeat) % timeSignature.beatsPerMeasure;
      const subIndex = i % notesPerBeat;
      
      if (subIndex === 0) {
        label = (beatIndex + 1).toString();
      } else if (resolution === 16) {
        if (subIndex === 1) label = 'e';
        else if (subIndex === 2) label = '+';
        else if (subIndex === 3) label = 'a';
      } else if (resolution === 8 && subIndex === 1) {
        label = '+';
      }

      const isMeasureBoundary = (i + 1) % (timeSignature.beatsPerMeasure * notesPerBeat) === 0;

      headers.push(
        <div 
          key={i} 
          className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-r border-gray-300 bg-gray-100 select-none
            ${subIndex === 0 ? 'text-blue-600' : 'text-gray-500'}
            ${isMeasureBoundary ? 'border-r-2 border-r-gray-800' : ''}
          `}
        >
          {label}
        </div>
      );
    }

    return (
      <div className="flex border-b-2 border-gray-400">
        <div className="w-24 h-8 bg-gray-200 border-r border-gray-400" />
        <div className="flex">{headers}</div>
      </div>
    );
  };

  return (
    <div className="inline-block border border-gray-400 shadow-sm rounded-sm bg-white overflow-x-auto max-w-full">
      {renderHeader()}
      <div className="flex flex-col">
        {state.instruments.map((inst) => (
          <InstrumentRow
            key={inst.instrumentId}
            instrumentId={inst.instrumentId}
            label={inst.label}
            notes={inst.notes}
            grid={state}
            onNoteClick={(idx) => handleNoteClick(inst.instrumentId, idx)}
            onNoteContextMenu={(idx, e) => handleNoteContextMenu(inst.instrumentId, idx, e)}
          />
        ))}
      </div>

      {pickerPos && (
        <SymbolPicker
          position={{ top: pickerPos.top, left: pickerPos.left }}
          onSelect={handleSymbolSelect}
          onClose={() => setPickerPos(null)}
        />
      )}
    </div>
  );
};

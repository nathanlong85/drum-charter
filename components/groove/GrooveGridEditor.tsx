'use client';

import React, { useReducer, useState } from 'react';
import { GrooveGrid, DrumSymbol, BeatResolution } from '@/lib/types/groove';
import { grooveReducer, GrooveAction } from '@/lib/state/groove-reducer';
import { InstrumentRow } from './InstrumentRow';
import { SymbolPicker } from './SymbolPicker';
import { Settings, Plus, Minus } from 'lucide-react';

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
  const [showSettings, setShowSettings] = useState(false);

  const wrappedDispatch = (action: GrooveAction) => {
    dispatch(action);
    // Note: This is a bit tricky because useReducer's state isn't updated yet.
    // We should ideally use the reducer function directly to get the next state for the callback.
    onChange?.(grooveReducer(state, action));
  };

  const handleNoteClick = (instrumentId: string, noteIndex: number) => {
    wrappedDispatch({ type: 'TOGGLE_NOTE', instrumentId, noteIndex });
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
    wrappedDispatch({ type: 'SET_SYMBOL', instrumentId: pickerPos.instrumentId, noteIndex: pickerPos.noteIndex, symbol });
    setPickerPos(null);
  };

  const updateMeasures = (delta: number) => {
    const newMeasures = Math.max(1, state.measures + delta);
    if (newMeasures !== state.measures) {
      wrappedDispatch({ type: 'SET_MEASURES', measures: newMeasures });
    }
  };

  const updateResolution = (res: BeatResolution) => {
    wrappedDispatch({ type: 'SET_RESOLUTION', resolution: res });
  };

  const updateTimeSignature = (beats: number, value: number) => {
    wrappedDispatch({ 
      type: 'SET_TIME_SIGNATURE', 
      beatsPerMeasure: Math.max(1, beats), 
      beatValue: value 
    });
  };

  // Generate headers (1 e + a)
  const renderHeader = () => {
    if (!state) return null;
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
    <div className="flex flex-col gap-2 print:gap-1 no-print-break">
      <div className="flex items-center gap-4 bg-gray-50 p-2 rounded border border-gray-200 text-sm no-print">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Measures:</span>
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
            <button 
              onClick={() => updateMeasures(-1)}
              className="px-2 py-1 hover:bg-gray-100 border-r border-gray-300"
              title="Decrease measures"
            >
              <Minus size={14} />
            </button>
            <span className="px-3 py-1 font-bold min-w-[2rem] text-center">{state.measures}</span>
            <button 
              onClick={() => updateMeasures(1)}
              className="px-2 py-1 hover:bg-gray-100"
              title="Increase measures"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Resolution:</span>
          <div className="flex border border-gray-300 rounded overflow-hidden bg-white">
            {[4, 8, 16].map((res) => (
              <button
                key={res}
                onClick={() => updateResolution(res as BeatResolution)}
                className={`px-3 py-1 border-r last:border-r-0 border-gray-300 hover:bg-gray-100 ${
                  state.resolution === res ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Time Sig:</span>
          <div className="flex items-center gap-1">
            <input 
              type="number" 
              value={state.timeSignature.beatsPerMeasure}
              onChange={(e) => updateTimeSignature(parseInt(e.target.value) || 1, state.timeSignature.beatValue)}
              className="w-12 px-2 py-1 border border-gray-300 rounded text-center font-bold"
              min="1"
            />
            <span className="text-gray-400">/</span>
            <select
              value={state.timeSignature.beatValue}
              onChange={(e) => updateTimeSignature(state.timeSignature.beatsPerMeasure, parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded bg-white font-bold"
            >
              {[2, 4, 8, 16].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="inline-block border border-gray-400 shadow-sm rounded-sm bg-white overflow-x-auto max-w-full print:border-none print:shadow-none print:overflow-visible">
        {renderHeader()}
        <div className="flex flex-col">
          {state?.instruments.map((inst) => (
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
    </div>
  );
};

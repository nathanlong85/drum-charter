import { useEffect, useRef } from 'react';
import type { GrooveAction } from '@/lib/state/groove-reducer';
import type { DrumInstrument, GrooveGrid } from '@/lib/types/groove';

type SelectionRange = {
  start: { instIdx: number; noteIdx: number };
  end: { instIdx: number; noteIdx: number };
} | null;

type PickerPos = {
  top: number;
  left: number;
  id: string;
  noteIndex: number;
} | null;

interface UseGrooveGridKeyboardOptions {
  readOnly: boolean;
  state: GrooveGrid;
  selectionRange: SelectionRange;
  setSelectionRange: (range: SelectionRange) => void;
  pickerPos: PickerPos;
  setPickerPos: (pos: PickerPos) => void;
  dispatch: (action: GrooveAction) => void;
}

/**
 * Keyboard shortcuts for groove grid: delete selection, copy/paste.
 */
export function useGrooveGridKeyboard({
  readOnly,
  state,
  selectionRange,
  setSelectionRange,
  pickerPos,
  setPickerPos,
  dispatch,
}: UseGrooveGridKeyboardOptions) {
  const selectionRangeRef = useRef(selectionRange);
  const pickerPosRef = useRef(pickerPos);
  const instrumentsRef = useRef(state.instruments);

  useEffect(() => {
    selectionRangeRef.current = selectionRange;
    pickerPosRef.current = pickerPos;
    instrumentsRef.current = state.instruments;
  });

  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const currentSelectionRange = selectionRangeRef.current;
      const currentPickerPos = pickerPosRef.current;
      const currentInstruments = instrumentsRef.current;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (currentSelectionRange) {
          e.preventDefault();
          dispatch({
            type: 'SET_SELECTION_SYMBOLS',
            selection: currentSelectionRange,
            symbol: 'none',
          });
          setSelectionRange(null);
        } else if (currentPickerPos) {
          e.preventDefault();
          dispatch({
            type: 'SET_SYMBOL',
            id: currentPickerPos.id,
            noteIndex: currentPickerPos.noteIndex,
            symbol: 'none',
          });
          setPickerPos(null);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && currentSelectionRange) {
        const { start, end } = currentSelectionRange;
        const minInst = Math.min(start.instIdx, end.instIdx);
        const maxInst = Math.max(start.instIdx, end.instIdx);
        const minNote = Math.min(start.noteIdx, end.noteIdx);
        const maxNote = Math.max(start.noteIdx, end.noteIdx);

        const copyData = currentInstruments
          .slice(minInst, maxInst + 1)
          .map((inst: DrumInstrument) => ({
            notes: inst.notes.slice(minNote, maxNote + 1),
            velocities: (inst.velocities || []).slice(minNote, maxNote + 1),
          }));

        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(JSON.stringify(copyData))
            .catch((err) => console.error('Failed to copy to clipboard:', err));
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const currentSelectionRange = selectionRangeRef.current;
      const currentInstruments = instrumentsRef.current;

      if (!currentSelectionRange) return;

      const text = e.clipboardData?.getData('text');
      if (!text) return;

      try {
        const pasteData = JSON.parse(text);
        if (Array.isArray(pasteData)) {
          const targetInstrument = currentInstruments[currentSelectionRange.start.instIdx];
          if (!targetInstrument) return;
          e.preventDefault();
          dispatch({
            type: 'PASTE_DATA',
            id: targetInstrument.id,
            noteIndex: currentSelectionRange.start.noteIdx,
            data: pasteData,
          });
        }
      } catch {
        // Ignore non-JSON clipboard content
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [readOnly, dispatch, setSelectionRange, setPickerPos]);
}

import { useEffect } from 'react';
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
  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectionRange) {
          e.preventDefault();
          dispatch({
            type: 'SET_SELECTION_SYMBOLS',
            selection: selectionRange,
            symbol: 'none',
          });
          setSelectionRange(null);
        } else if (pickerPos) {
          e.preventDefault();
          dispatch({
            type: 'SET_SYMBOL',
            id: pickerPos.id,
            noteIndex: pickerPos.noteIndex,
            symbol: 'none',
          });
          setPickerPos(null);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectionRange) {
        const { start, end } = selectionRange;
        const minInst = Math.min(start.instIdx, end.instIdx);
        const maxInst = Math.max(start.instIdx, end.instIdx);
        const minNote = Math.min(start.noteIdx, end.noteIdx);
        const maxNote = Math.max(start.noteIdx, end.noteIdx);

        const copyData = state.instruments
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

      if (!selectionRange) return;

      const text = e.clipboardData?.getData('text');
      if (!text) return;

      try {
        const pasteData = JSON.parse(text);
        if (Array.isArray(pasteData)) {
          const targetInstrument = state.instruments[selectionRange.start.instIdx];
          if (!targetInstrument) return;
          e.preventDefault();
          dispatch({
            type: 'PASTE_DATA',
            id: targetInstrument.id,
            noteIndex: selectionRange.start.noteIdx,
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
  }, [
    readOnly,
    selectionRange,
    pickerPos,
    state.instruments,
    dispatch,
    setSelectionRange,
    setPickerPos,
  ]);
}

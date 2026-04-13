'use client';

import { isEqual } from 'lodash';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useAudioPlayback } from '@/lib/hooks/useAudioPlayback';
import { type GrooveAction, grooveReducer } from '@/lib/state/groove-reducer';
import type { BeatResolution, DrumSymbol, GrooveGrid, TimeSignature } from '@/lib/types/groove';

interface GrooveGridContextType {
  state: GrooveGrid;
  dispatch: (action: GrooveAction) => void;
  isPlaying: boolean;
  isSamplesLoaded: boolean;
  togglePlayback: () => void;
  activeStep: number | null;
  pickerPos: {
    top: number;
    left: number;
    id: string;
    noteIndex: number;
  } | null;
  setPickerPos: (
    pos: {
      top: number;
      left: number;
      id: string;
      noteIndex: number;
    } | null,
  ) => void;
  isEditingInstruments: boolean;
  setIsEditingInstruments: (isEditing: boolean) => void;
  editingInstrumentId: string | null;
  setEditingInstrumentId: (id: string | null) => void;
  selectionRange: {
    start: { instIdx: number; noteIdx: number };
    end: { instIdx: number; noteIdx: number };
  } | null;
  setSelectionRange: (
    range: {
      start: { instIdx: number; noteIdx: number };
      end: { instIdx: number; noteIdx: number };
    } | null,
  ) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  metronomeEnabled: boolean;
  setMetronomeEnabled: (enabled: boolean) => void;
  metronomeVolume: number;
  setMetronomeVolume: (volume: number) => void;
  readOnly: boolean;
  handleNoteClick: (id: string, noteIndex: number, e: React.MouseEvent) => void;
  handleNoteRightClick: (id: string, noteIndex: number, e: React.MouseEvent) => void;
  handleSymbolSelect: (symbol: DrumSymbol | null) => void;
  handleVelocitySelect: (velocity: number) => void;
  updateMeasures: (delta: number) => void;
  updateResolution: (res: BeatResolution) => void;
  updateTimeSignature: (ts: TimeSignature) => void;
  onToggleOptionalHits: (enabled: boolean) => void;
  onClearGrid: () => void;
}

const GrooveGridContext = createContext<GrooveGridContextType | null>(null);

interface GrooveGridProviderProps {
  initialGrid: GrooveGrid;
  onChange?: (grid: GrooveGrid) => void;
  bpm: number;
  onBpmChange?: (bpm: number) => void;
  metronomeEnabled?: boolean;
  onMetronomeToggle?: (enabled: boolean) => void;
  metronomeVolume?: number;
  onMetronomeVolumeChange?: (volume: number) => void;
  readOnly?: boolean;
  children: ReactNode;
}

export function GrooveGridProvider({
  initialGrid,
  onChange,
  bpm: parentBpm,
  onBpmChange,
  metronomeEnabled: parentMetronomeEnabled,
  onMetronomeToggle,
  metronomeVolume: parentMetronomeVolume,
  onMetronomeVolumeChange,
  readOnly = false,
  children,
}: GrooveGridProviderProps) {
  const [state, dispatch] = useReducer(grooveReducer, initialGrid);
  
  // Track internal vs external changes to prevent infinite loops and state regressions
  const isInternalChange = useRef(false);
  const lastInternalState = useRef(state);
  const lastPropGrid = useRef(initialGrid);

  useEffect(() => {
    lastInternalState.current = state;
  }, [state]);

  // Sync initialGrid to internal state ONLY if it's an external update (e.g. Undo)
  useEffect(() => {
    if (!isEqual(initialGrid, lastPropGrid.current)) {
      lastPropGrid.current = initialGrid;
      // If the new prop is different from our current internal state, sync it.
      // But don't sync if it's just what we just reported via onChange.
      if (!isEqual(initialGrid, lastInternalState.current)) {
        dispatch({ type: 'SET_FULL_GRID', grid: initialGrid });
      }
    }
  }, [initialGrid]);

  // Report internal changes to parent
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      // Update our "last seen prop" to match what we're sending up,
      // so the prop-sync useEffect doesn't try to sync it back down.
      lastPropGrid.current = state;
      onChange?.(state);
    }
  }, [state, onChange]);

  const wrappedDispatch = useCallback(
    (action: GrooveAction) => {
      if (readOnly) return;
      isInternalChange.current = true;
      dispatch(action);
    },
    [readOnly],
  );

  const [pickerPos, setPickerPos] = useState<{
    top: number;
    left: number;
    id: string;
    noteIndex: number;
  } | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isEditingInstruments, setIsEditingInstruments] = useState(false);
  const [editingInstrumentId, setEditingInstrumentId] = useState<string | null>(null);
  const [selectionRange, setSelectionRange] = useState<{
    start: { instIdx: number; noteIdx: number };
    end: { instIdx: number; noteIdx: number };
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    isPlaying,
    isSamplesLoaded,
    togglePlayback,
    metronomeEnabled,
    setMetronomeEnabled: internalSetMetronomeEnabled,
    metronomeVolume,
    setMetronomeVolume: internalSetMetronomeVolume,
  } = useAudioPlayback({
    grid: state,
    bpm: parentBpm,
    onStepChange: (step) => setActiveStep(step),
    initialMetronomeEnabled: parentMetronomeEnabled,
    initialMetronomeVolume: parentMetronomeVolume,
  });

  const setMetronomeEnabled = useCallback(
    (enabled: boolean) => {
      internalSetMetronomeEnabled(enabled);
      onMetronomeToggle?.(enabled);
    },
    [internalSetMetronomeEnabled, onMetronomeToggle],
  );

  const setMetronomeVolume = useCallback(
    (volume: number) => {
      internalSetMetronomeVolume(volume);
      onMetronomeVolumeChange?.(volume);
    },
    [internalSetMetronomeVolume, onMetronomeVolumeChange],
  );

  useEffect(() => {
    if (parentMetronomeEnabled !== undefined && parentMetronomeEnabled !== metronomeEnabled) {
      internalSetMetronomeEnabled(parentMetronomeEnabled);
    }
  }, [parentMetronomeEnabled, internalSetMetronomeEnabled, metronomeEnabled]);

  useEffect(() => {
    if (parentMetronomeVolume !== undefined && parentMetronomeVolume !== metronomeVolume) {
      internalSetMetronomeVolume(parentMetronomeVolume);
    }
  }, [parentMetronomeVolume, internalSetMetronomeVolume, metronomeVolume]);

  useEffect(() => {
    if (!isPlaying) {
      setActiveStep(null);
    }
  }, [isPlaying]);

  const handleNoteRightClick = useCallback(
    (id: string, noteIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (readOnly) return;
      setSelectionRange(null);
      setPickerPos({
        top: e.clientY,
        left: e.clientX,
        id,
        noteIndex,
      });
    },
    [readOnly],
  );

  const handleNoteClick = useCallback(
    (id: string, noteIndex: number, e: React.MouseEvent) => {
      if (readOnly) return;
      if (e.altKey) {
        handleNoteRightClick(id, noteIndex, e);
        return;
      }
      if (e.shiftKey) {
        wrappedDispatch({ type: 'TOGGLE_OPTIONAL', id, noteIndex });
        return;
      }
      setSelectionRange(null);
      wrappedDispatch({ type: 'TOGGLE_NOTE', id, noteIndex });
    },
    [readOnly, handleNoteRightClick, wrappedDispatch],
  );

  const handleSymbolSelect = useCallback(
    (symbol: DrumSymbol | null) => {
      if (!pickerPos || readOnly) return;
      wrappedDispatch({
        type: 'SET_SYMBOL',
        id: pickerPos.id,
        noteIndex: pickerPos.noteIndex,
        symbol: symbol || 'none',
      });
    },
    [pickerPos, readOnly, wrappedDispatch],
  );

  const handleVelocitySelect = useCallback(
    (velocity: number) => {
      if (!pickerPos || readOnly) return;
      wrappedDispatch({
        type: 'SET_VELOCITY',
        id: pickerPos.id,
        noteIndex: pickerPos.noteIndex,
        velocity,
      });
    },
    [pickerPos, readOnly, wrappedDispatch],
  );

  // Keyboard Shortcuts logic
  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Delete key - clear selection or picker note
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectionRange) {
          wrappedDispatch({
            type: 'SET_SELECTION_SYMBOLS',
            selection: selectionRange,
            symbol: 'none',
          });
          setSelectionRange(null);
        } else if (pickerPos) {
          wrappedDispatch({
            type: 'SET_SYMBOL',
            id: pickerPos.id,
            noteIndex: pickerPos.noteIndex,
            symbol: 'none',
          });
          setPickerPos(null);
        }
      }

      // Copy/Paste logic
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectionRange) {
        // Copy selection
        const { start, end } = selectionRange;
        const minInst = Math.min(start.instIdx, end.instIdx);
        const maxInst = Math.max(start.instIdx, end.instIdx);
        const minNote = Math.min(start.noteIdx, end.noteIdx);
        const maxNote = Math.max(start.noteIdx, end.noteIdx);

        const copyData = state.instruments.slice(minInst, maxInst + 1).map((inst) => ({
          notes: inst.notes.slice(minNote, maxNote + 1),
          velocities: (inst.velocities || []).slice(minNote, maxNote + 1),
        }));

        navigator.clipboard
          .writeText(JSON.stringify(copyData))
          .catch((err) => console.error('Failed to copy to clipboard:', err));
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && selectionRange) {
        // keydown logic handled by paste listener
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
          wrappedDispatch({
            type: 'PASTE_DATA',
            id: state.instruments[selectionRange.start.instIdx].id,
            noteIndex: selectionRange.start.noteIdx,
            data: pasteData,
          });
        }
      } catch (_err) {
        // Ignore non-JSON
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [readOnly, selectionRange, pickerPos, state.instruments, wrappedDispatch]);

  const value = {
    state,
    dispatch: wrappedDispatch,
    isPlaying,
    isSamplesLoaded,
    togglePlayback,
    activeStep,
    pickerPos,
    setPickerPos,
    isEditingInstruments,
    setIsEditingInstruments,
    editingInstrumentId,
    setEditingInstrumentId,
    selectionRange,
    setSelectionRange,
    isDragging,
    setIsDragging,
    bpm: parentBpm,
    setBpm: onBpmChange || (() => {}),
    metronomeEnabled,
    setMetronomeEnabled,
    metronomeVolume,
    setMetronomeVolume,
    readOnly,
    handleNoteClick,
    handleNoteRightClick,
    handleSymbolSelect,
    handleVelocitySelect,
    updateMeasures: (delta: number) =>
      wrappedDispatch({
        type: 'SET_MEASURES',
        measures: Math.max(1, state.measures + delta),
      }),
    updateResolution: (res: BeatResolution) =>
      wrappedDispatch({ type: 'SET_RESOLUTION', resolution: res as 4 | 8 | 16 }),
    updateTimeSignature: (ts: TimeSignature) =>
      wrappedDispatch({
        type: 'SET_TIME_SIGNATURE',
        beatsPerMeasure: ts.beatsPerMeasure,
        beatValue: ts.beatValue,
      }),
    onToggleOptionalHits: (enabled: boolean) =>
      wrappedDispatch({ type: 'SET_GRID_SETTINGS', settings: { playbackOptionalHits: enabled } }),
    onClearGrid: () => wrappedDispatch({ type: 'CLEAR_GRID' }),
  };

  return <GrooveGridContext.Provider value={value}>{children}</GrooveGridContext.Provider>;
}

export function useGrooveGrid() {
  const context = useContext(GrooveGridContext);
  if (!context) {
    throw new Error('useGrooveGrid must be used within a GrooveGridProvider');
  }
  return context;
}

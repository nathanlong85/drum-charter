'use client';

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
import { useGrooveGridKeyboard } from '@/lib/hooks/useGrooveGridKeyboard';
import { type GrooveAction, grooveReducer } from '@/lib/state/groove-reducer';
import type { BeatResolution, DrumSymbol, GrooveGrid, TimeSignature } from '@/lib/types/groove';
import { deepEqual } from '@/lib/utils/deepEqual';

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

  // Track if the current state change was initiated locally (user action)
  const isInternalChange = useRef(false);
  // Track the last prop to detect external changes
  const lastPropGrid = useRef(initialGrid);

  // Sync initialGrid to internal state ONLY if it's an external update
  useEffect(() => {
    if (!deepEqual(initialGrid, lastPropGrid.current)) {
      lastPropGrid.current = initialGrid;
      // Only dispatch if the new external grid is actually different from our current state
      if (!deepEqual(initialGrid, state)) {
        dispatch({ type: 'SET_FULL_GRID', grid: initialGrid });
      }
    }
  }, [initialGrid, state]);

  // Report internal changes to parent
  useEffect(() => {
    // We ALWAYS update lastPropGrid to the current state to ensure the next
    // render cycle's initialGrid check (above) knows what we currently have.
    lastPropGrid.current = state;

    if (isInternalChange.current) {
      isInternalChange.current = false;
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

  useGrooveGridKeyboard({
    readOnly,
    state,
    selectionRange,
    setSelectionRange,
    pickerPos,
    setPickerPos,
    dispatch: wrappedDispatch,
  });

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

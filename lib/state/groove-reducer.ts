import {
  calculateTotalNotes,
  type DrumCategory,
  type DrumInstrument,
  type DrumSymbol,
  type GrooveGrid,
  getNextSymbol,
  getVelocityForSymbol,
} from '../types/groove';
import { applyRowPreset, type RowPreset } from '../utils/rowPresets';

export type GrooveAction =
  | { type: 'TOGGLE_NOTE'; id: string; noteIndex: number }
  | {
      type: 'SET_SYMBOL';
      id: string;
      noteIndex: number;
      symbol: DrumSymbol;
    }
  | {
      type: 'SET_VELOCITY';
      id: string;
      noteIndex: number;
      velocity: number;
    }
  | {
      type: 'ADD_INSTRUMENT';
      id: string;
      category: DrumCategory;
      presetVariety: string;
      customName: string;
    }
  | { type: 'REMOVE_INSTRUMENT'; id: string }
  | {
      type: 'UPDATE_INSTRUMENT';
      id: string;
      updates: Partial<Pick<DrumInstrument, 'category' | 'presetVariety' | 'customName' | 'muted'>>;
    }
  | { type: 'MOVE_INSTRUMENT'; id: string; direction: 'up' | 'down' }
  | { type: 'SET_GRID_SETTINGS'; settings: Partial<Pick<GrooveGrid, 'playbackOptionalHits'>> }
  | { type: 'SET_RESOLUTION'; resolution: 4 | 8 | 16 }
  | { type: 'SET_MEASURES'; measures: number }
  | { type: 'SET_TIME_SIGNATURE'; beatsPerMeasure: number; beatValue: number }
  | { type: 'CLEAR_GRID' }
  | { type: 'CLEAR_ROW'; id: string }
  | { type: 'APPLY_ROW_PRESET'; id: string; preset: RowPreset }
  | { type: 'TOGGLE_OPTIONAL'; id: string; noteIndex: number }
  | {
      type: 'SET_SELECTION_SYMBOLS';
      selection: {
        start: { instIdx: number; noteIdx: number };
        end: { instIdx: number; noteIdx: number };
      };
      symbol: DrumSymbol;
    }
  | {
      type: 'SET_SELECTION_VELOCITY';
      selection: {
        start: { instIdx: number; noteIdx: number };
        end: { instIdx: number; noteIdx: number };
      };
      velocity: number;
    }
  | {
      type: 'PASTE_SELECTION';
      target: { instIdx: number; noteIdx: number };
      data: Array<{
        notes: DrumSymbol[];
        velocities?: number[];
      }>;
    }
  | { type: 'SET_GRID'; payload: DrumInstrument[] }
  | {
      type: 'PASTE_DATA';
      id: string;
      noteIndex: number;
      data: Array<{ notes: DrumSymbol[]; velocities: number[] }>;
    }
  | { type: 'SET_FULL_GRID'; grid: GrooveGrid };

export function grooveReducer(state: GrooveGrid, action: GrooveAction): GrooveGrid {
  switch (action.type) {
    case 'SET_FULL_GRID':
      return { ...action.grid };
    case 'SET_GRID':
      return {
        ...state,
        instruments: action.payload,
      };
    case 'CLEAR_GRID': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => ({
          ...inst,
          notes: Array(inst.notes.length).fill('none'),
          velocities: Array(inst.notes.length).fill(0),
        })),
      };
    }

    case 'CLEAR_ROW': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.id !== action.id) return inst;
          return {
            ...inst,
            notes: Array(inst.notes.length).fill('none'),
            velocities: Array(inst.notes.length).fill(0),
          };
        }),
      };
    }

    case 'APPLY_ROW_PRESET': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.id !== action.id) return inst;
          return applyRowPreset(inst, action.preset, state);
        }),
      };
    }

    case 'TOGGLE_OPTIONAL': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.id !== action.id) return inst;
          const newNotes = [...inst.notes];
          const current = newNotes[action.noteIndex];
          if (!current || current === 'none') return inst;

          if (current.endsWith('_opt')) {
            newNotes[action.noteIndex] = current.replace('_opt', '') as DrumSymbol;
          } else {
            newNotes[action.noteIndex] = `${current}_opt` as DrumSymbol;
          }

          return { ...inst, notes: newNotes };
        }),
      };
    }

    case 'SET_SELECTION_SYMBOLS': {
      const { selection, symbol } = action;
      const minInst = Math.max(0, Math.min(selection.start.instIdx, selection.end.instIdx));
      const maxInst = Math.min(
        state.instruments.length - 1,
        Math.max(selection.start.instIdx, selection.end.instIdx),
      );
      const rawMinNote = Math.min(selection.start.noteIdx, selection.end.noteIdx);
      const rawMaxNote = Math.max(selection.start.noteIdx, selection.end.noteIdx);

      return {
        ...state,
        instruments: state.instruments.map((inst, i) => {
          if (i < minInst || i > maxInst) return inst;
          const newNotes = [...inst.notes];
          const newVelocities = inst.velocities
            ? [...inst.velocities]
            : Array(inst.notes.length).fill(0);

          const minNote = Math.max(0, rawMinNote);
          const maxNote = Math.min(inst.notes.length - 1, rawMaxNote);

          for (let j = minNote; j <= maxNote; j++) {
            newNotes[j] = symbol;
            newVelocities[j] = getVelocityForSymbol(symbol);
          }
          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }

    case 'SET_SELECTION_VELOCITY': {
      const { selection, velocity } = action;
      const minInst = Math.max(0, Math.min(selection.start.instIdx, selection.end.instIdx));
      const maxInst = Math.min(
        state.instruments.length - 1,
        Math.max(selection.start.instIdx, selection.end.instIdx),
      );
      const rawMinNote = Math.min(selection.start.noteIdx, selection.end.noteIdx);
      const rawMaxNote = Math.max(selection.start.noteIdx, selection.end.noteIdx);

      return {
        ...state,
        instruments: state.instruments.map((inst, i) => {
          if (i < minInst || i > maxInst) return inst;
          const newVelocities = inst.velocities
            ? [...inst.velocities]
            : Array(inst.notes.length).fill(0);

          const minNote = Math.max(0, rawMinNote);
          const maxNote = Math.min(inst.notes.length - 1, rawMaxNote);

          for (let j = minNote; j <= maxNote; j++) {
            newVelocities[j] = velocity;
          }
          return { ...inst, velocities: newVelocities };
        }),
      };
    }

    case 'PASTE_SELECTION': {
      const { target, data } = action;

      return {
        ...state,
        instruments: state.instruments.map((inst, i) => {
          const relativeInstIdx = i - target.instIdx;
          if (relativeInstIdx < 0 || relativeInstIdx >= data.length) return inst;

          const pasteData = data[relativeInstIdx];
          const newNotes = [...inst.notes];
          const newVelocities = inst.velocities
            ? [...inst.velocities]
            : Array(inst.notes.length).fill(0);

          for (let j = 0; j < pasteData.notes.length; j++) {
            const targetNoteIdx = target.noteIdx + j;
            if (targetNoteIdx < newNotes.length) {
              newNotes[targetNoteIdx] = pasteData.notes[j];
              newVelocities[targetNoteIdx] =
                pasteData.velocities?.[j] ?? getVelocityForSymbol(pasteData.notes[j]);
            }
          }

          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }

    case 'PASTE_DATA': {
      const { id, noteIndex, data } = action;
      const startInstIdx = state.instruments.findIndex((inst) => inst.id === id);
      if (startInstIdx === -1) return state;

      return {
        ...state,
        instruments: state.instruments.map((inst, i) => {
          const relativeInstIdx = i - startInstIdx;
          if (relativeInstIdx < 0 || relativeInstIdx >= data.length) return inst;

          const pasteData = data[relativeInstIdx];
          const newNotes = [...inst.notes];
          const newVelocities = inst.velocities
            ? [...inst.velocities]
            : Array(inst.notes.length).fill(0);

          for (let j = 0; j < pasteData.notes.length; j++) {
            const targetNoteIdx = noteIndex + j;
            if (targetNoteIdx < newNotes.length) {
              newNotes[targetNoteIdx] = pasteData.notes[j];
              newVelocities[targetNoteIdx] =
                pasteData.velocities?.[j] ?? getVelocityForSymbol(pasteData.notes[j]);
            }
          }

          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }
    case 'TOGGLE_NOTE': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.id !== action.id) return inst;
          const newNotes = [...inst.notes];
          const current = newNotes[action.noteIndex] || 'none';
          const nextSymbol = getNextSymbol(current);
          newNotes[action.noteIndex] = nextSymbol;

          // Automatically set velocity based on symbol
          const newVelocities = inst.velocities
            ? [...inst.velocities]
            : Array(inst.notes.length).fill(0);
          newVelocities[action.noteIndex] = getVelocityForSymbol(nextSymbol);

          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }

    case 'SET_SYMBOL': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.id !== action.id) return inst;
          const newNotes = [...inst.notes];
          newNotes[action.noteIndex] = action.symbol;

          const newVelocities = inst.velocities
            ? [...inst.velocities]
            : Array(inst.notes.length).fill(0);
          newVelocities[action.noteIndex] = getVelocityForSymbol(action.symbol);

          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }

    case 'SET_VELOCITY': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.id !== action.id) return inst;
          const newVelocities = inst.velocities
            ? [...inst.velocities]
            : Array(inst.notes.length).fill(0);
          newVelocities[action.noteIndex] = action.velocity;
          return { ...inst, velocities: newVelocities };
        }),
      };
    }

    case 'ADD_INSTRUMENT': {
      const totalNotes = calculateTotalNotes(state);
      return {
        ...state,
        instruments: [
          ...state.instruments,
          {
            id: action.id,
            category: action.category,
            presetVariety: action.presetVariety,
            customName: action.customName,
            notes: Array(totalNotes).fill('none'),
            velocities: Array(totalNotes).fill(0),
          },
        ],
      };
    }

    case 'REMOVE_INSTRUMENT': {
      return {
        ...state,
        instruments: state.instruments.filter((inst) => inst.id !== action.id),
      };
    }

    case 'UPDATE_INSTRUMENT': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.id !== action.id) return inst;
          return { ...inst, ...action.updates };
        }),
      };
    }

    case 'MOVE_INSTRUMENT': {
      const idx = state.instruments.findIndex((inst) => inst.id === action.id);
      if (idx === -1) return state;

      if (action.direction === 'up' && idx === 0) return state;
      if (action.direction === 'down' && idx === state.instruments.length - 1) return state;

      const newInstruments = [...state.instruments];
      if (action.direction === 'up') {
        [newInstruments[idx - 1], newInstruments[idx]] = [
          newInstruments[idx],
          newInstruments[idx - 1],
        ];
      } else {
        [newInstruments[idx + 1], newInstruments[idx]] = [
          newInstruments[idx],
          newInstruments[idx + 1],
        ];
      }

      return {
        ...state,
        instruments: newInstruments,
      };
    }

    case 'SET_GRID_SETTINGS': {
      return {
        ...state,
        ...action.settings,
      };
    }

    case 'SET_RESOLUTION': {
      const newState = { ...state, resolution: action.resolution };
      const newTotalNotes = calculateTotalNotes(newState);

      return {
        ...newState,
        instruments: state.instruments.map((inst) => {
          const newNotes = Array(newTotalNotes).fill('none');
          const newVelocities = Array(newTotalNotes).fill(0);
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
            if (inst.velocities) {
              newVelocities[i] = inst.velocities[i];
            } else {
              newVelocities[i] = getVelocityForSymbol(inst.notes[i]);
            }
          }
          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }

    case 'SET_MEASURES': {
      const newState = { ...state, measures: action.measures };
      const newTotalNotes = calculateTotalNotes(newState);

      return {
        ...newState,
        instruments: state.instruments.map((inst) => {
          const newNotes = Array(newTotalNotes).fill('none');
          const newVelocities = Array(newTotalNotes).fill(0);
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
            if (inst.velocities) {
              newVelocities[i] = inst.velocities[i];
            } else {
              newVelocities[i] = getVelocityForSymbol(inst.notes[i]);
            }
          }
          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }

    case 'SET_TIME_SIGNATURE': {
      const newState = {
        ...state,
        timeSignature: {
          beatsPerMeasure: action.beatsPerMeasure,
          beatValue: action.beatValue,
        },
      };
      const newTotalNotes = calculateTotalNotes(newState);

      return {
        ...newState,
        instruments: state.instruments.map((inst) => {
          const newNotes = Array(newTotalNotes).fill('none');
          const newVelocities = Array(newTotalNotes).fill(0);
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
            if (inst.velocities) {
              newVelocities[i] = inst.velocities[i];
            } else {
              newVelocities[i] = getVelocityForSymbol(inst.notes[i]);
            }
          }
          return { ...inst, notes: newNotes, velocities: newVelocities };
        }),
      };
    }

    default:
      return state;
  }
}

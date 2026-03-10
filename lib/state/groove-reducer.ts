import { DrumSymbol, GrooveGrid, calculateTotalNotes } from '../types/groove';

export type GrooveAction =
  | { type: 'TOGGLE_NOTE'; instrumentId: string; noteIndex: number }
  | { type: 'SET_SYMBOL'; instrumentId: string; noteIndex: number; symbol: DrumSymbol }
  | { type: 'ADD_INSTRUMENT'; id: string; label: string }
  | { type: 'REMOVE_INSTRUMENT'; id: string }
  | { type: 'SET_RESOLUTION'; resolution: 4 | 8 | 16 }
  | { type: 'SET_MEASURES'; measures: number };

export function grooveReducer(state: GrooveGrid, action: GrooveAction): GrooveGrid {
  switch (action.type) {
    case 'TOGGLE_NOTE': {
      const nextMap: Record<string, DrumSymbol> = {
        'none': 'standard',
        'standard': 'ghost',
        'ghost': 'accent',
        'accent': 'none'
      };

      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.instrumentId !== action.instrumentId) return inst;
          const newNotes = [...inst.notes];
          const current = newNotes[action.noteIndex] || 'none';
          newNotes[action.noteIndex] = nextMap[current] || 'none';
          return { ...inst, notes: newNotes };
        }),
      };
    }

    case 'SET_SYMBOL': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.instrumentId !== action.instrumentId) return inst;
          const newNotes = [...inst.notes];
          newNotes[action.noteIndex] = action.symbol;
          return { ...inst, notes: newNotes };
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
            instrumentId: action.id,
            label: action.label,
            notes: Array(totalNotes).fill('none'),
          },
        ],
      };
    }

    case 'REMOVE_INSTRUMENT': {
      return {
        ...state,
        instruments: state.instruments.filter((inst) => inst.instrumentId !== action.id),
      };
    }

    case 'SET_RESOLUTION': {
      const newState = { ...state, resolution: action.resolution };
      const newTotalNotes = calculateTotalNotes(newState);
      
      return {
        ...newState,
        instruments: state.instruments.map((inst) => {
          const newNotes = Array(newTotalNotes).fill('none');
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
          }
          return { ...inst, notes: newNotes };
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
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
          }
          return { ...inst, notes: newNotes };
        }),
      };
    }

    default:
      return state;
  }
}

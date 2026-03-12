import { DrumSymbol, GrooveGrid, calculateTotalNotes } from '../types/groove';

export type GrooveAction =
  | { type: 'TOGGLE_NOTE'; instrumentId: string; noteIndex: number }
  | { type: 'SET_SYMBOL'; instrumentId: string; noteIndex: number; symbol: DrumSymbol }
  | { type: 'SET_VELOCITY'; instrumentId: string; noteIndex: number; velocity: number }
  | { type: 'ADD_INSTRUMENT'; id: string; label: string }
  | { type: 'REMOVE_INSTRUMENT'; id: string }
  | { type: 'SET_RESOLUTION'; resolution: 4 | 8 | 16 }
  | { type: 'SET_MEASURES'; measures: number }
  | { type: 'SET_TIME_SIGNATURE'; beatsPerMeasure: number; beatValue: number };

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

          // Clear explicit velocity when note is toggled off
          if (newNotes[action.noteIndex] === 'none' && inst.velocities) {
            const newVelocities = [...inst.velocities];
            newVelocities[action.noteIndex] = 0;
            return { ...inst, notes: newNotes, velocities: newVelocities };
          }

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

    case 'SET_VELOCITY': {
      return {
        ...state,
        instruments: state.instruments.map((inst) => {
          if (inst.instrumentId !== action.instrumentId) return inst;
          const newVelocities = inst.velocities ? [...inst.velocities] : Array(inst.notes.length).fill(0.7);
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
            instrumentId: action.id,
            label: action.label,
            notes: Array(totalNotes).fill('none'),
            velocities: Array(totalNotes).fill(0),
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
          const newVelocities = inst.velocities ? Array(newTotalNotes).fill(0) : undefined;
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
            if (newVelocities && inst.velocities) {
              newVelocities[i] = inst.velocities[i];
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
          const newVelocities = inst.velocities ? Array(newTotalNotes).fill(0) : undefined;
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
            if (newVelocities && inst.velocities) {
              newVelocities[i] = inst.velocities[i];
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
          beatValue: action.beatValue 
        } 
      };
      const newTotalNotes = calculateTotalNotes(newState);
      
      return {
        ...newState,
        instruments: state.instruments.map((inst) => {
          const newNotes = Array(newTotalNotes).fill('none');
          const newVelocities = inst.velocities ? Array(newTotalNotes).fill(0) : undefined;
          // Note: Changing time signature fundamentally changes the grid layout, 
          // so preserving notes by index might not make musical sense, 
          // but it's the most "stable" UI behavior for now.
          for (let i = 0; i < Math.min(inst.notes.length, newTotalNotes); i++) {
            newNotes[i] = inst.notes[i];
            if (newVelocities && inst.velocities) {
              newVelocities[i] = inst.velocities[i];
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

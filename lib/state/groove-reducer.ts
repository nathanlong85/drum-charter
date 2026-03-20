import {
  calculateTotalNotes,
  type DrumCategory,
  type DrumInstrument,
  type DrumSymbol,
  type GrooveGrid,
  getNextSymbol,
  getVelocityForSymbol,
} from '../types/groove';

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
      label: string;
    }
  | { type: 'REMOVE_INSTRUMENT'; id: string }
  | {
      type: 'UPDATE_INSTRUMENT';
      id: string;
      updates: Partial<Pick<DrumInstrument, 'category' | 'presetVariety' | 'customName'>>;
    }
  | { type: 'MOVE_INSTRUMENT'; id: string; direction: 'up' | 'down' }
  | { type: 'SET_GRID_SETTINGS'; settings: Partial<Pick<GrooveGrid, 'playbackOptionalHits'>> }
  | { type: 'SET_RESOLUTION'; resolution: 4 | 8 | 16 }
  | { type: 'SET_MEASURES'; measures: number }
  | { type: 'SET_TIME_SIGNATURE'; beatsPerMeasure: number; beatValue: number }
  | { type: 'SET_GRID'; payload: DrumInstrument[] }
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
            customName: action.label,
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

      const newInstruments = [...state.instruments];
      if (action.direction === 'up' && idx > 0) {
        [newInstruments[idx - 1], newInstruments[idx]] = [
          newInstruments[idx],
          newInstruments[idx - 1],
        ];
      } else if (action.direction === 'down' && idx < newInstruments.length - 1) {
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

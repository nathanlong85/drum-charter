import { describe, expect, it } from 'vitest';
import type { GrooveGrid } from '../../types/groove';
import { grooveReducer } from '../groove-reducer';

const initialGrid: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [
    {
      id: 'hh',
      category: 'hi-hat',
      presetVariety: 'Hi-Hat',
      customName: 'Hi-Hat',
      notes: new Array(16).fill('none'),
      velocities: new Array(16).fill(0),
    },
  ],
};

describe('grooveReducer', () => {
  it('handles TOGGLE_NOTE cycle and default velocities', () => {
    // Note: Reducer uses action.noteIndex
    const action = { type: 'TOGGLE_NOTE', id: 'hh', noteIndex: 0 } as const;

    // Cycle 1: none -> standard (0.7)
    let state = grooveReducer(initialGrid, action);
    expect(state.instruments[0].notes[0]).toBe('standard');
    expect(state.instruments[0].velocities[0]).toBe(0.7);

    // Cycle 2: standard -> accent (1.2)
    state = grooveReducer(state, action);
    expect(state.instruments[0].notes[0]).toBe('accent');
    expect(state.instruments[0].velocities[0]).toBe(1.2);
  });

  it('handles SET_SYMBOL', () => {
    const action = { type: 'SET_SYMBOL', id: 'hh', noteIndex: 2, symbol: 'accent' as const };
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments[0].notes[2]).toBe('accent');
    expect(nextState.instruments[0].velocities[2]).toBe(1.2);
  });

  it('handles SET_VELOCITY', () => {
    const action = { type: 'SET_VELOCITY', id: 'hh', noteIndex: 0, velocity: 0.9 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments[0].velocities[0]).toBe(0.9);
  });

  it('handles SET_RESOLUTION', () => {
    const action = { type: 'SET_RESOLUTION', resolution: 8 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.resolution).toBe(8);
    expect(nextState.instruments[0].notes.length).toBe(8);
  });

  it('handles SET_MEASURES', () => {
    const action = { type: 'SET_MEASURES', measures: 2 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.measures).toBe(2);
    expect(nextState.instruments[0].notes.length).toBe(32);
  });

  it('handles SET_TIME_SIGNATURE', () => {
    const action = { type: 'SET_TIME_SIGNATURE', beatsPerMeasure: 3, beatValue: 4 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.timeSignature.beatsPerMeasure).toBe(3);
    expect(nextState.instruments[0].notes.length).toBe(12);
  });

  it('preserves velocities on grid resize', () => {
    const stateWithVel = {
      ...initialGrid,
      instruments: [
        {
          ...initialGrid.instruments[0],
          velocities: new Array(16).fill(0.9),
        },
      ],
    };
    const resizeAction = { type: 'SET_MEASURES', measures: 2 } as const;
    const nextState = grooveReducer(stateWithVel, resizeAction);

    expect(nextState.instruments[0].velocities.length).toBe(32);
    expect(nextState.instruments[0].velocities[0]).toBe(0.9);
  });

  it('handles ADD_INSTRUMENT', () => {
    const action = {
      type: 'ADD_INSTRUMENT',
      id: 'snare',
      category: 'snare' as const,
      presetVariety: 'Snare',
      label: 'Main Snare',
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments.length).toBe(2);
    expect(nextState.instruments[1].id).toBe('snare');
    expect(nextState.instruments[1].customName).toBe('Main Snare');
  });

  it('handles REMOVE_INSTRUMENT', () => {
    const action = { type: 'REMOVE_INSTRUMENT', id: 'hh' } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments.length).toBe(0);
  });

  it('handles UPDATE_INSTRUMENT', () => {
    const action = {
      type: 'UPDATE_INSTRUMENT',
      id: 'hh',
      updates: { customName: 'New HH', category: 'misc' as const },
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments[0].customName).toBe('New HH');
    expect(nextState.instruments[0].category).toBe('misc');
  });

  it('handles MOVE_INSTRUMENT', () => {
    const withSnare = grooveReducer(initialGrid, {
      type: 'ADD_INSTRUMENT',
      id: 'sn',
      category: 'snare',
      presetVariety: 'Snare',
      label: 'Snare',
    });

    const moveUp = grooveReducer(withSnare, { type: 'MOVE_INSTRUMENT', id: 'sn', direction: 'up' });
    expect(moveUp.instruments[0].id).toBe('sn');
    expect(moveUp.instruments[1].id).toBe('hh');

    const moveDown = grooveReducer(moveUp, {
      type: 'MOVE_INSTRUMENT',
      id: 'sn',
      direction: 'down',
    });
    expect(moveDown.instruments[0].id).toBe('hh');
    expect(moveDown.instruments[1].id).toBe('sn');
  });

  it('handles SET_GRID', () => {
    const newInstruments = [
      {
        id: 'new',
        category: 'kick' as const,
        presetVariety: 'Kick',
        customName: 'New',
        notes: [],
        velocities: [],
      },
    ];
    const nextState = grooveReducer(initialGrid, { type: 'SET_GRID', payload: newInstruments });
    expect(nextState.instruments).toEqual(newInstruments);
  });

  it('handles SET_FULL_GRID', () => {
    const fullGrid: GrooveGrid = {
      timeSignature: { beatsPerMeasure: 3, beatValue: 4 },
      resolution: 8,
      measures: 2,
      instruments: [],
    };
    const nextState = grooveReducer(initialGrid, { type: 'SET_FULL_GRID', grid: fullGrid });
    expect(nextState.timeSignature.beatsPerMeasure).toBe(3);
    expect(nextState.resolution).toBe(8);
  });

  it('handles SET_GRID_SETTINGS', () => {
    const nextState = grooveReducer(initialGrid, {
      type: 'SET_GRID_SETTINGS',
      settings: { playbackOptionalHits: false },
    });
    expect(nextState.playbackOptionalHits).toBe(false);
  });

  it('handles CLEAR_GRID', () => {
    const withNotes = {
      ...initialGrid,
      instruments: [{ ...initialGrid.instruments[0], notes: ['standard', 'accent'] }],
    };
    const nextState = grooveReducer(withNotes, { type: 'CLEAR_GRID' });
    expect(nextState.instruments[0].notes.every((n) => n === 'none')).toBe(true);
  });

  it('handles CLEAR_ROW', () => {
    const withNotes = {
      ...initialGrid,
      instruments: [{ ...initialGrid.instruments[0], notes: ['standard', 'accent'] }],
    };
    const nextState = grooveReducer(withNotes, { type: 'CLEAR_ROW', id: 'hh' });
    expect(nextState.instruments[0].notes.every((n) => n === 'none')).toBe(true);
  });

  it('handles TOGGLE_OPTIONAL', () => {
    const withStandard = {
      ...initialGrid,
      instruments: [{ ...initialGrid.instruments[0], notes: ['standard'] }],
    };
    // standard -> standard_opt
    let state = grooveReducer(withStandard, { type: 'TOGGLE_OPTIONAL', id: 'hh', noteIndex: 0 });
    expect(state.instruments[0].notes[0]).toBe('standard_opt');

    // standard_opt -> standard
    state = grooveReducer(state, { type: 'TOGGLE_OPTIONAL', id: 'hh', noteIndex: 0 });
    expect(state.instruments[0].notes[0]).toBe('standard');

    // none -> none (unchanged)
    const withNone = {
      ...initialGrid,
      instruments: [{ ...initialGrid.instruments[0], notes: ['none'] }],
    };
    state = grooveReducer(withNone, { type: 'TOGGLE_OPTIONAL', id: 'hh', noteIndex: 0 });
    expect(state.instruments[0].notes[0]).toBe('none');
  });

  it('handles SET_SELECTION_SYMBOLS', () => {
    const selection = {
      start: { instIdx: 0, noteIdx: 0 },
      end: { instIdx: 0, noteIdx: 2 },
    };
    const nextState = grooveReducer(initialGrid, {
      type: 'SET_SELECTION_SYMBOLS',
      selection,
      symbol: 'buzz',
    });
    expect(nextState.instruments[0].notes.slice(0, 3)).toEqual(['buzz', 'buzz', 'buzz']);
    expect(nextState.instruments[0].notes[3]).toBe('none');
  });

  it('handles SET_SELECTION_VELOCITY', () => {
    const selection = {
      start: { instIdx: 0, noteIdx: 0 },
      end: { instIdx: 0, noteIdx: 2 },
    };
    const nextState = grooveReducer(initialGrid, {
      type: 'SET_SELECTION_VELOCITY',
      selection,
      velocity: 0.5,
    });
    expect(nextState.instruments[0].velocities.slice(0, 3)).toEqual([0.5, 0.5, 0.5]);
  });

  it('handles PASTE_SELECTION', () => {
    const data = [
      {
        notes: ['standard' as const, 'accent' as const],
        velocities: [0.7, 1.2],
      },
    ];
    const nextState = grooveReducer(initialGrid, {
      type: 'PASTE_SELECTION',
      target: { instIdx: 0, noteIdx: 1 },
      data,
    });
    expect(nextState.instruments[0].notes[1]).toBe('standard');
    expect(nextState.instruments[0].notes[2]).toBe('accent');
    expect(nextState.instruments[0].velocities[1]).toBe(0.7);
    expect(nextState.instruments[0].velocities[2]).toBe(1.2);
  });
});

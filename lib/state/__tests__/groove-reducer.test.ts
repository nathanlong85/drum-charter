import { describe, expect, it } from 'vitest';
import type { DrumSymbol, GrooveGrid } from '../../types/groove';
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
    // Note: Reducer uses action.id and noteIndex
    const action = { type: 'TOGGLE_NOTE', id: 'hh', noteIndex: 0 } as const;

    // Cycle 1: none -> standard (0.7)
    let state = grooveReducer(initialGrid, action);
    expect(state.instruments[0].notes[0]).toBe('standard');
    expect(state.instruments[0].velocities![0]).toBe(0.7);

    // Cycle 2: standard -> accent (1.2)
    state = grooveReducer(state, action);
    expect(state.instruments[0].notes[0]).toBe('accent');
    expect(state.instruments[0].velocities![0]).toBe(1.2);
  });

  it('handles SET_SYMBOL', () => {
    const action = {
      type: 'SET_SYMBOL',
      id: 'hh',
      noteIndex: 2,
      symbol: 'accent' as DrumSymbol,
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments[0].notes[2]).toBe('accent');
    expect(nextState.instruments[0].velocities![2]).toBe(1.2);
  });

  it('handles SET_VELOCITY', () => {
    const action = { type: 'SET_VELOCITY', id: 'hh', noteIndex: 0, velocity: 0.9 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments[0].velocities![0]).toBe(0.9);
  });

  it('handles SET_RESOLUTION', () => {
    const action = { type: 'SET_RESOLUTION', resolution: 8 as const } as const;
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
    const action = {
      type: 'SET_TIME_SIGNATURE',
      beatsPerMeasure: 3,
      beatValue: 4,
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.timeSignature.beatsPerMeasure).toBe(3);
    expect(nextState.instruments[0].notes.length).toBe(12);
  });

  it('preserves velocities on grid resize', () => {
    const stateWithVel: GrooveGrid = {
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

    expect(nextState.instruments[0].velocities!.length).toBe(32);
    expect(nextState.instruments[0].velocities![0]).toBe(0.9);
  });

  it('handles ADD_INSTRUMENT', () => {
    const action = {
      type: 'ADD_INSTRUMENT',
      id: 'snare',
      category: 'snare' as const,
      presetVariety: 'Snare',
      customName: 'Main Snare',
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
      customName: 'Snare',
    });

    const moveUp = grooveReducer(withSnare, {
      type: 'MOVE_INSTRUMENT',
      id: 'sn',
      direction: 'up',
    });
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

  it('handles SET_GRID_SETTINGS', () => {
    const action = {
      type: 'SET_GRID_SETTINGS',
      settings: { playbackOptionalHits: false },
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.playbackOptionalHits).toBe(false);
  });

  it('handles CLEAR_GRID', () => {
    const withNotes: GrooveGrid = {
      ...initialGrid,
      instruments: [
        {
          ...initialGrid.instruments[0],
          notes: ['standard', 'accent', 'ghost', 'none'],
        },
      ],
    };
    const nextState = grooveReducer(withNotes, { type: 'CLEAR_GRID' });
    expect(nextState.instruments[0].notes.every((n) => n === 'none')).toBe(true);
    expect(nextState.instruments[0].velocities!.every((v) => v === 0)).toBe(true);
  });

  it('handles CLEAR_ROW', () => {
    const withNotes: GrooveGrid = {
      ...initialGrid,
      instruments: [
        {
          ...initialGrid.instruments[0],
          notes: ['standard', 'accent', 'ghost', 'none'],
        },
      ],
    };
    const nextState = grooveReducer(withNotes, { type: 'CLEAR_ROW', id: 'hh' });
    expect(nextState.instruments[0].notes.every((n) => n === 'none')).toBe(true);
  });

  it('handles TOGGLE_OPTIONAL', () => {
    const withStandard: GrooveGrid = {
      ...initialGrid,
      instruments: [
        {
          ...initialGrid.instruments[0],
          notes: ['standard', 'none', 'none', 'none'],
        },
      ],
    };
    let state = grooveReducer(withStandard, {
      type: 'TOGGLE_OPTIONAL',
      id: 'hh',
      noteIndex: 0,
    });
    expect(state.instruments[0].notes[0]).toBe('standard_opt');

    state = grooveReducer(state, { type: 'TOGGLE_OPTIONAL', id: 'hh', noteIndex: 0 });
    expect(state.instruments[0].notes[0]).toBe('standard');

    const withNone: GrooveGrid = {
      ...initialGrid,
      instruments: [
        {
          ...initialGrid.instruments[0],
          notes: ['none', 'none', 'none', 'none'],
        },
      ],
    };
    state = grooveReducer(withNone, { type: 'TOGGLE_OPTIONAL', id: 'hh', noteIndex: 0 });
    expect(state.instruments[0].notes[0]).toBe('none');
  });

  it('handles SET_SELECTION_SYMBOLS', () => {
    const nextState = grooveReducer(initialGrid, {
      type: 'SET_SELECTION_SYMBOLS',
      selection: {
        start: { instIdx: 0, noteIdx: 0 },
        end: { instIdx: 0, noteIdx: 2 },
      },
      symbol: 'accent',
    });

    expect(nextState.instruments[0].notes.slice(0, 3)).toEqual(['accent', 'accent', 'accent']);
    expect(nextState.instruments[0].velocities!.slice(0, 3)).toEqual([1.2, 1.2, 1.2]);
  });

  it('handles SET_SELECTION_VELOCITY', () => {
    const nextState = grooveReducer(initialGrid, {
      type: 'SET_SELECTION_VELOCITY',
      selection: {
        start: { instIdx: 0, noteIdx: 0 },
        end: { instIdx: 0, noteIdx: 2 },
      },
      velocity: 0.5,
    });

    expect(nextState.instruments[0].velocities!.slice(0, 3)).toEqual([0.5, 0.5, 0.5]);
  });

  it('handles PASTE_SELECTION', () => {
    const data = [
      {
        notes: ['standard', 'accent'] as DrumSymbol[],
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
    expect(nextState.instruments[0].velocities![1]).toBe(0.7);
    expect(nextState.instruments[0].velocities![2]).toBe(1.2);
  });

  describe('REORDER_INSTRUMENTS', () => {
    const fiveInstrumentGrid: GrooveGrid = {
      ...initialGrid,
      instruments: ['a', 'b', 'c', 'd', 'e'].map((id) => ({
        id,
        category: 'hi-hat' as const,
        presetVariety: 'Hi-Hat',
        customName: id,
        notes: new Array(16).fill('none'),
        velocities: new Array(16).fill(0),
      })),
    };

    it('moves an instrument to an earlier position', () => {
      const next = grooveReducer(fiveInstrumentGrid, {
        type: 'REORDER_INSTRUMENTS',
        fromIndex: 3,
        toIndex: 1,
      });
      expect(next.instruments.map((i) => i.id)).toEqual(['a', 'd', 'b', 'c', 'e']);
    });

    it('moves an instrument to a later position', () => {
      const next = grooveReducer(fiveInstrumentGrid, {
        type: 'REORDER_INSTRUMENTS',
        fromIndex: 0,
        toIndex: 4,
      });
      expect(next.instruments.map((i) => i.id)).toEqual(['b', 'c', 'd', 'e', 'a']);
    });

    it('is a no-op when fromIndex equals toIndex', () => {
      const next = grooveReducer(fiveInstrumentGrid, {
        type: 'REORDER_INSTRUMENTS',
        fromIndex: 2,
        toIndex: 2,
      });
      expect(next).toBe(fiveInstrumentGrid);
    });

    it('is a no-op when fromIndex is out of bounds', () => {
      const next = grooveReducer(fiveInstrumentGrid, {
        type: 'REORDER_INSTRUMENTS',
        fromIndex: 10,
        toIndex: 1,
      });
      expect(next).toBe(fiveInstrumentGrid);
    });

    it('is a no-op when toIndex is out of bounds', () => {
      const next = grooveReducer(fiveInstrumentGrid, {
        type: 'REORDER_INSTRUMENTS',
        fromIndex: 1,
        toIndex: 10,
      });
      expect(next).toBe(fiveInstrumentGrid);
    });
  });
});

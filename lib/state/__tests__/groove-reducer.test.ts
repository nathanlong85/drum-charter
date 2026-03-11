import { describe, it, expect } from 'vitest';
import { grooveReducer } from '../groove-reducer';
import { GrooveGrid } from '../../types/groove';

const initialGrid: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [
    { instrumentId: 'hh', label: 'Hi-Hat', notes: Array(16).fill('none') },
  ],
};

describe('grooveReducer', () => {
  it('handles TOGGLE_NOTE', () => {
    const action = { type: 'TOGGLE_NOTE', instrumentId: 'hh', noteIndex: 0 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments[0].notes[0]).toBe('standard');
    
    const secondState = grooveReducer(nextState, action);
    expect(secondState.instruments[0].notes[0]).toBe('ghost');
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
    // Change to 3/4
    const action = { type: 'SET_TIME_SIGNATURE', beatsPerMeasure: 3, beatValue: 4 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.timeSignature.beatsPerMeasure).toBe(3);
    expect(nextState.timeSignature.beatValue).toBe(4);
    // 3 beats * (16 / 4) = 12 notes per measure
    expect(nextState.instruments[0].notes.length).toBe(12);
  });

  it('handles SET_TIME_SIGNATURE with different beat value', () => {
    // Change to 6/8
    const action = { type: 'SET_TIME_SIGNATURE', beatsPerMeasure: 6, beatValue: 8 } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.timeSignature.beatsPerMeasure).toBe(6);
    expect(nextState.timeSignature.beatValue).toBe(8);
    // 6 beats * (16 / 8) = 12 notes per measure
    expect(nextState.instruments[0].notes.length).toBe(12);
  });
});

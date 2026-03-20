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
      notes: Array(16).fill('none'),
      velocities: Array(16).fill(0),
    },
  ],
};

describe('grooveReducer', () => {
  it('handles TOGGLE_NOTE cycle and default velocities', () => {
    const action = {
      type: 'TOGGLE_NOTE',
      id: 'hh',
      noteIndex: 0,
    } as const;

    // Toggle 1: Standard
    const state1 = grooveReducer(initialGrid, action);
    expect(state1.instruments[0].notes[0]).toBe('standard');
    expect(state1.instruments[0].velocities[0]).toBe(0.7);

    // Toggle 2: Accent
    const state2 = grooveReducer(state1, action);
    expect(state2.instruments[0].notes[0]).toBe('accent');
    expect(state2.instruments[0].velocities[0]).toBe(1.2);

    // Toggle 3: Ghost
    const state3 = grooveReducer(state2, action);
    expect(state3.instruments[0].notes[0]).toBe('ghost');
    expect(state3.instruments[0].velocities[0]).toBe(0.2);

    // Toggle 4: None
    const state4 = grooveReducer(state3, action);
    expect(state4.instruments[0].notes[0]).toBe('none');
    expect(state4.instruments[0].velocities[0]).toBe(0);
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
    const action = {
      type: 'SET_TIME_SIGNATURE',
      beatsPerMeasure: 3,
      beatValue: 4,
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.timeSignature.beatsPerMeasure).toBe(3);
    expect(nextState.timeSignature.beatValue).toBe(4);
    // 3 beats * (16 / 4) = 12 notes per measure
    expect(nextState.instruments[0].notes.length).toBe(12);
  });

  it('handles SET_TIME_SIGNATURE with different beat value', () => {
    // Change to 6/8
    const action = {
      type: 'SET_TIME_SIGNATURE',
      beatsPerMeasure: 6,
      beatValue: 8,
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.timeSignature.beatsPerMeasure).toBe(6);
    expect(nextState.timeSignature.beatValue).toBe(8);
    // 6 beats * (16 / 8) = 12 notes per measure
    expect(nextState.instruments[0].notes.length).toBe(12);
  });

  it('handles SET_VELOCITY', () => {
    const action = {
      type: 'SET_VELOCITY',
      id: 'hh',
      noteIndex: 0,
      velocity: 0.5,
    } as const;
    const nextState = grooveReducer(initialGrid, action);
    expect(nextState.instruments[0].velocities[0]).toBe(0.5);
  });

  it('preserves velocities on grid resize', () => {
    const velAction = {
      type: 'SET_VELOCITY',
      id: 'hh',
      noteIndex: 0,
      velocity: 0.9,
    } as const;
    const stateWithVel = grooveReducer(initialGrid, velAction);

    const resizeAction = { type: 'SET_MEASURES', measures: 2 } as const;
    const nextState = grooveReducer(stateWithVel, resizeAction);

    expect(nextState.instruments[0].velocities.length).toBe(32);
    expect(nextState.instruments[0].velocities[0]).toBe(0.9);
  });
});

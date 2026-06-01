import { describe, expect, it } from 'vitest';
import { createDefaultDrumInstruments, type GrooveSnippet } from '../../types/groove';
import { snippetReducer } from '../snippet-reducer';

const gridShape = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16 as const,
  measures: 1,
};

const baseSnippet: GrooveSnippet = {
  id: 'snip-1',
  title: 'Groove',
  tags: [],
  userId: 'user-1',
  isPublic: false,
  createdAt: null,
  updatedAt: null,
  ...gridShape,
  instruments: createDefaultDrumInstruments(gridShape),
};

describe('snippetReducer', () => {
  it('updates title', () => {
    const next = snippetReducer(baseSnippet, { type: 'UPDATE_TITLE', title: 'Fill' });
    expect(next.title).toBe('Fill');
  });

  it('updates public flag', () => {
    const next = snippetReducer(baseSnippet, { type: 'UPDATE_PUBLIC', isPublic: true });
    expect(next.isPublic).toBe(true);
  });

  it('updates BPM', () => {
    const next = snippetReducer(baseSnippet, { type: 'UPDATE_BPM', bpm: 92 });
    expect(next.bpm).toBe(92);
  });

  it('updates grid', () => {
    const newGrid = {
      ...gridShape,
      measures: 2,
      instruments: createDefaultDrumInstruments({ ...gridShape, measures: 2 }),
    };
    const next = snippetReducer(baseSnippet, { type: 'UPDATE_GRID', grid: newGrid });
    expect(next.measures).toBe(2);
  });
});

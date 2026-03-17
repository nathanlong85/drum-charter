import { describe, expect, it } from 'vitest';
import { calculateTotalNotes, type GrooveGrid } from '@/lib/types/groove';

describe('calculateTotalNotes', () => {
  it('calculates total notes for 4/4 at 16th resolution', () => {
    const grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
    };
    expect(calculateTotalNotes(grid)).toBe(16);
  });

  it('calculates total notes for 3/4 at 16th resolution', () => {
    const grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
      timeSignature: { beatsPerMeasure: 3, beatValue: 4 },
      resolution: 16,
      measures: 1,
    };
    expect(calculateTotalNotes(grid)).toBe(12);
  });

  it('calculates total notes for 2 measures of 4/4 at 8th resolution', () => {
    const grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 8,
      measures: 2,
    };
    expect(calculateTotalNotes(grid)).toBe(16);
  });

  it('calculates total notes for 6/8 at 16th resolution', () => {
    // 6/8 means 6 beats of 8th notes.
    // In 6/8, if resolution is 16, we expect 12 notes per measure.
    // (6 * (16 / 8)) * 1 = 12
    const grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
      timeSignature: { beatsPerMeasure: 6, beatValue: 8 },
      resolution: 16,
      measures: 1,
    };
    expect(calculateTotalNotes(grid)).toBe(12);
  });
});

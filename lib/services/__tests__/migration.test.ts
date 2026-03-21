import { describe, expect, it } from 'vitest';
import type { GrooveGrid } from '../../types/groove';
import { migrateGrooveGrid } from '../supabase-service';

describe('migrateGrooveGrid', () => {
  it('handles null or undefined grid', () => {
    expect(migrateGrooveGrid(null)).toBeUndefined();
    expect(migrateGrooveGrid(undefined)).toBeUndefined();
  });

  it('migrates legacy instruments with basic instrumentId', () => {
    const legacyGrid = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [
        {
          instrumentId: 'kick',
          notes: ['standard', 'none', 'none', 'none'],
          velocities: [0.8, 0, 0, 0],
        },
        {
          instrumentId: 'snare_main',
          notes: ['none', 'none', 'standard', 'none'],
        },
      ],
    };

    const result = migrateGrooveGrid(legacyGrid) as GrooveGrid;

    expect(result.instruments).toHaveLength(2);

    // Kick migration
    expect(result.instruments[0].category).toBe('kick');
    expect(result.instruments[0].presetVariety).toBe('Kick');
    expect(result.instruments[0].notes).toHaveLength(16);
    expect(result.instruments[0].velocities).toHaveLength(16);
    expect(result.instruments[0].velocities![0]).toBe(0.8);

    // Snare migration
    expect(result.instruments[1].category).toBe('snare');
    expect(result.instruments[1].presetVariety).toBe('Snare');
    expect(result.instruments[1].notes).toHaveLength(16);
    // Should derive velocity for standard hit at index 2
    expect(result.instruments[1].velocities![2]).toBe(0.7);
  });

  it('correctly maps various instrument names to categories', () => {
    const names = [
      { id: 'bd', cat: 'kick' },
      { id: 'bass_drum', cat: 'kick' },
      { id: 'sn', cat: 'snare' },
      { id: 'hi_hat_top', cat: 'hi-hat' },
      { id: 'hh_closed', cat: 'hi-hat' },
      { id: 'hats', cat: 'hi-hat' },
      { id: 'ride_cym', cat: 'ride' },
      { id: 'crash_1', cat: 'crash' },
      { id: 'high_tom', cat: 'tom', variety: 'High Tom' },
      { id: 'floor_tom', cat: 'tom', variety: 'Floor Tom' },
    ];

    const grid = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 4,
      measures: 1,
      instruments: names.map((n) => ({ instrumentId: n.id, notes: [] })),
    };

    const result = migrateGrooveGrid(grid) as GrooveGrid;
    names.forEach((n, i) => {
      expect(result.instruments[i].category).toBe(n.cat);
      if (n.variety) {
        expect(result.instruments[i].presetVariety).toBe(n.variety);
      }
    });
  });

  it('normalizes array lengths if they mismatch the grid configuration', () => {
    const grid = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1, // 16 notes total
      instruments: [
        {
          id: 'test',
          category: 'kick',
          presetVariety: 'Kick',
          customName: 'Kick',
          notes: ['standard'], // Only 1 note
          velocities: [1.0],
        },
      ],
    };

    const result = migrateGrooveGrid(grid) as GrooveGrid;
    expect(result.instruments[0].notes).toHaveLength(16);
    expect(result.instruments[0].velocities).toHaveLength(16);
    expect(result.instruments[0].notes[0]).toBe('standard');
    expect(result.instruments[0].notes[1]).toBe('none');
  });

  it('skips migration for already migrated instruments with correct length', () => {
    const instrument = {
      id: 'fully-migrated',
      category: 'kick',
      presetVariety: 'Kick',
      customName: 'Kick',
      notes: new Array(16).fill('none'),
      velocities: new Array(16).fill(0),
    };

    const grid = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [instrument],
    };

    const result = migrateGrooveGrid(grid) as GrooveGrid;
    // Should return the exact object reference
    expect(result.instruments[0]).toBe(instrument);
  });

  it('re-migrates if lengths are wrong even if metadata exists', () => {
    const instrument = {
      id: 'partially-migrated',
      category: 'kick',
      presetVariety: 'Kick',
      customName: 'Kick',
      notes: ['standard'], // Wrong length
      velocities: [0.5],
    };

    const grid = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [instrument],
    };

    const result = migrateGrooveGrid(grid) as GrooveGrid;
    expect(result.instruments[0].notes).toHaveLength(16);
    expect(result.instruments[0].velocities).toHaveLength(16);
  });
});

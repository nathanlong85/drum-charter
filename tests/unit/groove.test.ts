import { describe, expect, it } from 'vitest';
import {
  calculateTotalNotes,
  createDefaultDrumInstruments,
  createInstrument,
  type GrooveGrid,
  getNextSymbol,
  getSymbolsForCategory,
  getVelocityForSymbol,
} from '@/lib/types/groove';

describe('groove utils', () => {
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
      const grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
        timeSignature: { beatsPerMeasure: 6, beatValue: 8 },
        resolution: 16,
        measures: 1,
      };
      expect(calculateTotalNotes(grid)).toBe(12);
    });
  });

  describe('createInstrument', () => {
    it('creates an instrument with correctly sized notes and velocities', () => {
      const grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
        timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
        resolution: 16,
        measures: 1,
      };
      const inst = createInstrument(grid, 'i1', 'snare', 'Snare', 'My Snare');
      expect(inst.id).toBe('i1');
      expect(inst.notes).toHaveLength(16);
      expect(inst.notes.every((n) => n === 'none')).toBe(true);
      expect(inst.velocities).toHaveLength(16);
      expect(inst.velocities!.every((v) => v === 0)).toBe(true);
    });
  });

  describe('createDefaultDrumInstruments', () => {
    it('creates the default set of instruments (kick, snare, hi-hat)', () => {
      const grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
        timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
        resolution: 16,
        measures: 1,
      };
      const instruments = createDefaultDrumInstruments(grid);
      expect(instruments).toHaveLength(3);
      expect(instruments[0].category).toBe('hi-hat');
      expect(instruments[1].category).toBe('snare');
      expect(instruments[2].category).toBe('kick');
    });
  });

  describe('getNextSymbol', () => {
    it('cycles symbols correctly', () => {
      expect(getNextSymbol('none')).toBe('standard');
      expect(getNextSymbol('standard')).toBe('accent');
      expect(getNextSymbol('accent')).toBe('ghost');
      expect(getNextSymbol('ghost')).toBe('none');
    });
  });

  describe('getSymbolsForCategory', () => {
    it('returns specific symbols for categories', () => {
      const snareSymbols = getSymbolsForCategory('snare');
      expect(snareSymbols).toContain('rim_shot');
      expect(snareSymbols).not.toContain('hi_hat_open');

      const hhSymbols = getSymbolsForCategory('hi-hat');
      expect(hhSymbols).toContain('hi_hat_open');
      expect(hhSymbols).toContain('standard'); // standard hi-hat
    });

    it('returns base symbols for unknown category', () => {
      // @ts-expect-error - testing fallback
      const misc = getSymbolsForCategory('invalid');
      expect(misc).toContain('standard');

      expect(misc).toHaveLength(7); // none, standard, standard_opt, accent, accent_opt, drag, drag_opt
    });
  });

  describe('getVelocityForSymbol', () => {
    it('returns correct velocities', () => {
      expect(getVelocityForSymbol('accent')).toBe(1.2);
      expect(getVelocityForSymbol('standard')).toBe(0.7);
      expect(getVelocityForSymbol('ghost')).toBe(0.2);
      expect(getVelocityForSymbol('none')).toBe(0);
      expect(getVelocityForSymbol('rim_shot')).toBe(1.2);
      expect(getVelocityForSymbol('hi_hat_closed_opt')).toBe(0.7);
    });
  });
});

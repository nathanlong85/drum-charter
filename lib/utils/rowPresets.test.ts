import { describe, expect, it } from 'vitest';
import type { DrumInstrument, GrooveGrid } from '../types/groove';
import { applyRowPreset, getFilteredPresets } from './rowPresets';

describe('applyRowPreset', () => {
  const mockGrid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
    resolution: 16,
    measures: 1,
  };

  const mockInstrument: DrumInstrument = {
    id: 'test-inst',
    category: 'hi-hat',
    presetVariety: 'Closed Hi-Hat',
    customName: 'Hi-Hat',
    notes: Array(16).fill('none'),
    velocities: Array(16).fill(0),
  };

  it('applies "all_on" preset', () => {
    const result = applyRowPreset(mockInstrument, 'all_on', mockGrid);
    expect(result.notes.every((n) => n === 'hi_hat_closed')).toBe(true);
  });

  it('applies "all_off" preset', () => {
    const result = applyRowPreset(
      { ...mockInstrument, notes: Array(16).fill('standard') },
      'all_off',
      mockGrid,
    );
    expect(result.notes.every((n) => n === 'none')).toBe(true);
  });

  it('applies "on_beats" preset (quarter notes)', () => {
    const result = applyRowPreset(mockInstrument, 'on_beats', mockGrid);
    // Notes at 0, 4, 8, 12 should be active
    const activeIndices = result.notes
      .map((n, i) => (n !== 'none' ? i : -1))
      .filter((i) => i !== -1);
    expect(activeIndices).toEqual([0, 4, 8, 12]);
  });

  it('applies "upbeats" preset (beats 2 and 4 in 4/4)', () => {
    const result = applyRowPreset(mockInstrument, 'upbeats', mockGrid);
    // Beats are at 0, 4, 8, 12. Upbeats are 4 and 12.
    const activeIndices = result.notes
      .map((n, i) => (n !== 'none' ? i : -1))
      .filter((i) => i !== -1);
    expect(activeIndices).toEqual([4, 12]);
  });

  it('applies "downbeats" preset (beats 1 and 3 in 4/4)', () => {
    const result = applyRowPreset(mockInstrument, 'downbeats', mockGrid);
    // Beats are at 0, 4, 8, 12. Downbeats are 0 and 8.
    const activeIndices = result.notes
      .map((n, i) => (n !== 'none' ? i : -1))
      .filter((i) => i !== -1);
    expect(activeIndices).toEqual([0, 8]);
  });

  it('applies "first_beat" preset', () => {
    const result = applyRowPreset(mockInstrument, 'first_beat', mockGrid);
    const activeIndices = result.notes
      .map((n, i) => (n !== 'none' ? i : -1))
      .filter((i) => i !== -1);
    expect(activeIndices).toEqual([0]);
  });

  it('toggles mute state', () => {
    const muted = applyRowPreset(mockInstrument, 'mute', mockGrid);
    expect(muted.muted).toBe(true);
    const unmuted = applyRowPreset(muted, 'mute', mockGrid);
    expect(unmuted.muted).toBe(false);
  });

  it('handles different time signatures (3/4)', () => {
    const grid34 = { ...mockGrid, timeSignature: { beatsPerMeasure: 3, beatValue: 4 } };
    const result = applyRowPreset(mockInstrument, 'on_beats', grid34);
    // Total notes = 3 * 4 = 12. Beats at 0, 4, 8.
    const activeIndices = result.notes
      .map((n, i) => (n !== 'none' ? i : -1))
      .filter((i) => i !== -1);
    expect(activeIndices).toEqual([0, 4, 8]);
  });

  it('handles 2/4 time signature', () => {
    const grid24 = { ...mockGrid, timeSignature: { beatsPerMeasure: 2, beatValue: 4 } };
    const result = applyRowPreset(mockInstrument, 'upbeats', grid24);
    // Beats at 0, 4. Upbeat is 4.
    const activeIndices = result.notes
      .map((n, i) => (n !== 'none' ? i : -1))
      .filter((i) => i !== -1);
    expect(activeIndices).toEqual([4]);
  });

  it('handles 6/8 compound time signature', () => {
    const grid68 = {
      timeSignature: { beatsPerMeasure: 6, beatValue: 8 },
      resolution: 16 as const,
      measures: 1,
    };
    // 16th resolution in 6/8 means 2 notes per 8th note.
    // Total notes = 6 * 2 = 12.
    // Pulses (On-Beats) should be 1 and 4.
    // Pulse 1 = Index 0. Pulse 4 = Index 6 (3 beats * 2 notes/beat).

    const onBeats = applyRowPreset(mockInstrument, 'on_beats', grid68);
    const onIndices = onBeats.notes.map((n, i) => (n !== 'none' ? i : -1)).filter((i) => i !== -1);
    expect(onIndices).toEqual([0, 6]);

    const downbeats = applyRowPreset(mockInstrument, 'downbeats', grid68);
    const downIndices = downbeats.notes
      .map((n, i) => (n !== 'none' ? i : -1))
      .filter((i) => i !== -1);
    expect(downIndices).toEqual([0]);

    const upbeats = applyRowPreset(mockInstrument, 'upbeats', grid68);
    const upIndices = upbeats.notes.map((n, i) => (n !== 'none' ? i : -1)).filter((i) => i !== -1);
    expect(upIndices).toEqual([6]);
  });
});

describe('getFilteredPresets', () => {
  it('returns all presets for 4/4', () => {
    const presets = getFilteredPresets('hi-hat', { beatsPerMeasure: 4, beatValue: 4 });
    const ids = presets.map((p) => p.id);
    expect(ids).toContain('upbeats');
    expect(ids).toContain('on_beats');
  });

  it('returns only non-time-dependent presets for 5/4', () => {
    const presets = getFilteredPresets('hi-hat', { beatsPerMeasure: 5, beatValue: 4 });
    const ids = presets.map((p) => p.id);
    expect(ids).not.toContain('upbeats');
    expect(ids).not.toContain('on_beats');
    expect(ids).toContain('all_on');
    expect(ids).toContain('all_off');
    expect(ids).toContain('mute');
  });
});

import {
  calculateTotalNotes,
  type DrumCategory,
  type DrumInstrument,
  type DrumSymbol,
  type GrooveGrid,
  getVelocityForSymbol,
} from '../../types/groove';
import { generateId } from '../../utils/id';

/**
 * Migration helper to transition old InstrumentGrid data to DrumInstrument (#27).
 */
export function migrateGrooveGrid(grid: unknown): GrooveGrid | undefined {
  if (!grid || typeof grid !== 'object') return undefined;

  const gridObj = grid as Record<string, unknown>;

  if (
    !gridObj.timeSignature ||
    typeof gridObj.timeSignature !== 'object' ||
    !('beatsPerMeasure' in (gridObj.timeSignature as object)) ||
    typeof gridObj.resolution !== 'number' ||
    typeof gridObj.measures !== 'number'
  ) {
    return undefined;
  }

  if (!Array.isArray(gridObj.instruments)) {
    return undefined;
  }

  const targetLength = calculateTotalNotes(gridObj as unknown as GrooveGrid);

  const instruments = gridObj.instruments.map((instUnknown) => {
    if (!instUnknown || typeof instUnknown !== 'object') {
      return {
        id: generateId(),
        category: 'misc',
        presetVariety: 'Misc',
        customName: 'Misc',
        notes: Array(targetLength).fill('none'),
        velocities: Array(targetLength).fill(0),
      } as DrumInstrument;
    }
    const inst = instUnknown as Record<string, unknown>;
    if (
      inst.category &&
      inst.id &&
      inst.presetVariety &&
      (inst.notes as unknown[])?.length === targetLength &&
      (inst.velocities as unknown[])?.length === targetLength
    ) {
      return inst as unknown as DrumInstrument;
    }

    const instrumentId = String(inst.instrumentId || '').toLowerCase();
    const label = String(inst.label || '');

    let category: DrumCategory = 'misc';
    let presetVariety = 'Misc';

    if (
      instrumentId.includes('kick') ||
      instrumentId.includes('bd') ||
      instrumentId.includes('bass')
    ) {
      category = 'kick';
      presetVariety = 'Kick';
    } else if (instrumentId.includes('snare') || instrumentId.includes('sn')) {
      category = 'snare';
      presetVariety = 'Snare';
    } else if (
      instrumentId.includes('hi_hat') ||
      instrumentId.includes('hh') ||
      instrumentId.includes('hat')
    ) {
      category = 'hi-hat';
      presetVariety = 'Hi-Hat';
    } else if (instrumentId.includes('ride')) {
      category = 'ride';
      presetVariety = 'Ride';
    } else if (instrumentId.includes('crash')) {
      category = 'crash';
      presetVariety = 'Crash';
    } else if (instrumentId.includes('tom')) {
      category = 'tom';
      if (instrumentId.includes('high')) presetVariety = 'High Tom';
      else if (instrumentId.includes('mid')) presetVariety = 'Mid Tom';
      else if (instrumentId.includes('floor')) presetVariety = 'Floor Tom';
      else presetVariety = 'Mid Tom';
    }

    const notes = Array(targetLength).fill('none') as DrumSymbol[];
    for (let i = 0; i < Math.min(targetLength, ((inst.notes as DrumSymbol[]) || []).length); i++) {
      notes[i] = (inst.notes as DrumSymbol[])[i];
    }

    const velocities = Array(targetLength).fill(0);
    for (let i = 0; i < targetLength; i++) {
      if (inst.velocities && (inst.velocities as number[])[i] !== undefined) {
        velocities[i] = (inst.velocities as number[])[i];
      } else {
        velocities[i] = getVelocityForSymbol(notes[i]);
      }
    }

    return {
      id: String(inst.id || inst.instrumentId || generateId()),
      category,
      presetVariety,
      customName: label || presetVariety,
      notes,
      velocities,
    } as DrumInstrument;
  });

  return {
    ...(gridObj as unknown as GrooveGrid),
    instruments,
  };
}

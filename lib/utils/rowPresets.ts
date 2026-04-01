import {
  calculateTotalNotes,
  type DrumCategory,
  type DrumInstrument,
  type DrumSymbol,
  type GrooveGrid,
  getVelocityForSymbol,
} from '../types/groove';

export type RowPreset =
  | 'all_on'
  | 'all_off'
  | 'on_beats'
  | 'upbeats'
  | 'downbeats'
  | 'first_beat'
  | 'mute';

export interface PresetOption {
  id: RowPreset;
  label: string;
}

const BASE_PRESETS: PresetOption[] = [
  { id: 'all_on', label: 'All On' },
  { id: 'all_off', label: 'All Off' },
  { id: 'on_beats', label: 'On-Beats' },
  { id: 'mute', label: 'Mute' },
];

const BEAT_PRESETS: PresetOption[] = [
  ...BASE_PRESETS,
  { id: 'upbeats', label: 'Upbeats' },
  { id: 'downbeats', label: 'Downbeats' },
];

/**
 * Mapping of drum categories to their available presets.
 */
export const CATEGORY_PRESETS: Record<DrumCategory, PresetOption[]> = {
  kick: BASE_PRESETS,
  snare: BASE_PRESETS,
  tom: BASE_PRESETS,
  crash: [...BASE_PRESETS, { id: 'first_beat', label: 'First Beat' }],
  ride: BEAT_PRESETS,
  'hi-hat': BEAT_PRESETS,
  misc: BASE_PRESETS,
};

/**
 * Returns a list of presets filtered by time signature compatibility.
 */
export function getFilteredPresets(
  category: DrumCategory,
  timeSignature: { beatsPerMeasure: number; beatValue: number },
): PresetOption[] {
  const allPresets = CATEGORY_PRESETS[category] || BASE_PRESETS;

  const isSupported =
    (timeSignature.beatsPerMeasure === 4 && timeSignature.beatValue === 4) ||
    (timeSignature.beatsPerMeasure === 2 && timeSignature.beatValue === 4) ||
    (timeSignature.beatsPerMeasure === 3 && timeSignature.beatValue === 4) ||
    (timeSignature.beatsPerMeasure === 6 && timeSignature.beatValue === 8);

  if (isSupported) return allPresets;

  // For unsupported time signatures, only show non-time-dependent presets
  return allPresets.filter((p) => ['all_on', 'all_off', 'mute', 'first_beat'].includes(p.id));
}

/**
 * Determines the best active symbol to use for a category when applying a preset.
 */
function getActiveSymbolForCategory(category: DrumCategory): DrumSymbol {
  switch (category) {
    case 'hi-hat':
      return 'hi_hat_closed';
    case 'snare':
      return 'standard';
    case 'kick':
      return 'standard';
    default:
      return 'standard';
  }
}

/**
 * Applies a specific preset to an instrument's notes and velocities.
 * Returns a new instrument object with the updated data.
 */
export function applyRowPreset(
  instrument: DrumInstrument,
  preset: RowPreset,
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>,
): DrumInstrument {
  const totalNotes = calculateTotalNotes(grid);
  const { timeSignature, resolution } = grid;

  const is68 = timeSignature.beatsPerMeasure === 6 && timeSignature.beatValue === 8;

  // Calculate indices for patterns
  const notesPerBeat = resolution / timeSignature.beatValue; // e.g., 4 for 16th notes in 4/4, 2 for 16th notes in 6/8

  // Create new arrays
  const newNotes: DrumSymbol[] = [...instrument.notes];
  let newMuted = instrument.muted;

  if (preset === 'mute') {
    newMuted = !newMuted;
  } else {
    const activeSymbol = getActiveSymbolForCategory(instrument.category);

    for (let i = 0; i < totalNotes; i++) {
      let active = false;
      const noteInBeat = i % notesPerBeat;
      const beatInMeasure = Math.floor(i / notesPerBeat) % timeSignature.beatsPerMeasure;

      // Special handling for 6/8 (compound time)
      // In 6/8, "On-Beats" are typically the two dotted quarter pulses (Beats 1 and 4)
      if (is68) {
        switch (preset) {
          case 'all_on':
            active = true;
            break;
          case 'all_off':
            active = false;
            break;
          case 'on_beats':
            // Beats 1 and 4
            active = noteInBeat === 0 && (beatInMeasure === 0 || beatInMeasure === 3);
            break;
          case 'downbeats':
            // Beat 1 only
            active = noteInBeat === 0 && beatInMeasure === 0;
            break;
          case 'upbeats':
            // Beat 4 only
            active = noteInBeat === 0 && beatInMeasure === 3;
            break;
          case 'first_beat':
            active = i === 0;
            break;
        }
      } else {
        // Standard Simple Time (4/4, 3/4, etc.)
        switch (preset) {
          case 'all_on':
            active = true;
            break;
          case 'all_off':
            active = false;
            break;
          case 'on_beats':
            active = noteInBeat === 0;
            break;
          case 'downbeats':
            active = noteInBeat === 0 && beatInMeasure % 2 === 0;
            break;
          case 'upbeats':
            active = noteInBeat === 0 && beatInMeasure % 2 !== 0;
            break;
          case 'first_beat':
            active = i === 0;
            break;
        }
      }

      newNotes[i] = active ? activeSymbol : 'none';
    }
  }

  const newVelocities = newNotes.map((n) => getVelocityForSymbol(n));

  return {
    ...instrument,
    notes: newNotes,
    velocities: newVelocities,
    muted: newMuted,
  };
}

/**
 * Supported drum categories for grouping and symbol filtering.
 */
export type DrumCategory = 'kick' | 'snare' | 'tom' | 'crash' | 'ride' | 'hi-hat' | 'misc';

/**
 * Supported drum hit types (symbols).
 * We can expand this as we integrate the spreadsheet of symbols.
 */
export type DrumSymbol =
  // Standard (Required) hits
  | 'standard'
  | 'standard_opt'
  | 'ghost'
  | 'ghost_opt'
  | 'accent'
  | 'accent_opt'
  | 'buzz'
  | 'buzz_opt'
  | 'cross_stick'
  | 'cross_stick_opt'
  | 'cymbal_bell'
  | 'cymbal_bell_opt'
  | 'cymbal_choke'
  | 'cymbal_choke_opt'
  | 'double'
  | 'double_opt'
  | 'flam'
  | 'flam_opt'
  | 'hi_hat_closed'
  | 'hi_hat_closed_opt'
  | 'hi_hat_loose'
  | 'hi_hat_loose_opt'
  | 'hi_hat_open'
  | 'hi_hat_open_opt'
  | 'hi_hat_pedal_chick'
  | 'hi_hat_pedal_chick_opt'
  | 'rim_shot'
  | 'rim_shot_opt'
  | 'none';

/**
 * Beat resolution options for the grid.
 * 4 = Quarter notes
 * 8 = 8th notes
 * 16 = 16th notes
 */
export type BeatResolution = 4 | 8 | 16;

/**
 * Time signature representation.
 */
export interface TimeSignature {
  beatsPerMeasure: number; // e.g., 4
  beatValue: number; // e.g., 4 for 4/4
}

/**
 * Represents a single instrument's sequence in the grid.
 * Transitioned from InstrumentGrid to DrumInstrument (#27).
 */
export interface DrumInstrument {
  id: string; // Unique UUID for the track/row
  category: DrumCategory;
  presetVariety: string; // The specific sample set (e.g. "Floor Tom")
  customName: string; // User-defined label
  /**
   * notes array length = (beatsPerMeasure * (resolution / beatValue)) * measures
   * For 4/4 at 16th resolution, 1 measure: (4 * (16 / 4)) * 1 = 16 notes.
   */
  notes: DrumSymbol[];
  /**
   * Velocities for each note (typically 0-1.0, but can go up to 1.2 for accents).
   */
  velocities?: number[];
}

/**
 * Helper to create a single instrument with correctly sized and optionally initialized arrays.
 */
export function createInstrument(
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>,
  id: string,
  category: DrumCategory,
  presetVariety: string,
  customName: string,
  initialNote?: DrumSymbol,
): DrumInstrument {
  const totalNotes = calculateTotalNotes(grid);
  const notes = Array(totalNotes).fill(initialNote || 'none');
  const velocities = notes.map((n) => getVelocityForSymbol(n));

  return {
    id,
    category,
    presetVariety,
    customName,
    notes,
    velocities,
  };
}

/**
 * Helper to create a standard set of instruments for a new grid.
 */
export function createDefaultDrumInstruments(
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>,
): DrumInstrument[] {
  return [
    createInstrument(grid, 'hihat', 'hi-hat', 'Hi-Hat', 'Hi-Hat'),
    createInstrument(grid, 'snare', 'snare', 'Snare', 'Snare'),
    createInstrument(grid, 'kick', 'kick', 'Kick', 'Kick'),
  ];
}

/**
 * The core grid data. This can be used as a standalone "one-off" grid
 * in a song chart or practice exercise.
 */
export interface GrooveGrid {
  timeSignature: TimeSignature;
  resolution: BeatResolution;
  measures: number;
  instruments: DrumInstrument[];
  playbackOptionalHits?: boolean; // Toggle for practicing without "extra" hits
}

/**
 * A reusable groove snippet, includes metadata for the library.
 */
export interface GrooveSnippet extends GrooveGrid {
  id: string;
  title: string;
  tags: string[];
  bpm?: number;
  userId?: string;
  isPublic: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Represents a section of a notebook (more flexible than SongSection).
 */
export interface NotebookSection {
  id: string;
  name: string;
  grid?: GrooveGrid;
  notes?: string[];
  bpm?: number;
}

/**
 * A notebook for ideas, sketches, and practice routines.
 */
export interface Notebook {
  id: string;
  title: string;
  sections: NotebookSection[];
  tags: string[];
  userId?: string;
  isPublic: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Represents a section of a song (e.g., "Chorus").
 */
export interface SongSection {
  id: string;
  name: string;
  measuresCount: number; // e.g., 6 for "Chorus (6M)"
  grid?: GrooveGrid;
  notes?: string[]; // Bullet points
  subSections?: SongSubSection[];
}

/**
 * Represents a sub-section within a song section.
 */
export interface SongSubSection {
  id: string;
  name: string;
  measuresCount: number;
  grid?: GrooveGrid;
  notes?: string[];
}

/**
 * A full song chart document.
 */
export interface SongChart {
  id: string;
  header: {
    title: string;
    bpm?: number;
    timeSignature: TimeSignature;
    metronomeEnabled: boolean;
    metronomeVolume: number;
  };
  sections: SongSection[];
  tags: string[];
  userId?: string;
  isPublic: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Helper to calculate total notes in a grid for an instrument.
 */
export function calculateTotalNotes(
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>,
): number {
  const { timeSignature, resolution, measures } = grid;
  // Formula: (beatsPerMeasure * (resolution / beatValue)) * measures
  return timeSignature.beatsPerMeasure * (resolution / timeSignature.beatValue) * measures;
}

/**
 * Returns the default velocity for a given drum symbol.
 * Reference: Multi-layer Velocity Support (#3)
 */
export function getVelocityForSymbol(symbol: DrumSymbol): number {
  if (symbol.includes('accent') || symbol.includes('rim_shot')) return 1.2;
  if (symbol.includes('ghost')) return 0.2;
  if (symbol === 'none') return 0;
  return 0.7; // Standard
}

/**
 * Returns the next symbol in the cycle for a basic click toggle.
 */
export function getNextSymbol(current: string): DrumSymbol {
  const nextMap: Record<string, DrumSymbol> = {
    none: 'standard',
    standard: 'accent',
    accent: 'ghost',
    ghost: 'none',
  };
  return nextMap[current] || 'none';
}

/**
 * Provides a list of applicable symbols for a given drum category.
 * Used for SymbolPicker filtering (#29).
 */
export function getSymbolsForCategory(category: DrumCategory): DrumSymbol[] {
  const baseSymbols: DrumSymbol[] = ['none', 'standard', 'standard_opt', 'accent', 'accent_opt'];

  switch (category) {
    case 'kick':
      return baseSymbols;
    case 'snare':
      return [
        ...baseSymbols,
        'buzz',
        'buzz_opt',
        'cross_stick',
        'cross_stick_opt',
        'rim_shot',
        'rim_shot_opt',
        'ghost',
        'ghost_opt',
        'double',
        'double_opt',
        'flam',
        'flam_opt',
      ];
    case 'tom':
    case 'misc':
      return [...baseSymbols, 'ghost', 'ghost_opt', 'double', 'double_opt', 'flam', 'flam_opt'];
    case 'crash':
    case 'ride':
      return [
        ...baseSymbols,
        'ghost',
        'ghost_opt',
        'double',
        'double_opt',
        'flam',
        'flam_opt',
        'cymbal_bell',
        'cymbal_bell_opt',
        'cymbal_choke',
        'cymbal_choke_opt',
      ];
    case 'hi-hat':
      return [
        'none',
        'standard',
        'standard_opt',
        'hi_hat_closed',
        'hi_hat_closed_opt',
        'hi_hat_loose',
        'hi_hat_loose_opt',
        'hi_hat_open',
        'hi_hat_open_opt',
        'hi_hat_pedal_chick',
        'hi_hat_pedal_chick_opt',
        'accent',
        'accent_opt',
      ];
    default:
      return baseSymbols;
  }
}

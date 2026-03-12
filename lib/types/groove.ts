/**
 * Supported drum hit types (symbols).
 * We can expand this as we integrate the spreadsheet of symbols.
 */
export type DrumSymbol =
  // Standard (Required) hits
  | 'standard' | 'standard_opt'
  | 'ghost' | 'ghost_opt'
  | 'accent' | 'accent_opt'
  | 'buzz' | 'buzz_opt'
  | 'cross_stick' | 'cross_stick_opt'
  | 'cymbal_bell' | 'cymbal_bell_opt'
  | 'cymbal_choke' | 'cymbal_choke_opt'
  | 'double' | 'double_opt'
  | 'flam' | 'flam_opt'
  | 'hi_hat_closed' | 'hi_hat_closed_opt'
  | 'hi_hat_loose' | 'hi_hat_loose_opt'
  | 'hi_hat_open' | 'hi_hat_open_opt'
  | 'hi_hat_pedal_chick' | 'hi_hat_pedal_chick_opt'
  | 'rim_shot' | 'rim_shot_opt'
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
 */
export interface InstrumentGrid {
  instrumentId: string;
  label: string;
  /**
   * notes array length = (beatsPerMeasure * (resolution / beatValue)) * measures
   * For 4/4 at 16th resolution, 1 measure: (4 * (16 / 4)) * 1 = 16 notes.
   */
  notes: DrumSymbol[];
  /**
   * Optional velocities for each note (0-1).
   * If not provided, defaults to 1.0 (accent), 0.7 (standard), or 0.3 (ghost) based on symbol.
   */
  velocities?: number[];
}

/**
 * The core grid data. This can be used as a standalone "one-off" grid
 * in a song chart or practice exercise.
 */
export interface GrooveGrid {
  timeSignature: TimeSignature;
  resolution: BeatResolution;
  measures: number;
  instruments: InstrumentGrid[];
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Helper to calculate total notes in a grid for an instrument.
 */
export function calculateTotalNotes(
  grid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'>,
): number {
  const { timeSignature, resolution, measures } = grid;
  // Formula: (beatsPerMeasure * (resolution / beatValue)) * measures
  return (timeSignature.beatsPerMeasure * (resolution / timeSignature.beatValue)) * measures;
}

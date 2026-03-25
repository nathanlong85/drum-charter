export const VALID_BEAT_VALUES = [2, 4, 8, 16] as const;
export type ValidBeatValue = (typeof VALID_BEAT_VALUES)[number];

export const MAX_BEATS_PER_MEASURE = 32;
export const MIN_BEATS_PER_MEASURE = 1;

export const DEFAULT_BPM = 120;
export const MIN_BPM = 40;
export const MAX_BPM = 300;

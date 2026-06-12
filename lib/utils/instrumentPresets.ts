import type { DrumCategory } from '@/lib/types/groove';

export const PRESET_VARIETIES: Record<DrumCategory, [string, ...string[]]> = {
  kick: ['Kick'],
  snare: ['Snare'],
  'hi-hat': ['Hi-Hat'],
  tom: ['High Tom', 'Mid Tom', 'Floor Tom'],
  crash: ['Crash'],
  ride: ['Ride'],
  misc: ['Misc'],
};

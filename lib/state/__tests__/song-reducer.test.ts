import { describe, expect, it } from 'vitest';
import type { SongChart } from '../../types/groove';
import { songReducer } from '../song-reducer';

const baseSong: SongChart = {
  id: 'song-1',
  userId: 'user-1',
  tags: [],
  isPublic: false,
  createdAt: null,
  updatedAt: null,
  header: {
    title: 'Test',
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
    metronomeEnabled: false,
    metronomeVolume: 0.5,
  },
  sections: [],
};

describe('songReducer', () => {
  it('updates title', () => {
    const next = songReducer(baseSong, { type: 'UPDATE_TITLE', title: 'Renamed' });
    expect(next.header.title).toBe('Renamed');
    expect(next.updatedAt).toBeTruthy();
  });

  it('toggles public', () => {
    const next = songReducer(baseSong, { type: 'TOGGLE_PUBLIC' });
    expect(next.isPublic).toBe(true);
  });

  it('adds a section', () => {
    const next = songReducer(baseSong, { type: 'ADD_SECTION' });
    expect(next.sections).toHaveLength(1);
    expect(next.sections[0].name).toBe('New Section');
  });

  it('removes a section', () => {
    const withSection = songReducer(baseSong, { type: 'ADD_SECTION' });
    const sectionId = withSection.sections[0].id;
    const next = songReducer(withSection, { type: 'REMOVE_SECTION', sectionId });
    expect(next.sections).toHaveLength(0);
  });

  it('updates BPM', () => {
    const next = songReducer(baseSong, { type: 'UPDATE_BPM', bpm: 140 });
    expect(next.header.bpm).toBe(140);
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { SongChart } from '@/lib/types/groove';
import SongEditor from '../SongEditor';

// Mock Supabase service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: vi.fn().mockResolvedValue({}),
  },
}));

// Mock crypto.randomUUID
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => 'test-uuid' as any;
}

const mockSong: SongChart = {
  id: 'song-1',
  userId: 'user-1',
  header: {
    title: 'Test Song',
    bpm: 120,
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
    metronomeEnabled: false,
    metronomeVolume: 0.5,
  },
  sections: [
    {
      id: 'section-1',
      name: 'Verse',
      measuresCount: 8,
      notes: ['Play softly'],
    },
  ],
  tags: ['rock'],
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('SongEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the song title and BPM', () => {
    render(<SongEditor initialSong={mockSong} />);
    expect(screen.getByDisplayValue('Test Song')).toBeDefined();
    expect(screen.getByDisplayValue('120')).toBeDefined();
  });

  it('updates the title and triggers auto-save', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const titleInput = screen.getByDisplayValue('Test Song');

    fireEvent.change(titleInput, { target: { value: 'Updated Song Title' } });

    expect(screen.getByDisplayValue('Updated Song Title')).toBeDefined();

    // Wait for debounce (2000ms)
    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('adds a new section', () => {
    render(<SongEditor initialSong={mockSong} />);
    const addButton = screen.getByText(/Add New Section/i);

    fireEvent.click(addButton);

    expect(screen.getByDisplayValue('New Section')).toBeDefined();
  });

  it('removes a section', () => {
    render(<SongEditor initialSong={mockSong} />);
    // Find the remove button (using the title we added in the SVG)
    const removeButton = screen.getByTitle('Remove Section');

    fireEvent.click(removeButton);

    expect(screen.queryByDisplayValue('Verse')).toBeNull();
  });

  it('updates BPM', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const bpmInput = screen.getByDisplayValue('120');

    fireEvent.change(bpmInput, { target: { value: '140' } });

    expect(screen.getByDisplayValue('140')).toBeDefined();

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            header: expect.objectContaining({ bpm: 140 }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('adds a tag on Enter', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const tagInput = screen.getByPlaceholderText('Add tag...');

    fireEvent.change(tagInput, { target: { value: 'jazz' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('#jazz')).toBeDefined();

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: expect.arrayContaining(['rock', 'jazz']),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('updates metronome enabled status', async () => {
    render(<SongEditor initialSong={mockSong} />);

    // Add grid first to make metronome controls available
    const addGridButton = screen.getByText('+ ADD GRID');
    fireEvent.click(addGridButton);

    // Find metronome toggle (it's a button with aria-label)
    const toggle = screen.getByLabelText('Enable Metronome');
    fireEvent.click(toggle);

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            header: expect.objectContaining({ metronomeEnabled: true }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('updates metronome volume', async () => {
    render(<SongEditor initialSong={mockSong} />);

    // Add grid first
    const addGridButton = screen.getByText('+ ADD GRID');
    fireEvent.click(addGridButton);

    // Open metronome settings
    const settingsButton = screen.getByLabelText('Metronome Settings');
    fireEvent.click(settingsButton);

    // Find volume slider
    const slider = screen.getByTestId('metronome-volume-slider');
    fireEvent.change(slider, { target: { value: '0.8' } });

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            header: expect.objectContaining({ metronomeVolume: 0.8 }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });
});

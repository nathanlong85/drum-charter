import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { SongChart } from '@/lib/types/groove';
import SongEditor from '../SongEditor';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: vi.fn().mockResolvedValue({}),
    duplicateSongChart: vi.fn().mockResolvedValue({ id: 'song-2' }),
    deleteSongChart: vi.fn().mockResolvedValue({}),
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

    // Add grid first
    const addGridButton = screen.getByText('+ ADD GRID');
    fireEvent.click(addGridButton);

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

    const settingsButton = screen.getByLabelText('Metronome Settings');
    fireEvent.click(settingsButton);

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

  it('duplicates the song', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const duplicateBtn = screen.getByText(/duplicate/i);
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabaseService.duplicateSongChart).toHaveBeenCalledWith('song-1');
      expect(mockPush).toHaveBeenCalledWith('/songs/song-2');
    });
  });

  it('copies public link to clipboard', async () => {
    const publicSong = { ...mockSong, isPublic: true };
    render(<SongEditor initialSong={publicSong} />);

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const copyBtn = screen.getByText(/COPY PUBLIC LINK/i);
    fireEvent.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/public/songs/song-1'));
  });

  it('views public song', () => {
    const publicSong = { ...mockSong, isPublic: true };
    render(<SongEditor initialSong={publicSong} />);

    const viewBtn = screen.getByText(/VIEW PUBLIC/i);
    expect(viewBtn).toHaveAttribute('href', '/public/songs/song-1');
  });

  it('adds and removes sub-sections', () => {
    render(<SongEditor initialSong={mockSong} />);
    const addSubBtn = screen.getByText(/\+ ADD SUBSECTION/i);
    fireEvent.click(addSubBtn);

    expect(screen.getByDisplayValue('New Subsection')).toBeDefined();

    const subSectionRemove = screen
      .getAllByRole('button')
      .find((b) => b.innerHTML.includes('M6 18L18 6M6 6l12 12'));
    if (subSectionRemove) fireEvent.click(subSectionRemove);

    expect(screen.queryByDisplayValue('New Subsection')).toBeNull();
  });

  it('toggles public state', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const toggleBtn = screen.getByText(/PRIVATE/);
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/● PUBLIC/)).toBeDefined();
    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({ isPublic: true }),
        );
      },
      { timeout: 4000 },
    );
  });

  it('updates section name and measures', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const nameInput = screen.getByDisplayValue('Verse');
    fireEvent.change(nameInput, { target: { value: 'Chorus' } });

    const measuresInput = screen.getByDisplayValue('8');
    fireEvent.change(measuresInput, { target: { value: '4' } });

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: expect.arrayContaining([
              expect.objectContaining({ name: 'Chorus', measuresCount: 4 }),
            ]),
          }),
        );
      },
      { timeout: 4000 },
    );
  });

  it('updates notes in a section', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const notesArea = screen.getByDisplayValue('Play softly');
    fireEvent.change(notesArea, { target: { value: 'Play loudly\nFast' } });

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: expect.arrayContaining([
              expect.objectContaining({ notes: ['Play loudly', 'Fast'] }),
            ]),
          }),
        );
      },
      { timeout: 4000 },
    );
  });

  it('adds a grid to a section', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const addGridBtn = screen.getByText(/\+ ADD GRID/i);
    fireEvent.click(addGridBtn);

    await waitFor(
      () => {
        expect(screen.getByTestId('groove-grid')).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it('updates a grid within a section', async () => {
    const songWithGrid = { ...mockSong };
    songWithGrid.sections[0].grid = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [],
    };
    render(<SongEditor initialSong={songWithGrid} />);

    const incMeasures = screen.getByTitle('Increase measures');
    fireEvent.click(incMeasures);

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: expect.arrayContaining([
              expect.objectContaining({
                grid: expect.objectContaining({ measures: 2 }),
              }),
            ]),
          }),
        );
      },
      { timeout: 4000 },
    );
  });

  it('handles subsection grid updates', async () => {
    const songWithSub = { ...mockSong };
    songWithSub.sections[0].subSections = [
      {
        id: 'sub-1',
        name: 'Fill',
        measuresCount: 1,
        notes: [],
        grid: {
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
          resolution: 16,
          measures: 1,
          instruments: [],
        },
      },
    ];
    render(<SongEditor initialSong={songWithSub} />);

    // Find the subsection container - it's the one containing the "Fill" input
    const subSectionInput = screen.getByDisplayValue('Fill');
    const subSectionContainer = subSectionInput.closest('div')?.parentElement;
    if (!subSectionContainer) throw new Error('Subsection container not found');

    const incMeasures = within(subSectionContainer).getByTitle('Increase measures');
    fireEvent.click(incMeasures);

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: expect.arrayContaining([
              expect.objectContaining({
                subSections: expect.arrayContaining([
                  expect.objectContaining({
                    grid: expect.objectContaining({ measures: 2 }),
                  }),
                ]),
              }),
            ]),
          }),
        );
      },
      { timeout: 4000 },
    );
  });

  it('handles error during duplication', async () => {
    supabaseService.duplicateSongChart = vi.fn().mockRejectedValue(new Error('Fail'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SongEditor initialSong={mockSong} />);
    fireEvent.click(screen.getByText(/duplicate/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to duplicate song chart.');
    });
  });

  it('handles error during deletion', async () => {
    supabaseService.deleteSongChart = vi.fn().mockRejectedValue(new Error('Fail'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<SongEditor initialSong={mockSong} />);
    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete song chart.');
    });
  });

  it('handles auto-save error gracefully', async () => {
    supabaseService.saveSongChart = vi.fn().mockRejectedValue(new Error('Fail'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SongEditor initialSong={mockSong} />);
    fireEvent.change(screen.getByDisplayValue('Test Song'), { target: { value: 'New' } });

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to auto-save song chart:',
          expect.anything(),
        );
      },
      { timeout: 4000 },
    );
  });

  it('removes a subsection from a section', async () => {
    const songWithSub = { ...mockSong };
    songWithSub.sections[0].subSections = [
      {
        id: 'sub-1',
        name: 'Fill',
        measuresCount: 1,
        notes: [],
      },
    ];
    render(<SongEditor initialSong={songWithSub} />);

    // Find specifically the remove button for the subsection
    // The main section remove is "Remove Section" title
    const removeBtns = screen
      .getAllByRole('button')
      .filter((b) => b.innerHTML.includes('M6 18L18 6M6 6l12 12'));
    fireEvent.click(removeBtns[0]);

    expect(screen.queryByDisplayValue('Fill')).toBeNull();
  });

  it('does not attempt to update state if unmounted during save', async () => {
    vi.useFakeTimers();
    try {
      const saveSpy = vi.fn().mockResolvedValue({});
      supabaseService.saveSongChart = saveSpy;

      // Use a more indirect way to check for state updates since we can't easily spy on internal useState
      // We'll verify that no additional save calls happen after the unmount.
      const { unmount } = render(<SongEditor initialSong={mockSong} />);

      fireEvent.change(screen.getByDisplayValue('Test Song'), {
        target: { value: 'Unmounted Update' },
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Verify save was NOT called
      expect(saveSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

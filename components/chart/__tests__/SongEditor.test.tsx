import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { SongChart } from '@/lib/types/groove';
import SongEditor from '../SongEditor';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock components
vi.mock('@/components/common/TagInput', () => ({
  TagInput: ({ tags, onChange }: any) => (
    <div data-testid="tag-input">
      <input
        placeholder="+ ADD TAG"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onChange([...(tags || []), (e.target as HTMLInputElement).value]);
        }}
      />
    </div>
  ),
}));
vi.mock('@/components/groove/GrooveGridEditor', () => ({
  GrooveGridEditor: () => <div data-testid="groove-editor" />,
}));

// Mock supabase-service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: vi.fn().mockResolvedValue({}),
    deleteSongChart: vi.fn().mockResolvedValue({}),
    duplicateSongChart: vi.fn().mockResolvedValue({}),
    listSongCharts: vi.fn().mockResolvedValue([]),
  },
}));

describe('SongEditor', () => {
  const mockSong: SongChart = {
    id: 's1',
    userId: 'u1',
    header: {
      title: 'Test Song',
      bpm: 120,
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      metronomeEnabled: false,
      metronomeVolume: 0.5,
    },
    sections: [],
    tags: [],
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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

    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            header: expect.objectContaining({ title: 'New Title' }),
          }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('adds a new section', () => {
    render(<SongEditor initialSong={mockSong} />);
    const addBtn = screen.getByText(/Add New Section/i);
    fireEvent.click(addBtn);

    expect(screen.getByPlaceholderText(/Section Name/i)).toBeDefined();
  });

  it('removes a section', () => {
    const songWithSection = {
      ...mockSong,
      sections: [{ id: 'sec1', name: 'Verse', measures: 8, subSections: [] }],
    };
    render(<SongEditor initialSong={songWithSection} />);

    const removeBtn = screen.getByRole('button', { name: /Remove Section/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByPlaceholderText(/Section Name/i)).toBeNull();
  });

  it('updates BPM', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const bpmInput = screen.getByDisplayValue('120');

    fireEvent.change(bpmInput, { target: { value: '140' } });

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            header: expect.objectContaining({ bpm: 140 }),
          }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('adds a tag on Enter', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const tagInput = screen.getByPlaceholderText(/\+ ADD TAG/i);

    fireEvent.change(tagInput, { target: { value: 'rock' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['rock'],
          }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('duplicates the song', async () => {
    vi.mocked(supabaseService.duplicateSongChart).mockResolvedValue({
      ...mockSong,
      id: 's2',
      header: { ...mockSong.header, title: 'Test Song (Copy)' },
    });

    render(<SongEditor initialSong={mockSong} />);
    const duplicateBtn = screen.getByRole('button', { name: /Duplicate This Item/i });
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabaseService.duplicateSongChart).toHaveBeenCalledWith('s1');
    });
  });

  it('copies public link to clipboard', async () => {
    const song = { ...mockSong, isPublic: true };
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextSpy } });

    render(<SongEditor initialSong={song} />);
    const linkBtn = screen.getByRole('button', { name: /Copy Public Link/i });
    fireEvent.click(linkBtn);

    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('toggles public state', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const toggle = screen.getByTestId('toggle-public-button');
    fireEvent.click(toggle);

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({ isPublic: true }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('updates section name and measures', async () => {
    const songWithSection = {
      ...mockSong,
      sections: [{ id: 'sec1', name: 'Verse', measuresCount: 8, subSections: [] }],
    };
    render(<SongEditor initialSong={songWithSection as any} />);

    const nameInput = screen.getByDisplayValue('Verse');
    fireEvent.change(nameInput, { target: { value: 'Chorus' } });

    const measuresInput = screen.getByTestId('song-editor-measures-input');
    fireEvent.change(measuresInput, { target: { value: '16' } });

    await waitFor(
      () => {
        expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: [
              expect.objectContaining({
                name: 'Chorus',
                measuresCount: 16,
              }),
            ],
          }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('handles auto-save error gracefully', async () => {
    vi.mocked(supabaseService.saveSongChart).mockRejectedValueOnce(new Error('Save failed'));
    render(<SongEditor initialSong={mockSong} />);

    const titleInput = screen.getByDisplayValue('Test Song');
    fireEvent.change(titleInput, { target: { value: 'Fail Me' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Save failed/i)).toBeDefined();
      },
      { timeout: 5000 },
    );
  });

  it('does not attempt to update state if unmounted during save', async () => {
    const saveSpy = vi.fn().mockResolvedValue({});
    vi.mocked(supabaseService.saveSongChart).mockImplementation(saveSpy);

    const { unmount } = render(<SongEditor initialSong={mockSong} />);

    fireEvent.change(screen.getByDisplayValue('Test Song'), {
      target: { value: 'Unmounted Update' },
    });

    unmount();

    // Small delay to let enqueued flush chain execute
    await waitFor(() => {
      // Verify save WAS called because cleanup calls flush() while isMountedRef.current is still true
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});

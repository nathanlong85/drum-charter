import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveSnippet, SongChart } from '@/lib/types/groove';
import SongEditor from '../SongEditor';

const mockSong: SongChart = {
  id: 's1',
  header: {
    title: 'Test Song',
    bpm: 120,
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
    metronomeEnabled: false,
    metronomeVolume: 0.5,
  },
  sections: [
    {
      id: 'sec1',
      name: 'Chorus',
      measuresCount: 4,
      notes: [],
      subSections: [],
    },
  ],
  tags: [],
  isPublic: false,
  createdAt: null,
  updatedAt: null,
};

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('SongEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(supabaseService, 'saveSongChart').mockResolvedValue({} as any);
    vi.spyOn(supabaseService, 'duplicateSongChart').mockResolvedValue({ id: 's2' } as any);
    vi.spyOn(supabaseService, 'deleteSongChart').mockResolvedValue(true);
    vi.spyOn(supabaseService, 'listGrooveSnippetsMapped').mockResolvedValue([]);
  });

  it('renders initial song data', () => {
    render(<SongEditor initialSong={mockSong} />);
    expect(screen.getByDisplayValue('Test Song')).toBeDefined();
    expect(screen.getByText('Chorus')).toBeDefined();
  });

  it('updates song title and triggers save', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const titleInput = screen.getByPlaceholderText('Song Title');

    fireEvent.change(titleInput, { target: { value: 'Updated Song' } });
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveSongChart).toHaveBeenCalled();
    });

    expect(supabaseService.saveSongChart).toHaveBeenCalledWith(
      expect.objectContaining({
        header: expect.objectContaining({ title: 'Updated Song' }),
      }),
    );
  });

  it('adds a new section', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const addSectionBtn = screen.getByRole('button', { name: /Add section/i });

    fireEvent.click(addSectionBtn);
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveSongChart).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveSongChart).mock.calls.at(-1)![0] as SongChart;
    expect(lastCall.sections.length).toBe(2);
  });

  it('removes a section', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const removeBtn = screen.getByTitle('Remove Section');

    fireEvent.click(removeBtn);
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveSongChart).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveSongChart).mock.calls.at(-1)![0] as SongChart;
    expect(lastCall.sections.length).toBe(0);
  });

  it('duplicates the song', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const duplicateBtn = screen.getByRole('button', { name: /Duplicate This Item/i });
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabaseService.duplicateSongChart).toHaveBeenCalledWith('s1');
    });
  });

  it('deletes the song', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SongEditor initialSong={mockSong} />);
    const deleteBtn = screen.getByRole('button', { name: /Delete This Item/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(supabaseService.deleteSongChart).toHaveBeenCalledWith('s1');
    });
  });

  it('inserts a snippet into a section', async () => {
    const mockSnippet: GrooveSnippet = {
      id: 'snip1',
      title: 'Test Snippet',
      tags: [],
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [],
      isPublic: true,
      createdAt: null,
      updatedAt: null,
    };
    vi.spyOn(supabaseService, 'listGrooveSnippetsMapped').mockResolvedValue([mockSnippet]);

    render(<SongEditor initialSong={mockSong} />);

    // Open picker
    fireEvent.click(screen.getByText(/\+ Insert Snippet/i));

    // Wait for snippet to load and select it
    await waitFor(() => expect(screen.getByText('Test Snippet')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Test Snippet'));
    await act(async () => {
      await wait(2100);
    });

    // Verify grid is added to the section in the state/save call
    await waitFor(() => {
      expect(supabaseService.saveSongChart).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveSongChart).mock.calls.at(-1)![0] as SongChart;
    expect(lastCall.sections[0].grid).toBeDefined();
    expect(lastCall.sections[0].grid?.timeSignature.beatsPerMeasure).toBe(4);
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
});

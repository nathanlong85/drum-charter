import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteItemAction,
  duplicateItemAction,
  listGrooveSnippetsAction,
  saveSongChartAction,
} from '@/lib/actions/item-actions';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveSnippet, SongChart } from '@/lib/types/groove';
import SongEditor from '../SongEditor';

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

// Mock item-actions
vi.mock('@/lib/actions/item-actions', () => ({
  saveSongChartAction: vi.fn().mockResolvedValue({ success: true }),
  duplicateItemAction: vi.fn().mockResolvedValue({ success: true, data: { id: 's2' } }),
  deleteItemAction: vi.fn().mockResolvedValue({ success: true }),
  listGrooveSnippetsAction: vi.fn().mockResolvedValue([]),
}));

// Mock supabase-service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: vi.fn().mockResolvedValue({}),
    deleteSongChart: vi.fn().mockResolvedValue({}),
    duplicateSongChart: vi.fn().mockResolvedValue({ id: 's2' }),
    listGrooveSnippetsMapped: vi.fn().mockResolvedValue([]),
  },
}));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('SongEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial song data', () => {
    render(<SongEditor initialSong={mockSong} />);
    expect(screen.getByDisplayValue('Test Song')).toBeDefined();
    expect(screen.getByText('Chorus')).toBeDefined();
  });

  it('updates song title and triggers save', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const titleInput = screen.getByPlaceholderText('Song Title');

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Updated Song' } });
      await wait(2100);
    });

    await waitFor(() => {
      expect(saveSongChartAction).toHaveBeenCalled();
    });

    expect(saveSongChartAction).toHaveBeenCalledWith(
      expect.objectContaining({
        header: expect.objectContaining({ title: 'Updated Song' }),
      }),
    );
  });

  it('adds a new section', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const addSectionBtn = screen.getByRole('button', { name: /Add section/i });

    await act(async () => {
      fireEvent.click(addSectionBtn);
      await wait(2100);
    });

    await waitFor(() => {
      expect(saveSongChartAction).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(saveSongChartAction).mock.calls.at(-1)![0] as SongChart;
    expect(lastCall.sections.length).toBe(2);
  });

  it('removes a section', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const removeBtn = screen.getByTitle('Remove Section');

    await act(async () => {
      fireEvent.click(removeBtn);
      await wait(2100);
    });

    await waitFor(() => {
      expect(saveSongChartAction).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(saveSongChartAction).mock.calls.at(-1)![0] as SongChart;
    expect(lastCall.sections.length).toBe(0);
  });

  it('duplicates the song', async () => {
    render(<SongEditor initialSong={mockSong} />);
    const duplicateBtn = screen.getByRole('button', { name: /Duplicate This Item/i });

    await act(async () => {
      fireEvent.click(duplicateBtn);
      await wait(2100);
    });

    expect(duplicateItemAction).toHaveBeenCalledWith('s1', 'song');
  });

  it('deletes the song', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SongEditor initialSong={mockSong} />);
    const deleteBtn = screen.getByRole('button', { name: /Delete This Item/i });

    await act(async () => {
      fireEvent.click(deleteBtn);
      await wait(2100);
    });

    expect(deleteItemAction).toHaveBeenCalledWith('s1', 'song');
  });

  it('inserts a snippet into a section', async () => {
    const mockSnippet: GrooveSnippet = {
      id: 'snip1',
      userId: 'u1',
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
    vi.mocked(listGrooveSnippetsAction).mockResolvedValue([mockSnippet]);

    render(<SongEditor initialSong={mockSong} />);

    // Open picker
    fireEvent.click(screen.getByText(/\+ Insert Snippet/i));

    // Wait for snippet to load
    await screen.findByText('Test Snippet');

    await act(async () => {
      fireEvent.click(screen.getByText('Test Snippet'));
      await wait(2100);
    });

    const lastCall = vi.mocked(saveSongChartAction).mock.calls.at(-1)![0] as SongChart;
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

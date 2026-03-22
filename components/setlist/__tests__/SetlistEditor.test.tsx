import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import { SetlistEditor } from '../SetlistEditor';

vi.mock('lodash', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lodash')>();
  return {
    ...actual,
    debounce: vi.fn((fn) => {
      const debounced = (...args: any[]) => fn(...args);
      debounced.cancel = vi.fn();
      debounced.flush = vi.fn();
      return debounced;
    }),
  };
});

vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSetlist: vi.fn(),
    listSongCharts: vi.fn().mockResolvedValue([
      { id: 's1', title: 'First Song' },
      { id: 's2', title: 'Second Song' },
      { id: 's3', title: 'Third Song' },
    ]),
  },
}));

const mockSetlist = {
  id: 'test-setlist',
  userId: 'user-1',
  title: 'My Setlist',
  songs: [
    { songId: 's1', order: 0 },
    { songId: 's2', order: 1 },
  ],
  isPublic: false,
  createdAt: null,
  updatedAt: null,
};

describe('SetlistEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial setlist data', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    expect(screen.getByDisplayValue('My Setlist')).toBeDefined();
    expect(screen.getByText('Private')).toBeDefined();

    // Wait for songs to load and display titles
    await waitFor(() => {
      expect(screen.getByText('First Song')).toBeDefined();
      expect(screen.getByText('Second Song')).toBeDefined();
    });
  });

  it('handles title changes and saves', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    const titleInput = screen.getByDisplayValue('My Setlist');
    fireEvent.change(titleInput, { target: { value: 'New Setlist Title' } });

    expect(screen.getByDisplayValue('New Setlist Title')).toBeDefined();

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Setlist Title' }),
      );
    });
  });

  it('toggles visibility and saves', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    const visibilityButton = screen.getByText('Private');
    fireEvent.click(visibilityButton);

    expect(screen.getByText('Public')).toBeDefined();

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({ isPublic: true }),
      );
    });
  });

  it('adds a song to the setlist', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    // Open song selector
    fireEvent.click(screen.getByText('Add Song'));

    // Wait for available songs
    await waitFor(() => {
      expect(screen.getByText('Third Song')).toBeDefined();
    });

    // Click to add
    fireEvent.click(screen.getByText('Third Song'));

    // Should now be in the list
    expect(screen.getAllByText('Third Song').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({
          songs: expect.arrayContaining([expect.objectContaining({ songId: 's3', order: 2 })]),
        }),
      );
    });
  });

  it('removes a song from the setlist', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    await waitFor(() => {
      expect(screen.getByText('First Song')).toBeDefined();
    });

    const removeButtons = screen.getAllByTitle('Remove from Setlist');
    fireEvent.click(removeButtons[0]);

    // "First Song" should be removed
    expect(screen.queryByText('First Song')).toBeNull();

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({
          songs: [
            { songId: 's2', order: 0 }, // Re-ordered
          ],
        }),
      );
    });
  });

  it('moves a song up', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    await waitFor(() => {
      expect(screen.getByText('Second Song')).toBeDefined();
    });

    const moveUpButtons = screen.getAllByTitle('Move Up');
    // Button for first item is disabled, we click the second one
    fireEvent.click(moveUpButtons[1]);

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({
          songs: [
            { songId: 's2', order: 0 },
            { songId: 's1', order: 1 },
          ],
        }),
      );
    });
  });

  it('moves a song down', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    await waitFor(() => {
      expect(screen.getByText('First Song')).toBeDefined();
    });

    const moveDownButtons = screen.getAllByTitle('Move Down');
    // Click move down on the first item
    fireEvent.click(moveDownButtons[0]);

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({
          songs: [
            { songId: 's2', order: 0 },
            { songId: 's1', order: 1 },
          ],
        }),
      );
    });
  });

  it('handles save error gracefully', async () => {
    vi.mocked(supabaseService).saveSetlist.mockRejectedValueOnce(new Error('Save failed'));

    render(<SetlistEditor initialSetlist={mockSetlist} />);

    const titleInput = screen.getByDisplayValue('My Setlist');
    fireEvent.change(titleInput, { target: { value: 'New Setlist Title' } });

    await waitFor(() => {
      expect(screen.getByText('Failed to save changes')).toBeDefined();
    });
  });

  it('handles empty available songs state', async () => {
    vi.mocked(supabaseService).listSongCharts.mockResolvedValueOnce([]);

    render(<SetlistEditor initialSetlist={mockSetlist} />);

    fireEvent.click(screen.getByText('Add Song'));

    await waitFor(() => {
      expect(screen.getByText('No songs found in your library.')).toBeDefined();
    });
  });

  it('shows empty state when no songs in setlist', async () => {
    const emptySetlist = { ...mockSetlist, songs: [] };
    render(<SetlistEditor initialSetlist={emptySetlist} />);

    // Wait for the useEffect to finish loading available songs
    await waitFor(() => {
      expect(screen.getByText(/No songs in this setlist yet/i)).toBeDefined();
    });
  });
});

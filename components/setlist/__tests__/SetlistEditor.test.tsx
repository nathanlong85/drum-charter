import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { debounce } from 'lodash';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import { SetlistEditor } from '../SetlistEditor';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock debounce to be synchronous but expose cancel/flush
vi.mock('lodash', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lodash')>();
  return {
    ...actual,
    debounce: vi.fn((fn: (...args: unknown[]) => void) => {
      const debounced = (...args: unknown[]) => fn(...args);
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

    expect(screen.getByDisplayValue('My Setlist')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-public-button')).toBeInTheDocument();

    // Wait for songs to load and display titles
    await waitFor(() => {
      expect(screen.getByText('First Song')).toBeInTheDocument();
      expect(screen.getByText('Second Song')).toBeInTheDocument();
    });
  });

  it('handles title changes and saves', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    const titleInput = screen.getByDisplayValue('My Setlist');

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'New Setlist Title' } });
    });

    expect(screen.getByDisplayValue('New Setlist Title')).toBeInTheDocument();

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Setlist Title' }),
      );
    });
  });

  it('toggles visibility and saves', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    const visibilityButton = screen.getByTestId('toggle-public-button');

    await act(async () => {
      fireEvent.click(visibilityButton);
    });

    expect(screen.getByTestId('toggle-public-button')).toHaveTextContent(/Public/i);

    await waitFor(() => {
      expect(supabaseService.saveSetlist).toHaveBeenCalledWith(
        expect.objectContaining({ isPublic: true }),
      );
    });
  });

  it('adds a song to the setlist', async () => {
    render(<SetlistEditor initialSetlist={mockSetlist} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('First Song')).toBeInTheDocument();
    });

    // Open song selector
    fireEvent.click(screen.getByText('Add Composition'));

    // Wait for available songs in selector
    const songButton = await screen.findByText('Third Song');

    // Click to add
    await act(async () => {
      fireEvent.click(songButton);
    });

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
      expect(screen.getByText('First Song')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByTitle('Remove from Setlist');

    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

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
      expect(screen.getByText('Second Song')).toBeInTheDocument();
    });

    const moveUpButtons = screen.getAllByTitle('Move Up');

    // Button for first item is disabled, we click the second one
    await act(async () => {
      fireEvent.click(moveUpButtons[1]);
    });

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

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'New Setlist Title' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('handles empty available songs state', async () => {
    vi.mocked(supabaseService).listSongCharts.mockResolvedValueOnce([]);

    render(<SetlistEditor initialSetlist={mockSetlist} />);
    await waitFor(() => {
      expect(screen.getByText('Add Composition')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Composition'));

    await waitFor(() => {
      expect(screen.getByText('No compositions found in your library.')).toBeInTheDocument();
    });
  });

  it('shows empty state when no songs in setlist', async () => {
    const emptySetlist = { ...mockSetlist, songs: [] };
    render(<SetlistEditor initialSetlist={emptySetlist} />);

    await waitFor(() => {
      expect(screen.getByText(/Initial Set Empty/i)).toBeInTheDocument();
    });
  });

  it('flushes pending saves on unmount', () => {
    const { unmount } = render(<SetlistEditor initialSetlist={mockSetlist} />);

    // Capture the debounced instance
    const debounceMock = vi.mocked(debounce);
    const debouncedFunction = debounceMock.mock.results[0].value;

    unmount();

    expect(debouncedFunction.flush).toHaveBeenCalled();
  });
});

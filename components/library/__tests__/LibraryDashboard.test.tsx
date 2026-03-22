import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/client';
import LibraryDashboard from '../LibraryDashboard';

// Mock the Supabase client - Define EVERYTHING inside to avoid hoisting issues
vi.mock('@/lib/supabase/client', () => {
  const auth = {
    getUser: vi.fn(),
  };
  const instance = {
    auth,
  };
  return {
    createClient: vi.fn(() => instance),
  };
});

// Mock Supabase service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: vi.fn(),
    saveNotebook: vi.fn(),
    saveGrooveSnippet: vi.fn(),
    saveSetlist: vi.fn(),
    deleteSongChart: vi.fn().mockResolvedValue({}),
    deleteNotebook: vi.fn().mockResolvedValue({}),
    deleteGrooveSnippet: vi.fn().mockResolvedValue({}),
    deleteSetlist: vi.fn().mockResolvedValue({}),
    duplicateSongChart: vi.fn().mockResolvedValue({ id: 's2', title: 'Song 2', tags: [] }),
    duplicateNotebook: vi.fn().mockResolvedValue({ id: 'n2', title: 'Notebook 2', tags: [] }),
    duplicateGrooveSnippet: vi.fn().mockResolvedValue({ id: 'sn2', title: 'Snippet 2', tags: [] }),
    duplicateSetlist: vi.fn().mockResolvedValue({ id: 'set2', title: 'Setlist 2', tags: [] }),
  },
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error stubbing window.location for tests to mock assign behavior
  delete window.location;
  window.location = { ...originalLocation, assign: vi.fn() };
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  window.location = originalLocation;
});

const mockProps = {
  initialSongs: [{ id: 's1', title: 'Song 1', tags: ['rock'] }],
  initialNotebooks: [{ id: 'n1', title: 'Notebook 1', tags: ['practice'] }],
  initialSnippets: [{ id: 'sn1', title: 'Snippet 1', tags: ['funk'] }],
  initialSetlists: [{ id: 'set1', title: 'Setlist 1', tags: ['live'] }],
};

interface AuthMock {
  getUser: ReturnType<typeof vi.fn>;
}

describe('LibraryDashboard', () => {
  const getAuthMock = () => {
    return vi.mocked(createClient)().auth as unknown as AuthMock;
  };

  describe('Rendering and Filtering', () => {
    it('renders initial items across tabs', () => {
      render(<LibraryDashboard {...mockProps} />);

      expect(screen.getByText('Song 1')).toBeDefined();

      fireEvent.click(screen.getByTestId('tab-notebook'));
      expect(screen.getByText('Notebook 1')).toBeDefined();

      fireEvent.click(screen.getByTestId('tab-snippet'));
      expect(screen.getByText('Snippet 1')).toBeDefined();

      fireEvent.click(screen.getByTestId('tab-setlist'));
      expect(screen.getByText('Setlist 1')).toBeDefined();
    });

    it('filters items by search query', () => {
      render(<LibraryDashboard {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/Search/i);

      fireEvent.change(searchInput, { target: { value: 'non-existent' } });
      expect(screen.queryByText('Song 1')).toBeNull();
      expect(screen.getByText(/No results found/i)).toBeDefined();

      fireEvent.change(searchInput, { target: { value: 'Song' } });
      expect(screen.getByText('Song 1')).toBeDefined();
    });

    it('filters items by tags', () => {
      render(<LibraryDashboard {...mockProps} />);

      // Toggle a tag filter
      const rockTag = screen.getByLabelText(/Filter by rock tag/i);
      fireEvent.click(rockTag);
      expect(screen.getByText('Song 1')).toBeDefined();

      // Clear filters
      fireEvent.click(screen.getByText(/Clear Filters/i));
      expect(screen.queryByText(/Clear Filters/i)).toBeNull();
    });
  });

  describe('Creation Flow', () => {
    it('successfully creates a new song and redirects', async () => {
      getAuthMock().getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });
      vi.mocked(supabaseService).saveSongChart.mockResolvedValue({ id: 'new-song-id' } as any);

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByText(/New Song/i));

      await waitFor(() => {
        expect(supabaseService.saveSongChart).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/songs/new-song-id');
      });
    });

    it('successfully creates a new notebook and redirects', async () => {
      getAuthMock().getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });
      vi.mocked(supabaseService).saveNotebook.mockResolvedValue({ id: 'new-nb-id' } as any);

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByTestId('tab-notebook'));
      fireEvent.click(screen.getByText(/New Notebook/i));

      await waitFor(() => {
        expect(supabaseService.saveNotebook).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/notebooks/new-nb-id');
      });
    });

    it('successfully creates a new snippet and redirects', async () => {
      getAuthMock().getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });
      vi.mocked(supabaseService).saveGrooveSnippet.mockResolvedValue({ id: 'new-snip-id' } as any);

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByTestId('tab-snippet'));
      fireEvent.click(screen.getByText(/New Snippet/i));

      await waitFor(() => {
        expect(supabaseService.saveGrooveSnippet).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/snippets/new-snip-id');
      });
    });

    it('successfully creates a new setlist and redirects', async () => {
      getAuthMock().getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });
      vi.mocked(supabaseService).saveSetlist.mockResolvedValue({ id: 'new-setlist-id' } as any);

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByTestId('tab-setlist'));
      fireEvent.click(screen.getByText(/New Setlist/i));

      await waitFor(() => {
        expect(supabaseService.saveSetlist).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/setlists/new-setlist-id');
      });
    });

    it('handles unauthenticated users', async () => {
      getAuthMock().getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByText(/New Song/i));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Please log in'));
      });
    });

    it('attempts to create a new song chart and handles errors', async () => {
      getAuthMock().getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });
      const error = { message: 'Network error', code: '500' };
      vi.mocked(supabaseService).saveSongChart.mockRejectedValue(error);

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByText(/New Song/i));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Failed to create item: Network error'),
        );
      });
    });

    it('handles notebook creation error', async () => {
      getAuthMock().getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      vi.mocked(supabaseService).saveNotebook.mockRejectedValue(new Error('NB Fail'));

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByTestId('tab-notebook'));
      fireEvent.click(screen.getByText(/New Notebook/i));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to create item')),
      );
    });

    it('handles snippet creation error', async () => {
      getAuthMock().getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      vi.mocked(supabaseService).saveGrooveSnippet.mockRejectedValue(new Error('Snip Fail'));

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByTestId('tab-snippet'));
      fireEvent.click(screen.getByText(/New Snippet/i));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to create item')),
      );
    });
  });

  describe('Management Flow', () => {
    it('deletes song', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getAllByTitle(/Delete/i)[0]);
      expect(supabaseService.deleteSongChart).toHaveBeenCalledWith('s1');
      await waitFor(() => expect(screen.queryByText('Song 1')).toBeNull());
    });

    it('deletes notebook', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getByTestId('tab-notebook'));
      fireEvent.click(screen.getAllByTitle(/Delete/i)[0]);
      expect(supabaseService.deleteNotebook).toHaveBeenCalledWith('n1');
      await waitFor(() => expect(screen.queryByText('Notebook 1')).toBeNull());
    });

    it('deletes snippet', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getByTestId('tab-snippet'));
      fireEvent.click(screen.getAllByTitle(/Delete/i)[0]);
      expect(supabaseService.deleteGrooveSnippet).toHaveBeenCalledWith('sn1');
      await waitFor(() => expect(screen.queryByText('Snippet 1')).toBeNull());
    });

    it('deletes setlist', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getByTestId('tab-setlist'));
      fireEvent.click(screen.getAllByTitle(/Delete/i)[0]);
      expect(supabaseService.deleteSetlist).toHaveBeenCalledWith('set1');
      await waitFor(() => expect(screen.queryByText('Setlist 1')).toBeNull());
    });

    it('handles item duplication for all types', async () => {
      render(<LibraryDashboard {...mockProps} />);

      // 1. Duplicate Song
      fireEvent.click(screen.getAllByTitle(/Duplicate/i)[0]);
      await waitFor(() => {
        expect(supabaseService.duplicateSongChart).toHaveBeenCalledWith('s1');
        expect(screen.getByText('Song 2')).toBeDefined();
      });

      // 2. Duplicate Notebook
      fireEvent.click(screen.getByTestId('tab-notebook'));
      fireEvent.click(screen.getAllByTitle(/Duplicate/i)[0]);
      await waitFor(() => {
        expect(supabaseService.duplicateNotebook).toHaveBeenCalledWith('n1');
        expect(screen.getByText('Notebook 2')).toBeDefined();
      });

      // 3. Duplicate Snippet
      fireEvent.click(screen.getByTestId('tab-snippet'));
      fireEvent.click(screen.getAllByTitle(/Duplicate/i)[0]);
      await waitFor(() => {
        expect(supabaseService.duplicateGrooveSnippet).toHaveBeenCalledWith('sn1');
        expect(screen.getByText('Snippet 2')).toBeDefined();
      });

      // 4. Duplicate Setlist
      fireEvent.click(screen.getByTestId('tab-setlist'));
      fireEvent.click(screen.getAllByTitle(/Duplicate/i)[0]);
      await waitFor(() => {
        expect(supabaseService.duplicateSetlist).toHaveBeenCalledWith('set1');
        expect(screen.getByText('Setlist 2')).toBeDefined();
      });
    });

    it('handles errors during deletion and duplication', async () => {
      supabaseService.deleteSongChart = vi
        .fn()
        .mockRejectedValue({ message: 'Delete fail', code: '123' });
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getAllByTitle(/Delete/i)[0]);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to delete item.');
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Test non-Supabase error duplication
      supabaseService.duplicateSongChart = vi.fn().mockRejectedValue(new Error('Simple fail'));
      fireEvent.click(screen.getAllByTitle(/Duplicate/i)[0]);
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to duplicate item.');
      });
    });
  });
});

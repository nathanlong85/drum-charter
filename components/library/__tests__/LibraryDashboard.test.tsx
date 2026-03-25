import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';

interface MockLibraryItem {
  id: string;
  title: string;
  type: string;
  tags?: string[];
  created_at: string;
  bpm?: number;
}

// Use vi.hoisted to ensure these are available inside vi.mock factory
const { mockGetUser, mockSupabase, navState, mockRouter } = vi.hoisted(() => {
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: 'test-user-id' } },
    error: null,
  });
  const state = { currentTab: 'song', listeners: [] as ((val: string) => void)[] };
  return {
    mockGetUser: getUser,
    mockSupabase: {
      auth: { getUser },
    },
    navState: state,
    mockRouter: {
      push: vi.fn((url: string) => {
        const tabMatch = url.match(/tab=([^&]+)/);
        if (tabMatch) {
          state.currentTab = tabMatch[1];
          state.listeners.forEach((l) => l(state.currentTab));
        }
      }),
    },
  };
});

// Mock Supabase client module
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock next/navigation
import { useEffect, useState } from 'react';

vi.mock('next/navigation', () => {
  return {
    useSearchParams: () => {
      const [tab, setTab] = useState(navState.currentTab);
      useEffect(() => {
        navState.listeners.push(setTab);
        return () => {
          navState.listeners = navState.listeners.filter((l) => l !== setTab);
        };
      }, []);
      return {
        get: vi.fn((key) => (key === 'tab' ? tab : null)),
      };
    },
    useRouter: () => mockRouter,
  };
});

// Mock Supabase service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: vi.fn(),
    saveNotebook: vi.fn(),
    saveGrooveSnippet: vi.fn(),
    saveSetlist: vi.fn(),
    deleteSongChart: vi.fn(),
    deleteNotebook: vi.fn(),
    deleteGrooveSnippet: vi.fn(),
    deleteSetlist: vi.fn(),
    duplicateSongChart: vi.fn(),
    duplicateNotebook: vi.fn(),
    duplicateGrooveSnippet: vi.fn(),
    duplicateSetlist: vi.fn(),
  },
}));

// Import LibraryDashboard AFTER mocks are defined
import LibraryDashboard from '../LibraryDashboard';

describe('LibraryDashboard', () => {
  const mockSongs: MockLibraryItem[] = [
    {
      id: 's1',
      title: 'Song 1',
      type: 'song',
      tags: ['rock'],
      created_at: new Date().toISOString(),
    },
  ];
  const mockNotebooks: MockLibraryItem[] = [
    {
      id: 'n1',
      title: 'Notebook 1',
      type: 'notebook',
      tags: ['jazz'],
      created_at: new Date().toISOString(),
    },
  ];
  const mockSnippets: MockLibraryItem[] = [
    {
      id: 'sn1',
      title: 'Snippet 1',
      type: 'snippet',
      tags: ['funk'],
      created_at: new Date().toISOString(),
    },
  ];
  const mockSetlists: MockLibraryItem[] = [
    { id: 'set1', title: 'Setlist 1', type: 'setlist', created_at: new Date().toISOString() },
  ];

  const mockProps = {
    initialSongs: mockSongs as any[],
    initialNotebooks: mockNotebooks as any[],
    initialSnippets: mockSnippets as any[],
    initialSetlists: mockSetlists as any[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    navState.currentTab = 'song'; // Reset URL state

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock window.location.assign
    const location = { assign: vi.fn() };
    vi.stubGlobal('location', location);

    // Mock window.alert
    vi.stubGlobal('alert', vi.fn());
  });

  const switchTab = async (tabId: string) => {
    const tabBtn = screen.getByTestId(`tab-${tabId}`);
    fireEvent.click(tabBtn);

    // We must wait for React to process the state change.
    await waitFor(
      () => {
        const btn = screen.getByTestId(`tab-${tabId}`);
        expect(btn.getAttribute('aria-selected')).toBe('true');
      },
      { timeout: 2000 },
    );
  };

  describe('Initial Rendering', () => {
    it('renders initial items across tabs', async () => {
      render(<LibraryDashboard {...mockProps} />);

      expect(screen.getByText('Song 1')).toBeDefined();

      await switchTab('notebook');
      await waitFor(() => expect(screen.getByText('Notebook 1')).toBeDefined());

      await switchTab('snippet');
      await waitFor(() => expect(screen.getByText('Snippet 1')).toBeDefined());

      await switchTab('setlist');
      await waitFor(() => expect(screen.getByText('Setlist 1')).toBeDefined());
    });

    it('filters items by tags', async () => {
      const songsWithTags = [
        ...mockSongs,
        {
          id: 's2',
          title: 'Song 2',
          type: 'song',
          tags: ['pop'],
          created_at: new Date().toISOString(),
        },
      ];
      render(<LibraryDashboard {...mockProps} initialSongs={songsWithTags as any} />);

      expect(screen.getByText('Song 1')).toBeDefined();
      expect(screen.getByText('Song 2')).toBeDefined();

      // Click 'rock' tag filter
      fireEvent.click(screen.getByTestId('tag-filter-rock'));

      await waitFor(() => {
        expect(screen.getByText('Song 1')).toBeDefined();
        expect(screen.queryByText('Song 2')).toBeNull();
      });
    });
  });

  describe('Creation Flow', () => {
    it('successfully creates a new song chart and redirects', async () => {
      vi.mocked(supabaseService.saveSongChart).mockResolvedValue({ id: 'new-song-id' } as any);

      render(<LibraryDashboard {...mockProps} />);

      // Button is dynamic: "New song"
      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(supabaseService.saveSongChart).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/songs/new-song-id');
      });
    });

    it('successfully creates a new notebook and redirects', async () => {
      vi.mocked(supabaseService.saveNotebook).mockResolvedValue({ id: 'new-nb-id' } as any);

      render(<LibraryDashboard {...mockProps} />);
      await switchTab('notebook');

      // The button text is updated by activeTab state
      await waitFor(() =>
        expect(screen.getByTestId('create-new-button')).toHaveTextContent(/notebook/i),
      );

      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(supabaseService.saveNotebook).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/notebooks/new-nb-id');
      });
    });

    it('successfully creates a new snippet and redirects', async () => {
      vi.mocked(supabaseService.saveGrooveSnippet).mockResolvedValue({ id: 'new-snip-id' } as any);

      render(<LibraryDashboard {...mockProps} />);
      await switchTab('snippet');

      await waitFor(() =>
        expect(screen.getByTestId('create-new-button')).toHaveTextContent(/snippet/i),
      );

      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(supabaseService.saveGrooveSnippet).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/snippets/new-snip-id');
      });
    });

    it('successfully creates a new setlist and redirects', async () => {
      vi.mocked(supabaseService.saveSetlist).mockResolvedValue({ id: 'new-setlist-id' } as any);

      render(<LibraryDashboard {...mockProps} />);
      await switchTab('setlist');

      await waitFor(() =>
        expect(screen.getByTestId('create-new-button')).toHaveTextContent(/setlist/i),
      );

      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(supabaseService.saveSetlist).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/setlists/new-setlist-id');
      });
    });
  });

  describe('Management Flow', () => {
    it('deletes song chart', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getByTestId('delete-song-s1'));
      expect(supabaseService.deleteSongChart).toHaveBeenCalledWith('s1');
      await waitFor(() => expect(screen.queryByText('Song 1')).toBeNull());
    });

    it('deletes notebook', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      await switchTab('notebook');
      await waitFor(() => expect(screen.getByTestId('delete-notebook-n1')).toBeDefined());

      fireEvent.click(screen.getByTestId('delete-notebook-n1'));
      expect(supabaseService.deleteNotebook).toHaveBeenCalledWith('n1');
      await waitFor(() => expect(screen.queryByText('Notebook 1')).toBeNull());
    });

    it('handles item duplication', async () => {
      vi.mocked(supabaseService.duplicateSongChart).mockResolvedValue({
        id: 's2',
        title: 'Song 1 (Copy)',
        type: 'song',
        tags: [],
        created_at: new Date().toISOString(),
      } as any);

      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getByTestId('duplicate-song-s1'));
      await waitFor(() => {
        expect(supabaseService.duplicateSongChart).toHaveBeenCalledWith('s1');
        expect(screen.getByText('Song 1 (Copy)')).toBeDefined();
      });
    });

    it('handles snippet creation error', async () => {
      vi.mocked(supabaseService.saveGrooveSnippet).mockRejectedValue(new Error('Snip Fail'));

      render(<LibraryDashboard {...mockProps} />);
      await switchTab('snippet');
      await waitFor(() =>
        expect(screen.getByTestId('create-new-button')).toHaveTextContent(/snippet/i),
      );

      fireEvent.click(screen.getByTestId('create-new-button'));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to create item')),
      );
    });

    it('handles notebook creation error', async () => {
      vi.mocked(supabaseService.saveNotebook).mockRejectedValue(new Error('NB Fail'));

      render(<LibraryDashboard {...mockProps} />);
      await switchTab('notebook');
      await waitFor(() =>
        expect(screen.getByTestId('create-new-button')).toHaveTextContent(/notebook/i),
      );

      fireEvent.click(screen.getByTestId('create-new-button'));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to create item')),
      );
    });
  });
});

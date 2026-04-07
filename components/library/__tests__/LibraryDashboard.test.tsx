import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createItemAction,
  deleteItemAction,
  duplicateItemAction,
} from '@/lib/actions/item-actions';

interface MockLibraryItem {
  id: string;
  title: string;
  type: string;
  tags?: string[];
  created_at: string;
  bpm?: number;
}

// Use vi.hoisted to ensure these are available inside vi.mock factory
const { navState, mockRouter } = vi.hoisted(() => {
  const state = { currentTab: 'song', listeners: [] as ((val: string) => void)[] };
  return {
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

// Mock item-actions
vi.mock('@/lib/actions/item-actions', () => ({
  createItemAction: vi.fn().mockResolvedValue({ success: true }),
  duplicateItemAction: vi.fn().mockResolvedValue({
    success: true,
    data: { id: 'dup-1', title: 'Song 1 (Copy)', type: 'song' },
  }),
  deleteItemAction: vi.fn().mockResolvedValue({ success: true }),
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
    it('calls createItemAction for song', async () => {
      render(<LibraryDashboard {...mockProps} />);

      // Button is dynamic: "New song"
      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(createItemAction).toHaveBeenCalledWith('song');
      });
    });

    it('calls createItemAction for notebook', async () => {
      render(<LibraryDashboard {...mockProps} />);
      await switchTab('notebook');

      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(createItemAction).toHaveBeenCalledWith('notebook');
      });
    });

    it('calls createItemAction for snippet', async () => {
      render(<LibraryDashboard {...mockProps} />);
      await switchTab('snippet');

      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(createItemAction).toHaveBeenCalledWith('snippet');
      });
    });

    it('calls createItemAction for setlist', async () => {
      render(<LibraryDashboard {...mockProps} />);
      await switchTab('setlist');

      fireEvent.click(screen.getByTestId('create-new-button'));

      await waitFor(() => {
        expect(createItemAction).toHaveBeenCalledWith('setlist');
      });
    });
  });

  describe('Management Flow', () => {
    it('deletes song chart', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getByTestId('delete-song-s1'));
      await waitFor(() => {
        expect(deleteItemAction).toHaveBeenCalledWith('s1', 'song');
        expect(screen.queryByText('Song 1')).toBeNull();
      });
    });

    it('deletes notebook', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<LibraryDashboard {...mockProps} />);

      await switchTab('notebook');
      await waitFor(() => expect(screen.getByTestId('delete-notebook-n1')).toBeDefined());

      fireEvent.click(screen.getByTestId('delete-notebook-n1'));
      await waitFor(() => {
        expect(deleteItemAction).toHaveBeenCalledWith('n1', 'notebook');
        expect(screen.queryByText('Notebook 1')).toBeNull();
      });
    });

    it('handles item duplication', async () => {
      render(<LibraryDashboard {...mockProps} />);

      fireEvent.click(screen.getByTestId('duplicate-song-s1'));
      await waitFor(() => {
        expect(duplicateItemAction).toHaveBeenCalledWith('s1', 'song');
        expect(screen.getByText('Song 1 (Copy)')).toBeDefined();
      });
    });

    it('handles creation error', async () => {
      vi.mocked(createItemAction).mockRejectedValueOnce(new Error('Fail'));

      render(<LibraryDashboard {...mockProps} />);
      fireEvent.click(screen.getByTestId('create-new-button'));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to create item')),
      );
    });
  });
});

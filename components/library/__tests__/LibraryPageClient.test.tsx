import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createItemAction,
  deleteItemAction,
  duplicateItemAction,
} from '@/lib/actions/item-actions';
import LibraryPageClient, { type LibraryItemData } from '../LibraryPageClient';

// Mock item-actions
vi.mock('@/lib/actions/item-actions', () => ({
  createItemAction: vi.fn().mockImplementation(async (type) => ({
    success: true,
    id: `new-${type}-id`,
    routePrefix: `${type}s`,
  })),
  duplicateItemAction: vi.fn().mockResolvedValue({
    success: true,
    data: { id: 'dup-1', title: 'Song 1 (Copy)', type: 'song' },
  }),
  deleteItemAction: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock next/navigation
const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    get: vi.fn((key) => (key === 'search' ? null : null)),
  }),
}));

// Mock react and ViewTransition
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useOptimistic: (state: any) => [state, vi.fn()],
    ViewTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('LibraryPageClient', () => {
  const mockItems: LibraryItemData[] = [
    {
      id: 's1',
      title: 'Song 1',
      tags: ['rock'],
      created_at: new Date().toISOString(),
    },
    {
      id: 's2',
      title: 'Song 2',
      tags: ['pop'],
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });

  it('renders initial items', () => {
    render(<LibraryPageClient initialItems={mockItems} type="song" />);
    expect(screen.getByText('Song 1')).toBeDefined();
    expect(screen.getByText('Song 2')).toBeDefined();
  });

  it('filters items by search query', async () => {
    render(<LibraryPageClient initialItems={mockItems} type="song" />);
    const searchInput = screen.getByTestId('search-library-input');

    fireEvent.change(searchInput, { target: { value: 'Song 1' } });

    await waitFor(() => {
      expect(screen.getByText('Song 1')).toBeDefined();
      expect(screen.queryByText('Song 2')).toBeNull();
    });
  });

  it('filters items by tag', async () => {
    render(<LibraryPageClient initialItems={mockItems} type="song" />);

    // Click 'rock' tag filter
    fireEvent.click(screen.getByTestId('tag-filter-rock'));

    await waitFor(() => {
      expect(screen.getByText('Song 1')).toBeDefined();
      expect(screen.queryByText('Song 2')).toBeNull();
    });
  });

  it('calls createItemAction', async () => {
    render(<LibraryPageClient initialItems={mockItems} type="song" />);
    fireEvent.click(screen.getByTestId('create-new-button'));

    await waitFor(() => {
      expect(createItemAction).toHaveBeenCalledWith('song');
      expect(mockRouter.push).toHaveBeenCalledWith('/songs/new-song-id');
    });
  });

  it('handles item deletion', async () => {
    render(<LibraryPageClient initialItems={mockItems} type="song" />);

    fireEvent.click(screen.getByTestId('delete-song-s1'));
    await waitFor(() => {
      expect(deleteItemAction).toHaveBeenCalledWith('s1', 'song');
    });
  });

  it('handles item duplication', async () => {
    render(<LibraryPageClient initialItems={mockItems} type="song" />);

    fireEvent.click(screen.getByTestId('duplicate-song-s1'));
    await waitFor(() => {
      expect(duplicateItemAction).toHaveBeenCalledWith('s1', 'song');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LibraryDashboard from '../LibraryDashboard';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/client';

// Mock the supabase client
const mockGetUser = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock the supabaseService
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: vi.fn(),
    saveNotebook: vi.fn(),
    saveGrooveSnippet: vi.fn(),
  },
}));

describe('LibraryDashboard Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('attempts to create a new song chart and handles errors', async () => {
    // Mock successful auth
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null });

    // Mock a failure to reproduce the user's issue
    const mockError = new Error('Supabase Error');
    (supabaseService.saveSongChart as any).mockRejectedValueOnce(mockError);
    
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <LibraryDashboard 
        initialSongs={[]} 
        initialNotebooks={[]} 
        initialSnippets={[]} 
      />
    );

    const createButton = screen.getByText(/New Song/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
      expect(supabaseService.saveSongChart).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id'
      }));
      expect(consoleSpy).toHaveBeenCalledWith('Error creating new item:', expect.objectContaining({
        message: 'Supabase Error',
        fullError: mockError
      }));
      expect(alertMock).toHaveBeenCalledWith('Failed to create new item. Check console for details.');
    });

    alertMock.mockRestore();
    consoleSpy.mockRestore();
  });

  it('successfully creates a new song and redirects', async () => {
    // Mock successful auth
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null });

    const mockSavedItem = { id: 'new-song-id' };
    (supabaseService.saveSongChart as any).mockResolvedValueOnce(mockSavedItem);
    
    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(
      <LibraryDashboard 
        initialSongs={[]} 
        initialNotebooks={[]} 
        initialSnippets={[]} 
      />
    );

    const createButton = screen.getByText(/New Song/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
      expect(supabaseService.saveSongChart).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id'
      }));
      expect(window.location.href).toBe('/songs/new-song-id');
    });

    window.location = originalLocation;
  });

  it('handles unauthenticated users', async () => {
    // Mock unauthenticated user
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <LibraryDashboard 
        initialSongs={[]} 
        initialNotebooks={[]} 
        initialSnippets={[]} 
      />
    );

    const createButton = screen.getByText(/New Song/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
      expect(supabaseService.saveSongChart).not.toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith('Please log in or continue as a guest to create items.');
    });

    alertMock.mockRestore();
  });
});

describe('LibraryDashboard Filtering', () => {
  const mockSongs = [
    { id: '1', title: 'Funk Groove', tags: ['funk'], created_at: '2024-01-01' },
    { id: '2', title: 'Rock Beat', tags: ['rock'], created_at: '2024-01-02' },
  ];

  it('filters items by search query', () => {
    render(
      <LibraryDashboard 
        initialSongs={mockSongs} 
        initialNotebooks={[]} 
        initialSnippets={[]} 
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search by title or tag/i);
    fireEvent.change(searchInput, { target: { value: 'funk' } });

    expect(screen.getByText('Funk Groove')).toBeDefined();
    expect(screen.queryByText('Rock Beat')).toBeNull();
  });

  it('filters items by selected tags', () => {
    render(
      <LibraryDashboard 
        initialSongs={mockSongs} 
        initialNotebooks={[]} 
        initialSnippets={[]} 
      />
    );

    const tagButton = screen.getByText('funk');
    fireEvent.click(tagButton);

    expect(screen.getByText('Funk Groove')).toBeDefined();
    expect(screen.queryByText('Rock Beat')).toBeNull();

    // Click again to clear
    fireEvent.click(tagButton);
    expect(screen.getByText('Funk Groove')).toBeDefined();
    expect(screen.getByText('Rock Beat')).toBeDefined();
  });

  it('filters items by multiple tags (AND logic)', () => {
    const complexSongs = [
      { id: '1', title: 'Funk Rock', tags: ['funk', 'rock'], created_at: '2024-01-01' },
      { id: '2', title: 'Pure Funk', tags: ['funk'], created_at: '2024-01-02' },
    ];

    render(
      <LibraryDashboard 
        initialSongs={complexSongs} 
        initialNotebooks={[]} 
        initialSnippets={[]} 
      />
    );

    fireEvent.click(screen.getByText('funk'));
    fireEvent.click(screen.getByText('rock'));

    expect(screen.getByText('Funk Rock')).toBeDefined();
    expect(screen.queryByText('Pure Funk')).toBeNull();
  });
});

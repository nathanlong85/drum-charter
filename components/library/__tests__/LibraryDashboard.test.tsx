import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LibraryDashboard from '../LibraryDashboard';
import { supabaseService } from '@/lib/services/supabase-service';

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
      expect(supabaseService.saveSongChart).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error creating new item:', 'Supabase Error', mockError);
      expect(alertMock).toHaveBeenCalledWith('Failed to create new item.');
    });

    alertMock.mockRestore();
    consoleSpy.mockRestore();
  });

  it('successfully creates a new song and redirects', async () => {
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
      expect(supabaseService.saveSongChart).toHaveBeenCalled();
      expect(window.location.href).toBe('/songs/new-song-id');
    });

    window.location = originalLocation;
  });
});

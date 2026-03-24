import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveSnippet } from '@/lib/types/groove';
import { SnippetEditor } from '../SnippetEditor';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveGrooveSnippet: vi.fn().mockResolvedValue({}),
    duplicateGrooveSnippet: vi.fn().mockResolvedValue({ id: 'snippet-2' }),
    deleteGrooveSnippet: vi.fn().mockResolvedValue({}),
  },
}));

const mockSnippet: GrooveSnippet = {
  id: 'snippet-1',
  userId: 'user-1',
  title: 'Test Snippet',
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [
    {
      id: 'hh',
      category: 'hi-hat',
      presetVariety: 'Hi-Hat',
      customName: 'Hi-Hat',
      notes: Array(16).fill('none'),
      velocities: Array(16).fill(0),
    },
  ],
  tags: ['funk'],
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('SnippetEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the snippet title', () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    expect(screen.getByDisplayValue('Test Snippet')).toBeDefined();
  });

  it('updates the title and triggers auto-save', async () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const titleInput = screen.getByDisplayValue('Test Snippet');

    fireEvent.change(titleInput, {
      target: { value: 'Updated Snippet Title' },
    });

    expect(screen.getByDisplayValue('Updated Snippet Title')).toBeDefined();

    // Wait for debounce (2000ms)
    await waitFor(
      () => {
        expect(supabaseService.saveGrooveSnippet).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('adds a tag on Enter', async () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const tagInput = screen.getByPlaceholderText('+ ADD TAG');

    fireEvent.change(tagInput, { target: { value: 'linear' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('linear')).toBeDefined();

    await waitFor(
      () => {
        expect(supabaseService.saveGrooveSnippet).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: expect.arrayContaining(['funk', 'linear']),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('duplicates the snippet', async () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const duplicateBtn = screen.getByText(/Duplicate/i);
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabaseService.duplicateGrooveSnippet).toHaveBeenCalledWith('snippet-1');
      expect(mockPush).toHaveBeenCalledWith('/snippets/snippet-2');
    });
  });

  it('handles public state toggle', async () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const toggleBtn = screen.getByTestId('toggle-public-button');
    fireEvent.click(toggleBtn);

    await waitFor(
      () => {
        expect(supabaseService.saveGrooveSnippet).toHaveBeenCalledWith(
          expect.objectContaining({ isPublic: true }),
        );
      },
      { timeout: 4000 },
    );
  });

  it('handles public link for snippets', async () => {
    const publicSnippet = { ...mockSnippet, isPublic: true };
    render(<SnippetEditor initialSnippet={publicSnippet} />);

    const viewBtn = screen.getByText(/View Public/i);
    expect(viewBtn).toHaveAttribute('href', '/public/snippets/snippet-1');
  });

  it('handles error during duplication', async () => {
    supabaseService.duplicateGrooveSnippet = vi.fn().mockRejectedValue(new Error('Fail'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SnippetEditor initialSnippet={mockSnippet} />);
    fireEvent.click(screen.getByText(/Duplicate/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to duplicate snippet.');
    });
  });

  it('handles error during deletion', async () => {
    supabaseService.deleteGrooveSnippet = vi.fn().mockRejectedValue(new Error('Fail'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<SnippetEditor initialSnippet={mockSnippet} />);
    fireEvent.click(screen.getByText(/Delete/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete snippet.');
    });
  });

  it('handles auto-save error gracefully', async () => {
    supabaseService.saveGrooveSnippet = vi.fn().mockRejectedValue(new Error('Fail'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SnippetEditor initialSnippet={mockSnippet} />);
    fireEvent.change(screen.getByDisplayValue('Test Snippet'), { target: { value: 'New' } });

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith('Autosave failed:', expect.anything());
      },
      { timeout: 10000 },
    );
  }, 15000);

  it('does not attempt to update state if unmounted during save', async () => {
    vi.useFakeTimers();
    try {
      const saveSpy = vi.fn().mockResolvedValue({});
      supabaseService.saveGrooveSnippet = saveSpy;

      const { unmount } = render(<SnippetEditor initialSnippet={mockSnippet} />);
      fireEvent.change(screen.getByDisplayValue('Test Snippet'), { target: { value: 'New Name' } });

      unmount();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Verify save WAS called because cleanup calls flush() while isMountedRef.current is still true
      expect(saveSpy).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('deletes the snippet', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    supabaseService.deleteGrooveSnippet = vi.fn().mockResolvedValue({});

    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const deleteBtn = screen.getByText(/Delete/i);
    fireEvent.click(deleteBtn);

    await waitFor(
      () => {
        expect(supabaseService.deleteGrooveSnippet).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/library');
      },
      { timeout: 4000 },
    );
  });
});

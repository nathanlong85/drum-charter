import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { Notebook } from '@/lib/types/groove';
import NotebookEditor from '../NotebookEditor';

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
    saveNotebook: vi.fn().mockResolvedValue({}),
    duplicateNotebook: vi.fn().mockResolvedValue({ id: 'notebook-2' }),
    deleteNotebook: vi.fn().mockResolvedValue({}),
  },
}));

// Mock crypto.randomUUID
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => 'test-uuid' as any;
}

const mockNotebook: Notebook = {
  id: 'notebook-1',
  userId: 'user-1',
  title: 'Test Notebook',
  sections: [
    {
      id: 'section-1',
      name: 'Paradiddles',
      notes: ['Keep it even'],
    },
  ],
  tags: ['technique'],
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('NotebookEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the notebook title', () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    expect(screen.getByDisplayValue('Test Notebook')).toBeDefined();
  });

  it('updates the title and triggers auto-save', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const titleInput = screen.getByDisplayValue('Test Notebook');

    fireEvent.change(titleInput, {
      target: { value: 'Updated Notebook Title' },
    });

    expect(screen.getByDisplayValue('Updated Notebook Title')).toBeDefined();

    // Wait for debounce (2000ms)
    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('adds a new section', () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const addButton = screen.getByText(/Add New Section/i);

    fireEvent.click(addButton);

    expect(screen.getByDisplayValue('New Section')).toBeDefined();
  });

  it('removes a section', () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const removeButton = screen.getByTitle('Remove Section');

    fireEvent.click(removeButton);

    expect(screen.queryByDisplayValue('Paradiddles')).toBeNull();
  });

  it('updates section name', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const nameInput = screen.getByDisplayValue('Paradiddles');
    fireEvent.change(nameInput, { target: { value: 'Single Strokes' } });

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: expect.arrayContaining([expect.objectContaining({ name: 'Single Strokes' })]),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('updates section notes', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const notesArea = screen.getByDisplayValue('Keep it even');

    fireEvent.change(notesArea, { target: { value: 'New note line' } });

    expect(screen.getByDisplayValue('New note line')).toBeDefined();

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: expect.arrayContaining([
              expect.objectContaining({ notes: ['New note line'] }),
            ]),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('updates tags', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const tagsInput = screen.getByDisplayValue('technique');

    fireEvent.change(tagsInput, { target: { value: 'technique, rudiments' } });

    expect(screen.getByDisplayValue('technique, rudiments')).toBeDefined();

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['technique', 'rudiments'],
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('duplicates the notebook', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const duplicateBtn = screen.getByText(/duplicate/i);
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabaseService.duplicateNotebook).toHaveBeenCalledWith('notebook-1');
      expect(mockPush).toHaveBeenCalledWith('/notebooks/notebook-2');
    });
  });

  it('adds and removes a grid in a section', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const addGridBtn = screen.getByText(/\+ Add Grid/i);
    fireEvent.click(addGridBtn);

    await waitFor(
      () => {
        expect(screen.getByTestId('groove-grid')).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    const removeGridBtn = screen.getByText('Remove Grid');
    fireEvent.click(removeGridBtn);

    await waitFor(
      () => {
        expect(screen.queryByTestId('groove-grid')).toBeNull();
      },
      { timeout: 4000 },
    );
  });

  it('handles public link for notebooks', async () => {
    const publicNb = { ...mockNotebook, isPublic: true };
    render(<NotebookEditor initialNotebook={publicNb} />);

    const viewBtn = screen.getByText(/View/i);
    expect(viewBtn).toHaveAttribute('href', '/public/notebooks/notebook-1');
  });

  it('toggles public state', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const checkbox = screen.getByLabelText(/Public/i);
    fireEvent.click(checkbox);

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({ isPublic: true }),
        );
      },
      { timeout: 4000 },
    );
  });

  it('handles error during duplication', async () => {
    supabaseService.duplicateNotebook = vi.fn().mockRejectedValue(new Error('Fail'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<NotebookEditor initialNotebook={mockNotebook} />);
    fireEvent.click(screen.getByText(/duplicate/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to duplicate notebook.');
    });
  });

  it('handles error during deletion', async () => {
    supabaseService.deleteNotebook = vi.fn().mockRejectedValue(new Error('Fail'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<NotebookEditor initialNotebook={mockNotebook} />);
    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete notebook.');
    });
  });

  it('handles auto-save error gracefully', async () => {
    supabaseService.saveNotebook = vi.fn().mockRejectedValue(new Error('Fail'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<NotebookEditor initialNotebook={mockNotebook} />);
    fireEvent.change(screen.getByDisplayValue('Test Notebook'), { target: { value: 'New' } });

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to auto-save notebook:', expect.anything());
      },
      { timeout: 4000 },
    );
  });

  it('does not attempt to update state if unmounted during save', async () => {
    vi.useFakeTimers();
    const saveSpy = vi.fn().mockResolvedValue({});
    supabaseService.saveNotebook = saveSpy;

    const { unmount } = render(<NotebookEditor initialNotebook={mockNotebook} />);

    // Trigger a change to start the debounce timer
    fireEvent.change(screen.getByDisplayValue('Test Notebook'), { target: { value: 'New Name' } });

    // Unmount before the 2s debounce finishes
    unmount();

    // Fast-forward time past the 2s debounce
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Verify save was not called (because it was cancelled/skipped by unmount logic)
    // Note: lodash debounce.cancel() is called in cleanup, so it shouldn't fire
    expect(saveSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('deletes the notebook', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    supabaseService.deleteNotebook = vi.fn().mockResolvedValue({});

    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const deleteBtn = screen.getByText(/delete/i);
    fireEvent.click(deleteBtn);

    await waitFor(
      () => {
        expect(supabaseService.deleteNotebook).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/library');
      },
      { timeout: 10000 },
    );
  }, 15000);
});

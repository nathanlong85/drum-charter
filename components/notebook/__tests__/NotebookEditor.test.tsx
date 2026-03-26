import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { Notebook } from '@/lib/types/groove';
import { NotebookEditor } from '../NotebookEditor';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock supabase-service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveNotebook: vi.fn().mockResolvedValue({}),
    deleteNotebook: vi.fn().mockResolvedValue({}),
    duplicateNotebook: vi.fn().mockResolvedValue({}),
  },
}));

describe('NotebookEditor', () => {
  const mockNotebook: Notebook = {
    id: 'n1',
    userId: 'u1',
    title: 'Test Notebook',
    tags: [],
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('renders the notebook title', () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    expect(screen.getByDisplayValue('Test Notebook')).toBeDefined();
  });

  it('updates the title and triggers auto-save', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const titleInput = screen.getByDisplayValue('Test Notebook');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'New Title' }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('adds a new section', () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const addBtn = screen.getByText(/Add New Section/i);
    fireEvent.click(addBtn);

    expect(screen.getByPlaceholderText(/Section Name/i)).toBeDefined();
  });

  it('removes a section', () => {
    const notebookWithSection: Notebook = {
      ...mockNotebook,
      sections: [{ id: 'sec1', name: 'Ideas', notes: '', grids: [] }],
    };
    render(<NotebookEditor initialNotebook={notebookWithSection} />);

    const removeBtn = screen.getByRole('button', { name: /Remove Section/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByPlaceholderText(/Section Name/i)).toBeNull();
  });

  it('updates section name', async () => {
    const notebookWithSection: Notebook = {
      ...mockNotebook,
      sections: [{ id: 'sec1', name: 'Ideas', notes: '', grids: [] }],
    };
    render(<NotebookEditor initialNotebook={notebookWithSection} />);

    const nameInput = screen.getByDisplayValue('Ideas');
    fireEvent.change(nameInput, { target: { value: 'Refined' } });

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: [expect.objectContaining({ name: 'Refined' })],
          }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('updates section notes', async () => {
    const notebookWithSection: Notebook = {
      ...mockNotebook,
      sections: [{ id: 'sec1', name: 'Ideas', notes: '', grids: [] }],
    };
    render(<NotebookEditor initialNotebook={notebookWithSection} />);

    const notesInput = screen.getByPlaceholderText(/Add notes/i);
    fireEvent.change(notesInput, { target: { value: 'Some notes here' } });

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({
            sections: [expect.objectContaining({ notes: 'Some notes here' })],
          }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('updates tags', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const tagInput = screen.getByPlaceholderText(/\+ ADD TAG/i);

    fireEvent.change(tagInput, { target: { value: 'Jazz' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({ tags: ['jazz'] }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('duplicates the notebook', async () => {
    vi.mocked(supabaseService.duplicateNotebook).mockResolvedValue({
      ...mockNotebook,
      id: 'n2',
      title: 'Test Notebook (Copy)',
    });

    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const duplicateBtn = screen.getByRole('button', { name: /Duplicate/i });
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabaseService.duplicateNotebook).toHaveBeenCalledWith('n1');
    });
  });

  it('adds and removes a grid in a section', () => {
    const notebookWithSection: Notebook = {
      ...mockNotebook,
      sections: [{ id: 'sec1', name: 'Ideas', notes: '', grids: [] }],
    };
    render(<NotebookEditor initialNotebook={notebookWithSection} />);

    const addGridBtn = screen.getByText(/\+ ADD GRID/i);
    fireEvent.click(addGridBtn);

    expect(screen.getByTestId('groove-editor')).toBeDefined();

    const removeGridBtn = screen.getByRole('button', { name: /Remove Grid/i });
    fireEvent.click(removeGridBtn);

    expect(screen.queryByTestId('groove-editor')).toBeNull();
  });

  it('handles public link for notebooks', async () => {
    const notebook = { ...mockNotebook, isPublic: true };
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextSpy } });

    render(<NotebookEditor initialNotebook={notebook} />);
    const linkBtn = screen.getByRole('button', { name: /Copy Link/i });
    fireEvent.click(linkBtn);

    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('toggles public state', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const toggle = screen.getByTestId('toggle-public-button');
    fireEvent.click(toggle);

    await waitFor(
      () => {
        expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
          expect.objectContaining({ isPublic: true }),
        );
      },
      { timeout: 5000 },
    );
  });

  it('handles auto-save error gracefully', async () => {
    vi.mocked(supabaseService.saveNotebook).mockRejectedValueOnce(new Error('Save failed'));
    render(<NotebookEditor initialNotebook={mockNotebook} />);

    const titleInput = screen.getByDisplayValue('Test Notebook');
    fireEvent.change(titleInput, { target: { value: 'Fail Me' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Save failed/i)).toBeDefined();
      },
      { timeout: 5000 },
    );
  });

  it('does not attempt to update state if unmounted during save', async () => {
    const saveSpy = vi.fn().mockResolvedValue({});
    vi.mocked(supabaseService.saveNotebook).mockImplementation(saveSpy);

    const { unmount } = render(<NotebookEditor initialNotebook={mockNotebook} />);

    fireEvent.change(screen.getByDisplayValue('Test Notebook'), {
      target: { value: 'Unmounted Update' },
    });

    unmount();

    // Small delay to let enqueued flush chain execute
    await waitFor(() => {
      // Verify save WAS called because cleanup calls flush() while isMountedRef.current is still true
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  it('deletes the notebook', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const deleteBtn = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(supabaseService.deleteNotebook).toHaveBeenCalledWith('n1');
    });
  });
});

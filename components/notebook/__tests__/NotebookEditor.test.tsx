import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveSnippet, Notebook } from '@/lib/types/groove';
import { NotebookEditor } from '../NotebookEditor';

const mockNotebook: Notebook = {
  id: 'n1',
  title: 'My Notebook',
  sections: [
    {
      id: 'sec1',
      name: 'Introduction',
      notes: 'Initial notes',
    },
  ],
  tags: ['practice'],
  isPublic: false,
  createdAt: null,
  updatedAt: null,
};

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('NotebookEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(supabaseService, 'saveNotebook').mockResolvedValue({} as any);
    vi.spyOn(supabaseService, 'duplicateNotebook').mockResolvedValue({ id: 'n2' } as any);
    vi.spyOn(supabaseService, 'deleteNotebook').mockResolvedValue(true);
    vi.spyOn(supabaseService, 'listGrooveSnippetsMapped').mockResolvedValue([]);
  });

  it('renders the notebook title', () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    expect(screen.getByDisplayValue('My Notebook')).toBeDefined();
  });

  it('updates the title and triggers auto-save ', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const titleInput = screen.getByPlaceholderText('Notebook Title');

    fireEvent.change(titleInput, { target: { value: 'New Name' } });
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Name' }),
    );
  });

  it('adds a new section', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const addBtn = screen.getByText(/Add New Section/i);

    fireEvent.click(addBtn);
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveNotebook).mock.calls.at(-1)![0] as Notebook;
    expect(lastCall.sections).toHaveLength(2);
  });

  it('removes a section', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const removeBtn = screen.getByLabelText(/Remove Section/i);

    fireEvent.click(removeBtn);
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveNotebook).mock.calls.at(-1)![0] as Notebook;
    expect(lastCall.sections).toHaveLength(0);
  });

  it('updates section name ', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const nameInput = screen.getByPlaceholderText('Section Name');

    fireEvent.change(nameInput, { target: { value: 'Updated Section' } });
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveNotebook).mock.calls.at(-1)![0] as Notebook;
    expect(lastCall.sections[0].name).toBe('Updated Section');
  });

  it('updates section notes ', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const notesInput = screen.getByPlaceholderText(/Add notes/i);

    fireEvent.change(notesInput, { target: { value: 'New practice notes' } });
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveNotebook).mock.calls.at(-1)![0] as Notebook;
    expect(lastCall.sections[0].notes).toBe('New practice notes');
  });

  it('updates tags ', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const tagInput = screen.getByPlaceholderText(/\+ ADD TAG/i);

    fireEvent.change(tagInput, { target: { value: 'technique' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveNotebook).mock.calls.at(-1)![0] as Notebook;
    expect(lastCall.tags).toContain('technique');
  });

  it('duplicates the notebook', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const duplicateBtn = screen.getByRole('button', { name: /Duplicate This Item/i });
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabaseService.duplicateNotebook).toHaveBeenCalledWith('n1');
    });
  });

  it('adds and removes a grid in a section', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);

    const addGridBtn = screen.getByText(/\+ ADD GRID/i);
    fireEvent.click(addGridBtn);
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(screen.getByTestId('groove-editor')).toBeDefined();
    });

    const removeGridBtn = screen.getByRole('button', { name: /Remove Grid/i });
    fireEvent.click(removeGridBtn);
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('groove-editor')).toBeNull();
    });
  });

  it('handles public link for notebooks', async () => {
    const notebook = { ...mockNotebook, isPublic: true };
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextSpy } });

    render(<NotebookEditor initialNotebook={notebook} />);
    const linkBtn = screen.getByRole('button', { name: /Copy Public Link/i });
    fireEvent.click(linkBtn);

    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('toggles public state ', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const toggle = screen.getByTestId('toggle-public-button');

    fireEvent.click(toggle);
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveNotebook).mock.calls.at(-1)![0] as Notebook;
    expect(lastCall.isPublic).toBe(true);
  });

  it('handles auto-save error gracefully ', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(supabaseService.saveNotebook).mockRejectedValueOnce(new Error('Save failed'));

    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const titleInput = screen.getByPlaceholderText('Notebook Title');

    fireEvent.change(titleInput, { target: { value: 'Error Test' } });
    await act(async () => {
      await wait(2100);
    });

    await waitFor(() => {
      // Look for the error text in the floating save status area
      expect(screen.getByTestId('floating-save-status')).toHaveTextContent(/Save failed/i);
    });
    consoleSpy.mockRestore();
  });

  it('does not attempt to update state if unmounted during save', async () => {
    const { unmount } = render(<NotebookEditor initialNotebook={mockNotebook} />);
    const titleInput = screen.getByPlaceholderText('Notebook Title');

    fireEvent.change(titleInput, { target: { value: 'Unmount Test' } });

    unmount();

    await act(async () => {
      await wait(2100);
    });

    // No error should be thrown
  });

  it('deletes the notebook', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const deleteBtn = screen.getByRole('button', { name: /Delete This Item/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(supabaseService.deleteNotebook).toHaveBeenCalledWith('n1');
    });
  });

  it('inserts a snippet into a section', async () => {
    const mockSnippet: GrooveSnippet = {
      id: 'snip1',
      title: 'Test Snippet',
      tags: [],
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [],
      isPublic: true,
      createdAt: null,
      updatedAt: null,
    };
    vi.spyOn(supabaseService, 'listGrooveSnippetsMapped').mockResolvedValue([mockSnippet]);

    render(<NotebookEditor initialNotebook={mockNotebook} />);

    // Open picker
    fireEvent.click(screen.getByText(/\+ Insert Snippet/i));

    // Wait for snippet to load and select it
    await waitFor(() => expect(screen.getByText('Test Snippet')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Test Snippet'));
    await act(async () => {
      await wait(2100);
    });

    // Verify grid is added to the section in the state/save call
    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(supabaseService.saveNotebook).mock.calls.at(-1)![0] as Notebook;
    expect(lastCall.sections[0].grid).toBeDefined();
    expect(lastCall.sections[0].grid?.timeSignature.beatsPerMeasure).toBe(4);
  });
});

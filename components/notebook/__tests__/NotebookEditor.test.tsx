import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotebookEditor from '../NotebookEditor';
import { Notebook } from '@/lib/types/groove';
import { supabaseService } from '@/lib/services/supabase-service';

// Mock Supabase service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveNotebook: vi.fn().mockResolvedValue({}),
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
    
    fireEvent.change(titleInput, { target: { value: 'Updated Notebook Title' } });
    
    expect(screen.getByDisplayValue('Updated Notebook Title')).toBeDefined();
    
    // Wait for debounce (2000ms)
    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalled();
    }, { timeout: 3000 });
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

  it('updates section notes', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const notesArea = screen.getByDisplayValue('Keep it even');
    
    fireEvent.change(notesArea, { target: { value: 'New note line' } });
    
    expect(screen.getByDisplayValue('New note line')).toBeDefined();
    
    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({ notes: ['New note line'] })
          ])
        })
      );
    }, { timeout: 3000 });
  });

  it('updates tags', async () => {
    render(<NotebookEditor initialNotebook={mockNotebook} />);
    const tagsInput = screen.getByDisplayValue('technique');
    
    fireEvent.change(tagsInput, { target: { value: 'technique, rudiments' } });
    
    expect(screen.getByDisplayValue('technique, rudiments')).toBeDefined();
    
    await waitFor(() => {
      expect(supabaseService.saveNotebook).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['technique', 'rudiments']
        })
      );
    }, { timeout: 3000 });
  });
});

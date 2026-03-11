import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SnippetEditor from '../SnippetEditor';
import { GrooveSnippet } from '@/lib/types/groove';
import { supabaseService } from '@/lib/services/supabase-service';

// Mock Supabase service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveGrooveSnippet: vi.fn().mockResolvedValue({}),
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
    { instrumentId: 'hh', label: 'Hi-Hat', notes: Array(16).fill('none') },
  ],
  tags: ['funk'],
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
    
    fireEvent.change(titleInput, { target: { value: 'Updated Snippet Title' } });
    
    expect(screen.getByDisplayValue('Updated Snippet Title')).toBeDefined();
    
    // Wait for debounce (2000ms)
    await waitFor(() => {
      expect(supabaseService.saveGrooveSnippet).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('adds a tag on Enter', async () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const tagInput = screen.getByPlaceholderText('Add tag...');
    
    fireEvent.change(tagInput, { target: { value: 'linear' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('#linear')).toBeDefined();
    
    await waitFor(() => {
      expect(supabaseService.saveGrooveSnippet).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: expect.arrayContaining(['funk', 'linear'])
        })
      );
    }, { timeout: 3000 });
  });
});

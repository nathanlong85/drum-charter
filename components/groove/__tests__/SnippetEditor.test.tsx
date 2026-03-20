import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveSnippet } from '@/lib/types/groove';
import SnippetEditor from '../SnippetEditor';

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
    const tagInput = screen.getByPlaceholderText('Add tag...');

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
});

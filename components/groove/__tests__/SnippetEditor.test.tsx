import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveSnippet } from '@/lib/types/groove';
import { SnippetEditor } from '../SnippetEditor';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock supabase-service
vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveGrooveSnippet: vi.fn().mockResolvedValue({}),
    deleteGrooveSnippet: vi.fn().mockResolvedValue({}),
    duplicateGrooveSnippet: vi.fn().mockResolvedValue({}),
    listGrooveSnippetsMapped: vi.fn().mockResolvedValue([]),
  },
}));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('SnippetEditor', () => {
  const mockSnippet: GrooveSnippet = {
    id: 'sn1',
    ownerId: 'u1',
    title: 'Test Snippet',
    tags: [],
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bpm: 120,
    measures: 1,
    resolution: 4,
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
    instruments: [],
  };

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

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'New Title' } });
      await wait(2100);
    });

    expect(supabaseService.saveGrooveSnippet).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Title' }),
    );
  });

  it('adds a tag on Enter', async () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const tagInput = screen.getByPlaceholderText(/\+ ADD TAG/i);

    await act(async () => {
      fireEvent.change(tagInput, { target: { value: 'Funk' } });
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });
      await wait(2100);
    });

    expect(supabaseService.saveGrooveSnippet).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['funk'] }),
    );
  });

  it('duplicates the snippet', async () => {
    vi.mocked(supabaseService.duplicateGrooveSnippet).mockResolvedValue({
      ...mockSnippet,
      id: 'sn2',
      title: 'Test Snippet (Copy)',
    });

    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const duplicateBtn = screen.getByRole('button', { name: /Duplicate This Item/i });

    await act(async () => {
      fireEvent.click(duplicateBtn);
      await wait(2100);
    });

    expect(supabaseService.duplicateGrooveSnippet).toHaveBeenCalledWith('sn1');
  });

  it('handles public state toggle', async () => {
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const toggle = screen.getByTestId('toggle-public-button');

    await act(async () => {
      fireEvent.click(toggle);
      await wait(2100);
    });

    expect(supabaseService.saveGrooveSnippet).toHaveBeenCalledWith(
      expect.objectContaining({ isPublic: true }),
    );
  });

  it('handles public link for snippets', async () => {
    const snippet = { ...mockSnippet, isPublic: true };
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextSpy } });

    render(<SnippetEditor initialSnippet={snippet} />);
    const linkBtn = screen.getByRole('button', { name: /Copy Public Link/i });
    fireEvent.click(linkBtn);

    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('handles auto-save error gracefully', async () => {
    vi.mocked(supabaseService.saveGrooveSnippet).mockRejectedValueOnce(new Error('Save failed'));
    render(<SnippetEditor initialSnippet={mockSnippet} />);

    const titleInput = screen.getByDisplayValue('Test Snippet');

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Fail Me' } });
      await wait(2100);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Save failed/i).length).toBeGreaterThan(0);
    });
  });

  it('does not attempt to update state if unmounted during save', async () => {
    const saveSpy = vi.fn().mockResolvedValue({});
    vi.mocked(supabaseService.saveGrooveSnippet).mockImplementation(saveSpy);

    const { unmount } = render(<SnippetEditor initialSnippet={mockSnippet} />);

    fireEvent.change(screen.getByDisplayValue('Test Snippet'), {
      target: { value: 'Unmounted Update' },
    });

    unmount();

    await act(async () => {
      await wait(2100);
    });

    // cleanup flushes
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  it('deletes the snippet', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SnippetEditor initialSnippet={mockSnippet} />);
    const deleteBtn = screen.getByRole('button', { name: /Delete This Item/i });

    await act(async () => {
      fireEvent.click(deleteBtn);
      await wait(2100);
    });

    expect(supabaseService.deleteGrooveSnippet).toHaveBeenCalledWith('sn1');
  });
});

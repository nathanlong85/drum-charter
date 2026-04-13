import * as Tooltip from '@radix-ui/react-tooltip';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteItemAction,
  duplicateItemAction,
  saveGrooveSnippetAction,
} from '@/lib/actions/item-actions';
import type { GrooveSnippet } from '@/lib/types/groove';
import { SnippetEditor } from '../SnippetEditor';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock item-actions
vi.mock('@/lib/actions/item-actions', () => ({
  saveGrooveSnippetAction: vi.fn().mockResolvedValue({ success: true }),
  duplicateItemAction: vi.fn().mockResolvedValue({ success: true, data: { id: 'sn2' } }),
  deleteItemAction: vi.fn().mockResolvedValue({ success: true }),
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

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<Tooltip.Provider>{ui}</Tooltip.Provider>);
};

describe('SnippetEditor', () => {
  const mockSnippet: GrooveSnippet = {
    id: 'sn1',
    userId: 'u1',
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
    renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);
    expect(screen.getByDisplayValue('Test Snippet')).toBeDefined();
  });

  it('updates the title and triggers auto-save', async () => {
    renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);
    const titleInput = screen.getByDisplayValue('Test Snippet');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    await act(async () => {
      await wait(2500);
    });

    await waitFor(
      () => {
        expect(saveGrooveSnippetAction).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'New Title' }),
        );
      },
      { timeout: 2000 },
    );
  }, 10000);

  it('adds a tag on Enter', async () => {
    renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);
    const tagInput = screen.getByPlaceholderText(/\+ ADD TAG/i);

    fireEvent.change(tagInput, { target: { value: 'Funk' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await act(async () => {
      await wait(2500);
    });

    await waitFor(
      () => {
        expect(saveGrooveSnippetAction).toHaveBeenCalledWith(
          expect.objectContaining({ tags: ['funk'] }),
        );
      },
      { timeout: 2000 },
    );
  }, 10000);

  it('duplicates the snippet', async () => {
    renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);
    const duplicateBtn = screen.getByRole('button', { name: /Duplicate This Item/i });

    fireEvent.click(duplicateBtn);

    await act(async () => {
      await wait(2500);
    });

    await waitFor(
      () => {
        expect(duplicateItemAction).toHaveBeenCalledWith('sn1', 'snippet');
      },
      { timeout: 2000 },
    );
  }, 10000);

  it('handles public state toggle', async () => {
    renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);
    const toggle = screen.getByTestId('toggle-public-button');

    fireEvent.click(toggle);

    await act(async () => {
      await wait(2500);
    });

    await waitFor(
      () => {
        expect(saveGrooveSnippetAction).toHaveBeenCalledWith(
          expect.objectContaining({ isPublic: true }),
        );
      },
      { timeout: 2000 },
    );
  }, 10000);

  it('handles public link for snippets', async () => {
    const snippet = { ...mockSnippet, isPublic: true };
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextSpy } });

    renderWithProviders(<SnippetEditor initialSnippet={snippet} />);
    const linkBtn = screen.getByRole('button', { name: /Copy Public Link/i });
    fireEvent.click(linkBtn);

    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('handles auto-save error gracefully', async () => {
    vi.mocked(saveGrooveSnippetAction).mockRejectedValueOnce(new Error('Save failed'));
    renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);

    const titleInput = screen.getByDisplayValue('Test Snippet');

    fireEvent.change(titleInput, { target: { value: 'Fail Me' } });

    await act(async () => {
      await wait(2500);
    });

    await waitFor(
      () => {
        expect(screen.getAllByText(/Save failed/i).length).toBeGreaterThan(0);
      },
      { timeout: 2000 },
    );
  }, 10000);

  it('does not attempt to update state if unmounted during save', async () => {
    const saveSpy = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(saveGrooveSnippetAction).mockImplementation(saveSpy);

    const { unmount } = renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);

    fireEvent.change(screen.getByDisplayValue('Test Snippet'), {
      target: { value: 'Unmounted Update' },
    });

    unmount();

    await act(async () => {
      await wait(2500);
    });

    // cleanup flushes
    await waitFor(
      () => {
        expect(saveSpy).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
  }, 10000);

  it('deletes the snippet', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithProviders(<SnippetEditor initialSnippet={mockSnippet} />);
    const deleteBtn = screen.getByRole('button', { name: /Delete This Item/i });

    fireEvent.click(deleteBtn);

    await act(async () => {
      await wait(2500);
    });

    await waitFor(
      () => {
        expect(deleteItemAction).toHaveBeenCalledWith('sn1', 'snippet');
      },
      { timeout: 2000 },
    );
  }, 10000);
});

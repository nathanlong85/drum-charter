import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listGrooveSnippetsAction } from '@/lib/actions/item-actions';
import type { GrooveSnippet } from '@/lib/types/groove';
import { SnippetPickerModal } from '../SnippetPickerModal';

const { mockSnippets } = vi.hoisted(() => {
  const snippets: GrooveSnippet[] = [
    {
      id: 's1',
      title: 'Funky Groove',
      tags: ['funk'],
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 's2',
      title: 'Jazz Swing',
      tags: ['jazz'],
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  return { mockSnippets: snippets };
});

// Mock item-actions
vi.mock('@/lib/actions/item-actions', () => ({
  listGrooveSnippetsAction: vi.fn().mockResolvedValue(mockSnippets),
}));

describe('SnippetPickerModal', () => {
  const onClose = vi.fn();
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listGrooveSnippetsAction).mockResolvedValue(mockSnippets);
  });

  it('renders loading state then snippets', async () => {
    render(<SnippetPickerModal onClose={onClose} onSelect={onSelect} />);

    expect(screen.getByText(/Accessing Library.../i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Funky Groove')).toBeDefined();
      expect(screen.getByText('Jazz Swing')).toBeDefined();
    });
  });

  it('filters snippets by search query', async () => {
    render(<SnippetPickerModal onClose={onClose} onSelect={onSelect} />);

    await waitFor(() => screen.getByText('Funky Groove'));

    const searchInput = screen.getByPlaceholderText(/Search by title or tag.../i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'jazz' } });
    });

    expect(screen.queryByText('Funky Groove')).toBeNull();
    expect(screen.getByText('Jazz Swing')).toBeDefined();
  });

  it('calls onSelect when a snippet is clicked', async () => {
    render(<SnippetPickerModal onClose={onClose} onSelect={onSelect} />);

    await waitFor(() => screen.getByText('Funky Groove'));

    await act(async () => {
      fireEvent.click(screen.getByText('Funky Groove'));
    });

    expect(onSelect).toHaveBeenCalledWith(mockSnippets[0]);
  });

  it('calls onClose when cancel is clicked', async () => {
    render(<SnippetPickerModal onClose={onClose} onSelect={onSelect} />);

    await waitFor(() => screen.getByText('Funky Groove'));

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('shows error state on failure', async () => {
    vi.mocked(listGrooveSnippetsAction).mockRejectedValueOnce(new Error('Fetch failed'));

    render(<SnippetPickerModal onClose={onClose} onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load snippets/i)).toBeDefined();
    });
  });
});

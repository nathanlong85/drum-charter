import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import LibraryHeader from '../LibraryHeader';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('LibraryHeader', () => {
  it('renders the title and description', () => {
    (usePathname as unknown).mockReturnValue('/library/songs');
    render(<LibraryHeader />);

    expect(screen.getByText('My Library')).toBeDefined();
    expect(screen.getByText(/Manage your songs/i)).toBeDefined();
  });

  it('renders all tabs', () => {
    (usePathname as unknown).mockReturnValue('/library/songs');
    render(<LibraryHeader />);

    expect(screen.getByTestId('tab-songs')).toBeDefined();
    expect(screen.getByTestId('tab-notebooks')).toBeDefined();
    expect(screen.getByTestId('tab-snippets')).toBeDefined();
    expect(screen.getByTestId('tab-setlists')).toBeDefined();
  });

  it('highlights the active tab', () => {
    (usePathname as unknown).mockReturnValue('/library/notebooks');
    render(<LibraryHeader />);

    const notebooksTab = screen.getByTestId('tab-notebooks');
    expect(notebooksTab.getAttribute('aria-selected')).toBe('true');
    expect(notebooksTab.className).toContain('bg-surface-container-highest');

    const songsTab = screen.getByTestId('tab-songs');
    expect(songsTab.getAttribute('aria-selected')).toBe('false');
  });
});

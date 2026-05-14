import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSupabaseStatus } from '@/lib/hooks/useSupabaseStatus';
import { AppShell } from '../AppShell';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock useSupabaseStatus
vi.mock('@/lib/hooks/useSupabaseStatus', () => ({
  useSupabaseStatus: vi.fn(),
}));

// Mock AuthStatus to avoid Supabase client initialization
vi.mock('@/components/auth/AuthStatus', () => ({
  AuthStatus: () => <div data-testid="auth-status">Auth Status</div>,
}));

// Mock Tooltip and TooltipProvider
vi.mock('@/components/common/Tooltip', () => ({
  TooltipProvider: ({ children }: Record<string, unknown>) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  Tooltip: ({ children, content }: Record<string, unknown>) => (
    <div data-testid="mock-tooltip" data-content={content}>
      {children}
    </div>
  ),
}));

// Partially mock react to control useTransition
vi.mock('react', async (importOriginal) => {
  const actual: unknown = await importOriginal();
  return {
    ...actual,
    useTransition: vi.fn(),
  };
});

describe('AppShell', () => {
  const mockRefresh = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown).mockReturnValue({
      refresh: mockRefresh,
      push: mockPush,
    });
    (usePathname as unknown).mockReturnValue('/dashboard');
    (useSupabaseStatus as unknown).mockReturnValue('connected');

    // Default useTransition mock
    (useTransition as unknown).mockReturnValue([false, (cb: () => void) => cb()]);
  });

  it('renders children correctly', () => {
    render(
      <AppShell>
        <div data-testid="test-child">Child Content</div>
      </AppShell>,
    );

    expect(screen.getByTestId('test-child')).toBeDefined();
    expect(screen.getByText('Child Content')).toBeDefined();
  });

  it('renders navigation items', () => {
    render(<AppShell>Content</AppShell>);

    // Use getAllByText because they appear in both sidebar and bottom nav
    expect(screen.getAllByText('Dashboard')).toBeDefined();
    expect(screen.getAllByText('Songs')).toBeDefined();
    expect(screen.getAllByText('Notebooks')).toBeDefined();
    expect(screen.getAllByText('Snippets')).toBeDefined();
  });

  it('marks the current path as active', () => {
    (usePathname as unknown).mockReturnValue('/library/songs');
    render(<AppShell>Content</AppShell>);

    // The Link component has data-active attribute
    const songsLinks = screen.getAllByRole('link', { name: /Songs/i });
    let foundActive = false;
    for (const link of songsLinks) {
      if (link.getAttribute('data-active') === 'true') {
        foundActive = true;
        break;
      }
    }
    expect(foundActive).toBe(true);
  });

  it('calls router.refresh() when the refresh button is clicked', async () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    const refreshButton = screen.getByLabelText('Refresh data');
    fireEvent.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows spinning icon when pending', async () => {
    // Mock isPending as true
    (useTransition as unknown).mockReturnValue([true, (cb: () => void) => cb()]);

    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    const refreshButton = screen.getByLabelText('Refresh data');
    expect(refreshButton).toBeDisabled();

    const icon = refreshButton.querySelector('svg');
    expect(icon?.classList.contains('animate-spin')).toBe(true);
  });
});

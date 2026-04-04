import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSupabaseStatus } from '@/lib/hooks/useSupabaseStatus';
import { AppShell } from '../AppShell';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
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
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children, content }: any) => (
    <div data-testid="mock-tooltip" data-content={content}>
      {children}
    </div>
  ),
}));

// Partially mock react to control useTransition
vi.mock('react', async (importOriginal) => {
  const actual: any = await importOriginal();
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
    (useRouter as any).mockReturnValue({
      refresh: mockRefresh,
      push: mockPush,
    });
    (usePathname as any).mockReturnValue('/');
    (useSearchParams as any).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    });
    (useSupabaseStatus as any).mockReturnValue('connected');

    // Default useTransition mock
    (useTransition as any).mockReturnValue([false, (cb: () => void) => cb()]);
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

  it('wraps the refresh button in a tooltip with correct content', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    const tooltip = screen.getByTestId('mock-tooltip');
    expect(tooltip.getAttribute('data-content')).toBe('Refresh data from cloud');

    const refreshButton = screen.getByLabelText('Refresh data');
    expect(tooltip.contains(refreshButton)).toBe(true);
  });

  it('disables the button and shows spinning icon when pending', async () => {
    // Mock isPending as true
    (useTransition as any).mockReturnValue([true, (cb: () => void) => cb()]);

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

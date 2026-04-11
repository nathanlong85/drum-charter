import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthStatus } from '../AuthStatus';

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSignOutAction = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/app/auth/actions', () => ({
  signOutAction: (...args: any[]) => mockSignOutAction(...args),
}));

const mockFrom = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signOut: vi.fn(),
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  }),
}));

describe('AuthStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    mockGetUser.mockImplementation(() => new Promise(() => {})); // Never resolves to keep it loading
    render(<AuthStatus />);
    expect(screen.getByRole('status', { name: 'Loading user profile' })).toBeInTheDocument();
  });

  it('renders sign in button when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<AuthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    expect(screen.getByText('Sign In').closest('a')).toHaveAttribute('href', '/login');
  });

  it('renders dropdown trigger and items for authenticated users', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          app_metadata: { tier: 'pro' },
        },
      },
    });
    render(<AuthStatus />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-user-avatar')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const trigger = screen.getByTestId('auth-user-avatar');

    // Open the dropdown
    await user.click(trigger);

    // Verify content
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('PRO ACCOUNT')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls signOutAction when Sign Out is selected from dropdown', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
    });
    render(<AuthStatus />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-user-avatar')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId('auth-user-avatar'));

    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Sign Out'));
    expect(mockSignOutAction).toHaveBeenCalled();
  });
});

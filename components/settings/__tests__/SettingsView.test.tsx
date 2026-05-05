import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateProfileAction } from '@/app/(app)/settings/actions';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import type { UserProfile } from '@/lib/types/user';
import SettingsView from '../SettingsView';

// Mock the server action
vi.mock('@/app/(app)/settings/actions', () => ({
  updateProfileAction: vi.fn(),
}));

const mockProfile: UserProfile = {
  id: 'user-123',
  username: 'groove_master',
  display_name: 'The Drummer',
  avatar_url: null,
  preferences: {
    theme: 'system',
    defaultTimeSignature: { numerator: 4, denominator: 4 },
  },
  updated_at: null,
};

describe('SettingsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders correctly with initial profile data', () => {
    render(
      <ThemeProvider>
        <SettingsView profile={mockProfile} />
      </ThemeProvider>,
    );

    expect(screen.getByDisplayValue('The Drummer')).toBeDefined();
    expect(screen.getByDisplayValue('groove_master')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('handles display name change', () => {
    render(
      <ThemeProvider>
        <SettingsView profile={mockProfile} />
      </ThemeProvider>,
    );
    const input = screen.getByDisplayValue('The Drummer') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(input.value).toBe('New Name');
  });

  it('submits form correctly', async () => {
    (updateProfileAction as any).mockResolvedValue({ success: true });
    render(
      <ThemeProvider>
        <SettingsView profile={mockProfile} />
      </ThemeProvider>,
    );

    const saveButton = screen.getByText('Save Configuration');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateProfileAction).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: 'The Drummer',
          preferences: expect.objectContaining({
            theme: 'system',
          }),
        }),
      );
    });

    expect(screen.getByText('Configuration Updated Successfully')).toBeDefined();
  });

  it('displays error message on failure', async () => {
    (updateProfileAction as any).mockResolvedValue({ error: 'Update failed' });
    render(
      <ThemeProvider>
        <SettingsView profile={mockProfile} />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText('Save Configuration'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeDefined();
    });
  });

  it('changes theme selection', () => {
    render(
      <ThemeProvider>
        <SettingsView profile={mockProfile} />
      </ThemeProvider>,
    );
    const darkButton = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(darkButton);

    // Check if the button has the active classes
    expect(darkButton.className).toContain('bg-primary/10');
  });
});

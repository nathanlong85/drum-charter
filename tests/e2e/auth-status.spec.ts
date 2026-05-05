import { expect, test } from '@playwright/test';

test.describe('Auth Status & User Menu', () => {
  test('User menu should be interactive and show correct information', async ({ page }) => {
    // Navigate to the app (using auth setup)
    await page.goto('/');

    // Check if the user avatar is visible
    const avatar = page.getByTestId('auth-user-avatar');
    await expect(avatar).toBeVisible({ timeout: 15000 });

    // Click the avatar
    await avatar.click();

    // Check if the dropdown menu is visible
    const _menu = page.getByRole('menu');
    await expect(page.getByTestId('auth-user-email')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    const signOutBtn = page.getByText('Sign Out');
    await expect(signOutBtn).toBeVisible();
  });

  test.describe('Logout Flow', () => {
    // Use fresh context for logout to avoid breaking shared auth state
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Should allow user to sign out and redirect to landing page', async ({ page }) => {
      // Manual login first since we're using empty storageState
      await page.goto('/login');
      await page.getByLabel(/Email/i).fill('test@example.com');
      await page.getByLabel(/Password/i).fill('password123');
      await page.getByRole('button', { name: /Log In/i }).click();
      await page.waitForURL('/dashboard');

      const avatar = page.getByTestId('auth-user-avatar');
      await avatar.click();

      const signOutBtn = page.getByText('Sign Out');
      await signOutBtn.click();

      // Verify redirect to landing page
      await page.waitForURL('http://localhost:3001/', { timeout: 15000 });
      await expect(page.getByText(/Drum Charting for Professionals/i).first()).toBeVisible();
    });
  });

  test('Should not be stuck in loading state', async ({ page }) => {
    // This test checks that the loading skeleton disappears
    await page.goto('/');

    // The loading skeleton has role="status" and aria-label="Loading user profile"
    const skeleton = page.getByRole('status', { name: 'Loading user profile' });

    // It might be visible briefly, but it should disappear
    // We wait for the actual avatar or the sign in button
    const authState = page.getByTestId('auth-user-avatar').or(page.getByText('Sign In'));
    await expect(authState).toBeVisible();

    await expect(skeleton).not.toBeVisible();
  });
});

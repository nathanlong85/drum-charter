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

    // Skip logout in shared session to avoid breaking other tests
    // await signOutBtn.click();
    // await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
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

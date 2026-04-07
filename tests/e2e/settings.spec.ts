import { expect, test } from '@playwright/test';

test.describe('User Identity & Preferences', () => {
  // Use the storage state from auth.setup.ts
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Update Display Name and reflect in Dashboard', async ({ page }) => {
    await test.step('Navigate to Settings', async () => {
      await page.goto('/settings');
      await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible();
    });

    await test.step('Change Display Name', async () => {
      const nameInput = page.locator('label:has-text("Display Name") + input');
      await nameInput.fill('The Beat Master');
      await page.click('button:has-text("Save Configuration")');
      await expect(page.getByText('Configuration Updated Successfully')).toBeVisible();
    });

    await test.step('Verify in Dashboard', async () => {
      await page.goto('/');
      await expect(page.getByText('Welcome back, The Beat Master')).toBeVisible();
    });
  });

  test('Theme persistence across reloads', async ({ page }) => {
    await page.goto('/settings');

    await test.step('Switch to Dark Theme', async () => {
      await page.click('button:has-text("Dark")');
      await page.click('button:has-text("Save Configuration")');
      await expect(page.getByText('Configuration Updated Successfully')).toBeVisible();
      await expect(page.locator('html')).toHaveClass(/dark/);
    });

    await test.step('Reload and verify', async () => {
      await page.reload();
      await expect(page.locator('html')).toHaveClass(/dark/);
    });

    await test.step('Switch back to Light Theme', async () => {
      await page.click('button:has-text("Light")');
      await page.click('button:has-text("Save Configuration")');
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    });
  });

  test('Default Time Signature preference', async ({ page }) => {
    await page.goto('/settings');

    await test.step('Set default to 6/8', async () => {
      const numInput = page.locator('input[type="number"]');
      const denSelect = page.locator('select');

      await numInput.fill('6');
      await denSelect.selectOption('8');

      await page.click('button:has-text("Save Configuration")');
      await expect(page.getByText('Configuration Updated Successfully')).toBeVisible();
    });

    await test.step('Create new song and verify 6/8', async () => {
      await page.goto('/');
      await page.click('button:has-text("New Song Chart")');

      // Wait for navigation to song editor
      await expect(page).toHaveURL(/\/songs\/.+/, { timeout: 15000 });

      // Wait for song editor to load (check for placeholder)
      await expect(page.getByPlaceholder(/Song Title/i)).toBeVisible({ timeout: 15000 });

      // Check for 6/8 indicator
      // In SongEditor, these are inputs/selects, so we check values
      const beatsInput = page.locator('[data-testid="time-signature-beats"]');
      const beatValueSelect = page.locator('[data-testid="time-signature-value"]');

      await expect(beatsInput).toHaveValue('6', { timeout: 5000 });
      await expect(beatValueSelect).toHaveValue('8', { timeout: 5000 });
    });
  });
});

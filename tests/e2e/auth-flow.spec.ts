import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Authentication and Core Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library/songs');
  });

  test('User can see library and navigate to existing items', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /My Library/i })).toBeVisible();
    await expect(page.getByTestId('tab-songs')).toBeVisible();
    await expect(page.getByTestId('tab-notebooks')).toBeVisible();
    await expect(page.getByTestId('tab-snippets')).toBeVisible();
  });

  test('User can create and edit a new snippet with persistence', async ({ page }) => {
    // Switch to Snippets tab
    await page.getByTestId('tab-snippets').click();

    // Create new snippet
    await expect(page.getByTestId('create-new-button')).toHaveText(/New snippet/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();

    // Should redirect to snippet editor
    await expect(page).toHaveURL(/\/snippets\/.+/);

    const titleInput = page.getByPlaceholder(/Snippet Title/i);
    const uniqueTitle = `Auth Snippet ${Date.now()}`;
    await titleInput.fill(uniqueTitle);

    // Wait for save
    await waitForSave(page);

    // Additional wait to ensure DB is truly updated
    await page.waitForTimeout(2000);

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // Check if title persisted
    const reloadedTitleInput = page.getByPlaceholder(/Snippet Title/i);
    await expect(reloadedTitleInput).toHaveValue(uniqueTitle, { timeout: 20000 });
  });

  test('User can create and edit a new notebook', async ({ page }) => {
    // Switch to Notebooks tab
    await page.getByTestId('tab-notebooks').click();

    // Create new notebook
    await expect(page.getByTestId('create-new-button')).toHaveText(/New notebook/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();

    // Should redirect to notebook editor
    await expect(page).toHaveURL(/\/notebooks\/.+/);

    // Edit title
    const titleInput = page.getByPlaceholder(/Notebook Title/i);
    const uniqueTitle = `My Notebook ${Date.now()}`;
    await titleInput.clear();
    await titleInput.fill(uniqueTitle);

    // Wait for auto-save
    await waitForSave(page);
  });
});

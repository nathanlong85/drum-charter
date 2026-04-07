import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Snippet Integration', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Sign in as guest
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // 2. Create a snippet to use for integration
    // Use direct navigation to be sure
    await page.goto('/library?tab=snippet');
    await page.waitForURL(/tab=snippet/);

    await page.getByTestId('create-new-button').click();

    await page.waitForURL(/\/snippets\/.+/);

    await page.getByPlaceholder(/Snippet Title/i).fill('Integration Test Snippet');
    await waitForSave(page);

    // Go back to library
    await page.goto('/library');
  });

  test('should insert a snippet into a song chart', async ({ page }) => {
    // 1. Create a new song
    await page.goto('/library?tab=song');
    await page.waitForURL(/tab=song/);
    await page.getByTestId('create-new-button').click();
    await page.waitForURL(/\/songs\/.+/);

    // 2. Add a section
    await page.getByRole('button', { name: /Add New Section/i }).click();

    // 3. Open snippet picker via "+ Insert Snippet"
    const insertBtn = page.getByTestId('insert-snippet-button').first();
    await expect(insertBtn).toBeVisible({ timeout: 15000 });
    await insertBtn.click();

    // 4. Select the snippet
    const snippetItem = page.getByRole('button', {
      name: /Select snippet: Integration Test Snippet/i,
    });
    await expect(snippetItem).toBeVisible({ timeout: 15000 });
    await snippetItem.click();

    // 5. Verify grid is visible in the song section
    await expect(page.getByTestId('groove-editor')).toBeVisible();

    // 6. Verify persistence
    await waitForSave(page);
    await page.reload();
    await expect(page.getByTestId('groove-editor')).toBeVisible();
  });

  test('should insert a snippet into a notebook', async ({ page }) => {
    // 1. Create a new notebook
    await page.goto('/library?tab=notebook');
    await page.waitForURL(/tab=notebook/);
    await page.getByTestId('create-new-button').click();
    await page.waitForURL(/\/notebooks\/.+/);

    // 2. Add a section
    await page.getByRole('button', { name: /Add New Section/i }).click();

    // 3. Open snippet picker via "+ Insert Snippet"
    const insertBtn = page.getByTestId('insert-snippet-button').first();
    await expect(insertBtn).toBeVisible({ timeout: 15000 });
    await insertBtn.click();

    // 4. Select the snippet
    const snippetItem = page.getByRole('button', {
      name: /Select snippet: Integration Test Snippet/i,
    });
    await expect(snippetItem).toBeVisible({ timeout: 15000 });
    await snippetItem.click();

    // 5. Verify grid is visible in the notebook section
    await expect(page.getByTestId('groove-editor')).toBeVisible();

    // 6. Verify persistence
    await waitForSave(page);
    await page.reload();
    await expect(page.getByTestId('groove-editor')).toBeVisible();
  });
});

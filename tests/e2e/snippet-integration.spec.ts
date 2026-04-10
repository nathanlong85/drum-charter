import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Snippet Integration', () => {
  let snippetTitle: string;

  test.beforeEach(async ({ page }) => {
    // 1. Create a snippet to use for integration
    // Use direct navigation to be sure
    await page.goto('/library/snippets');
    await page.waitForURL(/\/library\/snippets/);

    await page.getByTestId('create-new-button').click();

    await page.waitForURL(/\/snippets\/.+/);

    const uniqueTitle = `Integration Snippet ${Date.now()}`;
    await page.getByPlaceholder(/Snippet Title/i).fill(uniqueTitle);
    await waitForSave(page);

    // Store title for use in tests
    snippetTitle = uniqueTitle;

    // Go back to library
    await page.goto('/library');
  });

  test('should insert a snippet into a song chart', async ({ page }) => {
    // 1. Create a new song
    await page.goto('/library/songs');
    await page.waitForURL(/\/library\/songs/);
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
      name: new RegExp(`Select snippet: ${snippetTitle}`, 'i'),
    });
    await expect(snippetItem).toBeVisible({ timeout: 15000 });
    await snippetItem.click();

    // 5. Verify grid is visible in the song section
    await expect(page.getByTestId('groove-grid')).toBeVisible();

    // 6. Verify persistence
    await waitForSave(page);
    await page.reload();
    await expect(page.getByTestId('groove-grid')).toBeVisible();
  });

  test('should insert a snippet into a notebook', async ({ page }) => {
    // 1. Create a new notebook
    await page.goto('/library/notebooks');
    await page.waitForURL(/\/library\/notebooks/);
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
      name: new RegExp(`Select snippet: ${snippetTitle}`, 'i'),
    });
    await expect(snippetItem).toBeVisible({ timeout: 15000 });
    await snippetItem.click();

    // 5. Verify grid is visible in the notebook section
    await expect(page.getByTestId('groove-grid')).toBeVisible();

    // 6. Verify persistence
    await waitForSave(page);
    await page.reload();
    await expect(page.getByTestId('groove-grid')).toBeVisible();
  });
});

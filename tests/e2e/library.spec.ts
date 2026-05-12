import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Library Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to library (will redirect to /library/songs)
    await page.goto('/library/songs');
  });

  test('should create and search for a new song', async ({ page }) => {
    const songTitle = `Test Song ${Date.now()}`;

    // Create new song
    await expect(page.getByTestId('create-new-button')).toHaveText(/New song/i, { timeout: 15000 });
    await page.getByTestId('create-new-button').click();
    await expect(page).toHaveURL(/\/songs\//);

    // Update title and wait for save
    const titleInput = page.locator('input[placeholder="Song Title"]');
    await titleInput.fill(songTitle);
    await waitForSave(page);

    // Go back to library
    await page.goto('/library/songs');

    // Search for the song
    const searchInput = page.getByTestId('search-library-input');
    await searchInput.fill(songTitle);

    // Verify song is visible in the list
    await expect(page.locator('h3', { hasText: songTitle })).toBeVisible();

    // Search for something else and verify it's gone
    await searchInput.fill('Non-existent song name');
    // Wait for the UI to potentially update
    await page.waitForTimeout(1000);
    await expect(page.locator('h3', { hasText: songTitle })).not.toBeVisible({ timeout: 10000 });
  });

  test('should use global search in AppShell', async ({ page }) => {
    const songTitle = `Global Search Song ${Date.now()}`;

    // Create a song first
    await page.getByTestId('create-new-button').click();
    await page.locator('input[placeholder="Song Title"]').fill(songTitle);
    await waitForSave(page);

    // Navigate somewhere else (e.g. Dashboard)
    await page.goto('/dashboard');

    // Use global search
    const globalSearch = page.getByTestId('global-search-input');
    await expect(globalSearch).toBeVisible();
    await globalSearch.fill(songTitle);
    await page.keyboard.press('Enter');

    // Should redirect to library songs with search param
    await expect(page).toHaveURL(/\/library\/songs\?search=/);

    // Verify song is visible
    await expect(page.locator('h3', { hasText: songTitle })).toBeVisible();
  });

  test('should switch between library tabs', async ({ page }) => {
    // Default is Songs
    await expect(page.getByTestId('tab-songs')).toHaveClass(/bg-surface-container-highest/);

    // Switch to Notebooks
    await page.getByTestId('tab-notebooks').click();
    await expect(page).toHaveURL(/\/library\/notebooks/);
    await expect(page.getByTestId('tab-notebooks')).toHaveClass(/bg-surface-container-highest/);

    // Switch to Snippets
    await page.getByTestId('tab-snippets').click();
    await expect(page).toHaveURL(/\/library\/snippets/);
    await expect(page.getByTestId('tab-snippets')).toHaveClass(/bg-surface-container-highest/);
  });

  test('should manage tags for a snippet', async ({ page }) => {
    // Navigate to Snippets tab
    await page.goto('/library/snippets');

    // Create new snippet
    await expect(page.getByTestId('create-new-button')).toHaveText(/New snippet/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    await expect(page).toHaveURL(/\/snippets\//);

    // Add a tag
    const tagInput = page.getByPlaceholder('+ ADD TAG');
    await tagInput.fill('rock');
    await page.keyboard.press('Enter');

    // Verify tag is visible
    await expect(page.locator('span', { hasText: 'rock' })).toBeVisible();

    // Wait for auto-save
    await waitForSave(page);

    // Go back to library and check filter
    await page.goto('/library/snippets');

    // Verify tag appears in filter list
    const tagFilter = page.getByTestId('tag-filter-rock');
    await expect(tagFilter).toBeVisible();

    // Click tag filter
    await tagFilter.click();
    await expect(tagFilter).toHaveClass(/bg-primary/);
  });

  test('should duplicate and delete a song', async ({ page }) => {
    const originalTitle = `Original ${Date.now()}`;

    // Create song
    await expect(page.getByTestId('create-new-button')).toHaveText(/New song/i, { timeout: 15000 });
    await page.getByTestId('create-new-button').click();
    await page.locator('input[placeholder="Song Title"]').fill(originalTitle);
    await waitForSave(page);

    // Library
    await page.goto('/library/songs');

    // Find song card
    const songCard = page
      .getByTestId('library-card')
      .filter({ has: page.locator('h3', { hasText: originalTitle }) });

    // Ensure card is hovered and actions appear
    await songCard.scrollIntoViewIfNeeded();
    await songCard.hover();
    const duplicateBtn = songCard.locator('button[title="Duplicate"]');
    await expect(duplicateBtn).toBeVisible();
    await duplicateBtn.click();

    await waitForSave(page);

    // Verify copy exists
    const copyTitle = `${originalTitle} (Copy)`;
    await page.reload();
    await expect(page.locator('h3', { hasText: copyTitle })).toBeVisible({ timeout: 15000 });

    // Delete the copy
    page.on('dialog', (dialog) => dialog.accept());
    const copyCard = page
      .getByTestId('library-card')
      .filter({ has: page.locator('h3', { hasText: copyTitle }) });

    await copyCard.hover();
    const deleteBtn = copyCard.locator('button[title="Delete"]');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Verify copy is gone
    await expect(page.locator('h3', { hasText: copyTitle })).not.toBeVisible();
  });
});

import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Library Management & Guest Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start as a guest for these tests
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');
  });

  test('should create and search for a new song', async ({ page }) => {
    const songTitle = `Test Song ${Date.now()}`;

    // Create new song
    await page.click('text=New song');
    await expect(page).toHaveURL(/\/songs\//);

    // Update title and wait for save
    const titleInput = page.locator('input[placeholder="Song Title"]');
    await titleInput.fill(songTitle);
    await waitForSave(page);

    // Go back to library
    await page.goto('/library');

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

  test('should switch between library tabs', async ({ page }) => {
    // Default is Songs
    await expect(page.getByTestId('tab-song')).toHaveClass(/bg-surface-container-highest/);

    // Switch to Notebooks
    await page.getByTestId('tab-notebook').click();
    await expect(page.getByTestId('tab-notebook')).toHaveClass(/bg-surface-container-highest/);

    // Switch to Snippets
    await page.getByTestId('tab-snippet').click();
    await expect(page.getByTestId('tab-snippet')).toHaveClass(/bg-surface-container-highest/);
  });

  test('should manage tags for a snippet', async ({ page }) => {
    // Navigate to Snippets tab
    await page.getByTestId('tab-snippet').click();

    // Create new snippet
    await page.click('text=New snippet');
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
    await page.goto('/library');
    await page.click('button:has-text("Snippets")');

    // Verify tag appears in filter list
    const tagFilter = page.getByTestId('tag-filter-rock');
    await expect(tagFilter).toBeVisible();

    // Click tag filter
    await tagFilter.click();
    await expect(tagFilter).toHaveClass(/bg-primary\/20/);
  });

  test('should duplicate and delete a song', async ({ page }) => {
    const originalTitle = `Original ${Date.now()}`;

    // Create song
    await page.click('text=New song');
    await page.locator('input[placeholder="Song Title"]').fill(originalTitle);
    await waitForSave(page);

    // Library
    await page.goto('/library');

    // Find song card
    const songCard = page
      .getByTestId('library-card')
      .filter({ has: page.locator('h3', { hasText: originalTitle }) });
    await songCard.hover(); // Actions are visible on hover
    await songCard.locator('button[title="Duplicate"]').click();

    // Verify copy exists
    const copyTitle = `${originalTitle} (Copy)`;
    await expect(page.locator('h3', { hasText: copyTitle })).toBeVisible();

    // Delete the copy
    page.on('dialog', (dialog) => dialog.accept()); // Handle confirmation
    const copyCard = page
      .getByTestId('library-card')
      .filter({ has: page.locator('h3', { hasText: copyTitle }) });
    await copyCard.hover();
    await copyCard.locator('button[title="Delete"]').click();

    // Verify copy is gone
    await expect(page.locator('h3', { hasText: copyTitle })).not.toBeVisible();
  });
});

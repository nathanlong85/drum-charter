import { expect, type Page } from '@playwright/test';

/**
 * Wait for the debounced save to complete in any editor.
 * Both Song and Snippet editors show "SAVING...".
 * SongEditor only shows "SAVING..." then disappears.
 * SnippetEditor shows "SAVED" after "SAVING...".
 * So we wait for "SAVING..." to appear (optional) and then wait for it to be gone.
 */
export const waitForSave = async (page: Page) => {
  try {
    // Wait for "Saving..." to appear (optional, debounce might have finished already)
    await expect(page.locator('text=Saving...')).toBeVisible({ timeout: 2000 });
  } catch {
    // Already finished saving or not started yet
  }
  // Wait for it to be gone
  await expect(page.locator('text=Saving...')).not.toBeVisible({ timeout: 10000 });
};

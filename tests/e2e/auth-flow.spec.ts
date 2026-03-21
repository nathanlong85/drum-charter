import { expect, test } from '@playwright/test';

test.describe('Authentication and Core Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  test('User can see library and navigate to existing items', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /My Library/i })).toBeVisible();
    await expect(page.getByText(/Songs/i)).toBeVisible();
    await expect(page.getByText(/Notebooks/i)).toBeVisible();
    await expect(page.getByText(/Snippets/i)).toBeVisible();
  });

  test('User can create and edit a new snippet with persistence', async ({ page }) => {
    // Switch to Snippets tab
    await page.click('button:has-text("Snippets")');

    // Create new snippet
    await page.click('button:has-text("NEW")');
    await page.click('button:has-text("Snippet")');

    // Should redirect to snippet editor
    await expect(page).toHaveURL(/\/snippets\/.+/);

    const titleInput = page.getByPlaceholder(/Snippet Title/i);
    const uniqueTitle = `Auth Snippet ${Date.now()}`;
    await titleInput.fill(uniqueTitle);

    // Wait for save - need to wait for SAVING then SAVED
    await expect(page.getByText(/SAVING/)).toBeVisible();
    await expect(page.getByText(/SAVED/)).toBeVisible({ timeout: 20000 });

    // Additional wait to ensure DB is truly updated
    await page.waitForTimeout(2000);

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // Check if title persisted
    await expect(page.locator(`input[value="${uniqueTitle}"]`)).toBeVisible({
      timeout: 20000,
    });
  });

  test('User can create and edit a new notebook', async ({ page }) => {
    // Switch to Notebooks tab
    await page.click('button:has-text("Notebooks")');

    // Create new notebook
    await page.click('button:has-text("NEW")');
    await page.click('button:has-text("Notebook")');

    // Should redirect to notebook editor
    await expect(page).toHaveURL(/\/notebooks\/.+/);

    // Edit title
    const titleInput = page.getByPlaceholder(/Notebook Title/i);
    const uniqueTitle = `My Notebook ${Date.now()}`;
    await titleInput.clear();
    await titleInput.fill(uniqueTitle);

    // Wait for auto-save
    await expect(page.getByText(/SAVING/)).toBeVisible();
    await expect(page.getByText(/SAVED/)).toBeVisible({ timeout: 20000 });
  });
});

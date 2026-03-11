import { test, expect } from '@playwright/test';

test.describe('Guest Access & Library Flow', () => {
  test('should allow a user to sign in as guest and see the library', async ({ page }) => {
    // Start at landing page
    await page.goto('/');
    
    // Click "Start Creating (Guest Mode)" link which goes to /login
    await page.getByRole('link', { name: /Start Creating \(Guest Mode\)/i }).click();
    await expect(page).toHaveURL('/login');

    // Click "Continue as Guest" on login page
    await page.getByRole('button', { name: /Continue as Guest/i }).click();

    // Should redirect to library
    await expect(page).toHaveURL(/\/library/);
    
    // Should show Guest Mode indicator
    await expect(page.locator('text=Guest Mode')).toBeVisible();

    // Library should show item categories
    await expect(page.getByText('Songs')).toBeVisible();
    await expect(page.getByText('Notebooks')).toBeVisible();
    await expect(page.getByText('Snippets')).toBeVisible();
  });

  test('should allow creating a new notebook and navigating to editor', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    
    // Explicitly wait for the redirect and the page to be ready
    await page.waitForURL(/\/library/);
    await expect(page.getByText('My Library')).toBeVisible();

    // Click "New Notebook"
    const newNotebookBtn = page.getByRole('button', { name: /New Notebook/i });
    await expect(newNotebookBtn).toBeVisible();
    await newNotebookBtn.click();

    // Should redirect to notebook editor
    await page.waitForURL(/\/notebooks\/.+/);
    await expect(page).toHaveURL(/\/notebooks\/.+/);

    // Should be able to edit title
    const titleInput = page.getByPlaceholder(/Notebook Title/i);
    await expect(titleInput).toBeVisible();
    await titleInput.fill('My Practice Routine');
    
    // Should show "Saving..." then "Saved"
    await expect(page.locator('text=Saving...')).toBeVisible();
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 10000 });
  });

  test('should persist data after reload', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    
    await page.waitForURL(/\/library/);
    await expect(page.getByText('My Library')).toBeVisible();
    
    // Create new snippet
    await page.getByRole('button', { name: /New Snippet/i }).click();
    await page.waitForURL(/\/snippets\/.+/);
    await expect(page).toHaveURL(/\/snippets\/.+/);
    
    const titleInput = page.getByPlaceholder(/Snippet Title/i);
    const uniqueTitle = `Unique Snippet ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    
    // Wait for save - check for any saving indicator
    await expect(page.getByText(/saving/i)).toBeVisible();
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 });
    
    // Reload page
    await page.reload();
    
    // Check if title persisted
    await expect(page.getByDisplayValue(uniqueTitle)).toBeVisible();
  });
});

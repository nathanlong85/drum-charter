import { test, expect } from '@playwright/test';

test.describe('Guest Access & Library Flow', () => {
  test('should allow a user to sign in as guest and see the library', async ({ page }) => {
    // Start at landing page
    await page.goto('/');
    
    // Click "Start Creating (Guest Mode)" link which goes to /login
    await page.getByRole('link', { name: /Start Creating \(Guest Mode\)/i }).click();
    await page.waitForURL('/login');

    // Click "Continue as Guest" on login page and wait for auth response
    const authPromise = page.waitForResponse(resp => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'), { timeout: 30000 });
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    try {
      await authPromise;
    } catch (e) {
      console.log('Auth response timeout, continuing...');
    }

    // Should redirect to library
    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/library/);
    
    // Should show Guest Mode indicator
    await expect(page.locator('text=Guest Mode')).toBeVisible({ timeout: 15000 });

    // Library should show item categories
    await expect(page.getByText('Songs')).toBeVisible();
    await expect(page.getByText('Notebooks')).toBeVisible();
    await expect(page.getByText('Snippets')).toBeVisible();
  });

  test('should allow creating a new notebook and navigating to editor', async ({ page }) => {
    await page.goto('/login');
    const authPromise = page.waitForResponse(resp => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'), { timeout: 30000 });
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    try { await authPromise; } catch(e) {}
    
    // Explicitly wait for the redirect and the page to be ready
    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page.getByText('My Library')).toBeVisible();

    // Switch to Notebooks tab
    await page.getByRole('button', { name: /Notebooks/i }).click();

    // Click "New Notebook" and wait for creation response
    const createPromise = page.waitForResponse(resp => resp.url().includes('/rest/v1/notebooks'), { timeout: 30000 });
    const newNotebookBtn = page.getByRole('button', { name: /New Notebook/i });
    await expect(newNotebookBtn).toBeVisible();
    await newNotebookBtn.click();
    try { await createPromise; } catch(e) {}

    // Should redirect to notebook editor
    await page.waitForURL(/\/notebooks\/.+/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/notebooks\/.+/);

    // Should be able to edit title
    const titleInput = page.getByPlaceholder(/Notebook Title/i);
    await expect(titleInput).toBeVisible();
    await titleInput.fill('My Practice Routine');
    
    // Should show "SAVED"
    await expect(page.locator('text=SAVED')).toBeVisible({ timeout: 20000 });
  });

  test('should persist data after reload', async ({ page }) => {
    await page.goto('/login');
    const authPromise = page.waitForResponse(resp => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'), { timeout: 30000 });
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    try { await authPromise; } catch(e) {}
    
    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page.getByText('My Library')).toBeVisible();
    
    // Switch to Snippets tab
    await page.getByRole('button', { name: /Snippets/i }).click();

    // Create new snippet
    const createPromise = page.waitForResponse(resp => resp.url().includes('/rest/v1/groove_snippets'), { timeout: 30000 });
    await page.getByRole('button', { name: /New Snippet/i }).click();
    try { await createPromise; } catch(e) {}

    await page.waitForURL(/\/snippets\/.+/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/snippets\/.+/);
    
    const titleInput = page.getByPlaceholder(/Snippet Title/i);
    const uniqueTitle = `Unique Snippet ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    
    // Wait for save
    await expect(page.getByText(/SAVED/)).toBeVisible({ timeout: 20000 });
    
    // Reload page
    await page.reload({ waitUntil: 'networkidle' });
    
    // Check if title persisted
    await expect(page.getByDisplayValue(uniqueTitle)).toBeVisible({ timeout: 20000 });
  });
});

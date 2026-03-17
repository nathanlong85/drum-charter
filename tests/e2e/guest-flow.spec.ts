import { expect, test } from '@playwright/test';

test.describe('Guest Access & Library Flow', () => {
  test('should allow a user to sign in as guest and see the library', async ({ page }) => {
    // Start at landing page
    await page.goto('/');

    // Click "Start Creating (Guest Mode)" link which goes to /login
    await page.getByRole('link', { name: /Start Creating \(Guest Mode\)/i }).click();
    await page.waitForURL('/login');

    // Click "Continue as Guest" on login page and wait for auth response
    const authPromise = page.waitForResponse(
      (resp) => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'),
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    try {
      await authPromise;
    } catch (_e) {
      console.log('Auth response timeout, continuing...');
    }

    // Should redirect to library
    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/library/);

    // Should show Guest Mode indicator
    await expect(page.locator('text=Guest Mode')).toBeVisible({
      timeout: 15000,
    });

    // Library should show item categories
    await expect(page.getByText('Songs')).toBeVisible();
    await expect(page.getByText('Notebooks')).toBeVisible();
    await expect(page.getByText('Snippets')).toBeVisible();
  });

  test('should allow creating a new notebook and navigating to editor', async ({ page }) => {
    await page.goto('/login');
    const authPromise = page.waitForResponse(
      (resp) => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'),
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    try {
      await authPromise;
    } catch (_e) {}

    // Explicitly wait for the redirect and the page to be ready
    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page.getByText('My Library')).toBeVisible();

    // Switch to Notebooks tab
    await page
      .getByRole('button', { name: /Notebooks/i })
      .first()
      .click();

    // Click "New Notebook" and wait for creation response
    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes('/rest/v1/notebooks'),
      { timeout: 30000 },
    );
    const newNotebookBtn = page.getByRole('button', { name: /New Notebook/i });
    await expect(newNotebookBtn).toBeVisible();
    await newNotebookBtn.click();
    try {
      await createPromise;
    } catch (_e) {}

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
    const authPromise = page.waitForResponse(
      (resp) => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'),
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    try {
      await authPromise;
    } catch (_e) {}

    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page.getByText('My Library')).toBeVisible();

    // Switch to Snippets tab and wait for it to be active
    const snippetTab = page.getByRole('button', { name: /Snippets/i }).first();
    await snippetTab.click();
    await expect(snippetTab).toHaveClass(/bg-white text-blue-600/);

    // Create new snippet
    const createPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/rest/v1/groove_snippets') && resp.request().method() === 'POST',
      { timeout: 30000 },
    );
    console.log('Clicking New Snippet button...');
    await page.getByRole('button', { name: /New Snippet/i }).click();
    console.log('Waiting for snippet creation response...');
    await createPromise;

    // Wait for redirect - LibraryDashboard has a 500ms delay before redirecting
    console.log('Waiting for redirect to snippet editor...');
    await page.waitForURL(/\/snippets\/.+/, { timeout: 60000 });
    console.log('URL after snippet creation:', page.url());
    await expect(page).toHaveURL(/\/snippets\/.+/);

    const titleInput = page.getByPlaceholder(/Snippet Title/i);
    const uniqueTitle = `Unique Snippet ${Date.now()}`;
    await titleInput.fill(uniqueTitle);

    // Wait for save - need to wait for SAVING then SAVED to ensure debounce + save completed
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

  test('Guest Access - Library -> Create -> Edit', async ({ page }) => {
    // Navigate to Login and click Guest
    await page.goto('/login');
    await page.click('button:has-text("Continue as Guest")');
    await page.waitForURL('/library');

    // Switch to Notebooks tab and wait for it to be active
    const notebookTab = page.getByRole('button', { name: /Notebooks/i }).first();
    await notebookTab.click();
    await expect(notebookTab).toHaveClass(/bg-white text-blue-600/);

    // Create new notebook
    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes('/rest/v1/notebooks') && resp.request().method() === 'POST',
      { timeout: 30000 },
    );
    console.log('Clicking New Notebook button...');
    await page.click('button:has-text("NEW")');
    await page.click('button:has-text("Notebook")');
    console.log('Waiting for notebook creation response...');
    await createPromise;

    // Wait for redirect - LibraryDashboard has a 500ms delay before redirecting
    console.log('Waiting for redirect to notebook editor...');
    await page.waitForURL(/\/notebooks\/.+/, { timeout: 60000 });
    console.log('URL after notebook creation:', page.url());
    await expect(page).toHaveURL(/\/notebooks\/.+/);

    // Check for "Guest Mode" indicator
    await expect(page.getByText(/Guest Mode/i)).toBeVisible();

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

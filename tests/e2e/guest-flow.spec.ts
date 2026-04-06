import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Guest Access & Library Flow', () => {
  test('should allow a user to sign in as guest and see the library', async ({ page }) => {
    // Start at landing page
    await page.goto('/');

    // Click "Sign In to Start Creating" link which goes to /login
    await page.getByRole('link', { name: /Sign In to Start Creating/i }).click();
    await page.waitForURL('/login');

    // Click "Continue as Guest" on login page and wait for auth response
    const authPromise = page.waitForResponse(
      (resp) => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'),
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await authPromise;

    // Should redirect to library
    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/library/);

    // Should show Guest Mode indicator
    await expect(page.getByTestId('guest-mode-indicator')).toBeVisible({
      timeout: 15000,
    });

    // Library should show item categories
    await expect(page.getByRole('link', { name: 'Songs' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notebooks' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Snippets' })).toBeVisible();
  });

  test('should allow creating a new notebook and navigating to editor', async ({ page }) => {
    await page.goto('/login');
    const authPromise = page.waitForResponse(
      (resp) => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'),
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await authPromise;

    // Explicitly wait for the redirect and the page to be ready
    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'My Library' })).toBeVisible();

    // Switch to Notebooks tab
    const notebookTab = page.getByTestId('tab-notebook').first();
    await notebookTab.click();
    await expect(notebookTab).toHaveAttribute('aria-selected', 'true');

    // Click "New notebook" and wait for creation response
    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes('/rest/v1/notebooks') && resp.request().method() === 'POST',
      { timeout: 30000 },
    );
    const newNotebookBtn = page.getByTestId('create-new-button');
    await expect(newNotebookBtn).toBeVisible();
    await newNotebookBtn.click();
    await createPromise;

    // Wait for redirect
    await page.waitForURL(/\/notebooks\/.+/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/notebooks\/.+/);

    // Should be able to edit title
    const titleInput = page.getByPlaceholder(/Notebook Title/i);
    await expect(titleInput).toBeVisible();
    await titleInput.fill('My Practice Routine');

    // Should show "Saved"
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 20000 });
  });

  test('should persist data after reload', async ({ page }) => {
    await page.goto('/login');
    const authPromise = page.waitForResponse(
      (resp) => resp.url().includes('/auth/v1/signup') || resp.url().includes('/auth/v1/token'),
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await authPromise;

    await page.waitForURL(/\/library/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'My Library' })).toBeVisible();

    // Switch to Snippets tab and wait for it to be active
    const snippetTab = page.getByTestId('tab-snippet');
    await snippetTab.click();
    await expect(snippetTab).toHaveAttribute('aria-selected', 'true');

    // Create new snippet
    const createPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/rest/v1/groove_snippets') && resp.request().method() === 'POST',
      { timeout: 30000 },
    );
    await page.getByTestId('create-new-button').click();
    await createPromise;

    // Wait for redirect
    await page.waitForURL(/\/snippets\/.+/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/snippets\/.+/);

    const titleInput = page.getByPlaceholder(/Snippet Title/i);
    const uniqueTitle = `Unique Snippet ${Date.now()}`;
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

  test('Guest Access - Library -> Create -> Edit', async ({ page }) => {
    // Navigate to Login and click Guest
    await page.goto('/login');
    await page.click('button:has-text("Continue as Guest")');
    await page.waitForURL('/library');

    // Switch to Notebooks tab and wait for it to be active
    const notebookTab = page.getByTestId('tab-notebook');
    await notebookTab.click();
    await expect(notebookTab).toHaveAttribute('aria-selected', 'true');

    // Create new notebook
    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes('/rest/v1/notebooks') && resp.request().method() === 'POST',
      { timeout: 30000 },
    );
    await expect(page.getByTestId('create-new-button')).toHaveText(/New notebook/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    await createPromise;

    // Wait for redirect
    await page.waitForURL(/\/notebooks\/.+/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/notebooks\/.+/);

    // Check for "Guest Mode" indicator
    await expect(page.getByTestId('guest-mode-indicator').first()).toBeVisible();

    // Edit title
    const titleInput = page.getByPlaceholder(/Notebook Title/i);
    const uniqueTitle = `My Notebook ${Date.now()}`;
    await titleInput.clear();
    await titleInput.fill(uniqueTitle);

    // Wait for auto-save
    await waitForSave(page);
  });
});

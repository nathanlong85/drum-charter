import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Public Sharing Workflows', () => {
  test('Should handle private or missing songs with 404', async ({ page }) => {
    // Navigate to a likely non-existent or private ID
    await page.goto('http://localhost:3001/public/songs/private-id-123');
    // Next.js notFound() renders a default 404 page
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should allow viewing a public song', async ({ page }) => {
    // 1. Sign in as guest
    await page.goto('http://localhost:3001/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // 2. Create a new song
    await page.getByTestId('tab-song').first().click();
    const createPromise = page.waitForResponse((resp) =>
      resp.url().includes('/rest/v1/song_charts'),
    );
    await expect(page.getByTestId('create-new-button')).toHaveText(/New song/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    const response = await createPromise;
    expect(response.ok()).toBe(true);
    await page.waitForURL(/\/songs\/.+/);
    const songId = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
    await page.getByTestId('toggle-public-button').click();
    await expect(page.locator('text=Saved')).toBeVisible();
    // Increase buffer for local Supabase propagation to public views
    await page.waitForTimeout(3000);

    // 4. View public page
    await page.goto(`http://localhost:3001/public/songs/${songId}`);
    // Wait for content that confirms public view is loaded
    await expect(page.getByText(/Untitled Song/i)).toBeVisible({
      timeout: 20000,
    });
  });

  test('Should allow viewing a public notebook', async ({ page }) => {
    // 1. Sign in as guest
    await page.goto('http://localhost:3001/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // 2. Create a new notebook
    await page.getByTestId('tab-notebook').first().click();
    const createPromise = page.waitForResponse((resp) => resp.url().includes('/rest/v1/notebooks'));
    await expect(page.getByTestId('create-new-button')).toHaveText(/New notebook/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    const response = await createPromise;
    expect(response.ok()).toBe(true);
    await page.waitForURL(/\/notebooks\/.+/);
    const notebookId = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
    await page.getByTestId('toggle-public-button').click();
    await expect(page.locator('text=Saved')).toBeVisible();
    // Increase buffer for local Supabase propagation to public views
    await page.waitForTimeout(3000);

    // 4. View public page
    await page.goto(`http://localhost:3001/public/notebooks/${notebookId}`);
    // Wait for the specific heading that confirms the public view is loaded
    await expect(page.getByText(/Public Notebook View/i).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText(/Untitled Notebook/i)).toBeVisible();
  });

  test('Should handle private or missing notebooks with 404', async ({ page }) => {
    await page.goto('http://localhost:3001/public/notebooks/test-notebook-id');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should allow viewing a public snippet', async ({ page }) => {
    // 1. Sign in as guest
    await page.goto('http://localhost:3001/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // 2. Create a new snippet
    await page.getByTestId('tab-snippet').first().click();
    const createPromise = page.waitForResponse((resp) =>
      resp.url().includes('/rest/v1/groove_snippets'),
    );
    await expect(page.getByTestId('create-new-button')).toHaveText(/New snippet/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    const response = await createPromise;
    expect(response.ok()).toBe(true);
    await page.waitForURL(/\/snippets\/.+/);
    const snippetId = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
    await page.getByTestId('toggle-public-button').click();
    await expect(page.locator('text=Saved')).toBeVisible();
    // Increase buffer for local Supabase propagation to public views
    await page.waitForTimeout(3000);

    // 4. View public page
    await page.goto(`http://localhost:3001/public/snippets/${snippetId}`);
    // Wait for the specific heading that confirms the public view is loaded
    await expect(page.getByText(/Atomic Snippet View/i).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText(/Untitled Snippet/i)).toBeVisible();
  });

  test('Should handle private or missing snippets with 404', async ({ page }) => {
    await page.goto('http://localhost:3001/public/snippets/test-snippet-id');
    await expect(page.getByText('404')).toBeVisible();
  });
});

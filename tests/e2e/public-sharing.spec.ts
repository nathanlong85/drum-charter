import { expect, test } from '@playwright/test';

test.describe('Public Sharing Workflows', () => {
  test('Should handle private or missing songs with 404', async ({ page }) => {
    // Navigate to a likely non-existent or private ID
    await page.goto('http://localhost:3001/public/songs/private-id-123');
    // Next.js notFound() renders a default 404 page
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should allow viewing a public notebook', async ({ page }) => {
    // 1. Sign in as guest
    await page.goto('http://localhost:3001/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // 2. Create a new notebook
    await page.getByRole('button', { name: /Notebooks/i }).first().click();
    const createPromise = page.waitForResponse((resp) => resp.url().includes('/rest/v1/notebooks'));
    await page.getByRole('button', { name: /New Notebook/i }).click();
    const response = await createPromise;
    const body = await response.json();
    const notebookId = body[0].id;

    // 3. Make it public
    await page.waitForURL(new RegExp(`/notebooks/${notebookId}`));
    await page.getByLabel(/Public/i).check();
    await expect(page.locator('text=SAVED')).toBeVisible();

    // 4. View public page
    await page.goto(`http://localhost:3001/public/notebooks/${notebookId}`);
    await expect(page.getByText(/DrumCharter Public View/i)).toBeVisible();
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
    await page.getByRole('button', { name: /Snippets/i }).first().click();
    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes('/rest/v1/groove_snippets'),
    );
    await page.getByRole('button', { name: /New Snippet/i }).click();
    const response = await createPromise;
    const body = await response.json();
    const snippetId = body[0].id;

    // 3. Make it public
    await page.waitForURL(new RegExp(`/snippets/${snippetId}`));
    await page.getByLabel(/Public/i).check();
    await expect(page.locator('text=SAVED')).toBeVisible();

    // 4. View public page
    await page.goto(`http://localhost:3001/public/snippets/${snippetId}`);
    await expect(page.getByText(/DrumCharter Public View/i)).toBeVisible();
    await expect(page.getByText(/Untitled Snippet/i)).toBeVisible();
  });

  test('Should handle private or missing snippets with 404', async ({ page }) => {
    await page.goto('http://localhost:3001/public/snippets/test-snippet-id');
    await expect(page.getByText('404')).toBeVisible();
  });
});

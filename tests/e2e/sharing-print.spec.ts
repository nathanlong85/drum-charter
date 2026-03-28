import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Sharing & Public View', () => {
  test('should view a public snippet as a guest', async ({ page }) => {
    // 1. Create a public snippet as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

    await page.getByTestId('tab-snippet').click();
    await expect(page.getByTestId('create-new-button')).toHaveText(/New snippet/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    await expect(page).toHaveURL(/\/snippets\//);

    const snippetTitle = `Public Snippet ${Date.now()}`;
    await page.locator('input[placeholder="Snippet Title"]').fill(snippetTitle);

    // Toggle Public
    await page.getByTestId('toggle-public-button').click();

    // Wait for save
    await waitForSave(page);

    // Get the public URL
    const viewLink = page.getByRole('link', { name: /View Public/i });
    await expect(viewLink).toBeVisible();
    const publicUrl = await viewLink.getAttribute('href');
    expect(publicUrl).not.toBeNull();
    expect(publicUrl).toContain('/public/snippets/');

    // 2. Open the public URL in a new context (incognito/fresh session)
    // For E2E simplicity, we can just clear cookies or use a new page if supported,
    // but here we'll just navigate to it and verify "READ ONLY" text.
    await page.goto(publicUrl!);

    // Verify content is visible
    await expect(page.locator('h1')).toHaveText(snippetTitle);
    await expect(page.locator('text=READ ONLY')).toBeVisible();

    // Try to click a cell and verify it doesn't change (using a non-intrusive check)
    // GrooveGridEditor is readOnly={true}
    const firstCell = page.getByTestId('note-cell').first();
    await firstCell.click();
    // It should NOT have an image after clicking if it was empty
    await expect(firstCell.getByTestId('note-cell-icon')).not.toBeVisible();
  });

  test('should adapt UI for printing', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.waitForURL('/library');

    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes('/rest/v1/song_charts') && resp.request().method() === 'POST',
    );
    await expect(page.getByTestId('create-new-button')).toHaveText(/New song/i, { timeout: 15000 });
    await page.getByTestId('create-new-button').click();
    await createPromise;
    await page.waitForURL(/\/songs\//);

    // Add some content
    await page.locator('input[placeholder="Song Title"]').fill('Print Test Song');
    await page.getByRole('button', { name: /Add New Section/i }).click();
    await page.getByRole('button', { name: /Add Grid/i }).click();

    // Check if PrintButton exists
    const printBtn = page.locator('button[title="Print Version"]');
    await expect(printBtn).toBeVisible({ timeout: 15000 });

    // The toolbar container has the 'no-print' class
    const toolbar = page.getByTestId('groove-toolbar');
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    await expect(toolbar).toHaveClass(/no-print/);

    // The editor toolbar also has no-print
    const editorToolbar = page.locator('div.no-print').filter({ has: printBtn });
    await expect(editorToolbar).toBeVisible();

    const sidebar = page.locator('aside');
    if ((await sidebar.count()) > 0) {
      await expect(sidebar).toHaveClass(/no-print/);
    }
  });
});

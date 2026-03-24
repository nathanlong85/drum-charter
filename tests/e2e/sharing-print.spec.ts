import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Sharing & Public View', () => {
  test('should view a public snippet as a guest', async ({ page }) => {
    // 1. Create a public snippet as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

    await page.getByTestId('tab-snippet').click();
    await page.click('text=New snippet');
    await expect(page).toHaveURL(/\/snippets\//);

    const snippetTitle = `Public Snippet ${Date.now()}`;
    await page.locator('input[placeholder="Snippet Title"]').fill(snippetTitle);

    // Toggle Public
    await page.getByTestId('toggle-public-button').click();

    // Wait for save
    await waitForSave(page);

    // Get the public URL
    const viewLink = page.getByText(/View Public/i);
    await expect(viewLink).toBeVisible();
    const publicUrl = await viewLink.getAttribute('href');
    expect(publicUrl).toContain('/public/snippets/');

    // 2. Open the public URL in a new context (incognito/fresh session)
    // For E2E simplicity, we can just clear cookies or use a new page if supported,
    // but here we'll just navigate to it and verify "READ ONLY" text.
    await page.goto(publicUrl!);

    // Verify content is visible
    await expect(page.locator('h1')).toHaveText(snippetTitle);
    await expect(page.locator('text=READ ONLY')).toBeVisible();

    // Verify edit controls are disabled/hidden
    // The container has pointer-events-none
    const gridContainer = page.locator('section.pointer-events-none');
    await expect(gridContainer).toBeVisible();

    // Try to click a cell and verify it doesn't change (using a non-intrusive check)
    // Since pointer-events-none is on the container, it shouldn't even receive clicks.
    const firstCell = page.getByTestId('note-cell').first();
    await firstCell.click({ force: true }); // force: true to bypass pointer-events-none
    // It should NOT have an image after clicking if it was empty
    await expect(firstCell.getByTestId('note-cell-icon')).not.toBeVisible();
  });

  test('should adapt UI for printing', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');

    await page.click('text=New song');
    await expect(page).toHaveURL(/\/songs\//);

    // Add some content
    await page.locator('input[placeholder="Song Title"]').fill('Print Test Song');
    await page.click('text=Add New Section');

    // Check if PrintButton exists
    const printBtn = page.locator('button[title="Print Chart"]');
    if ((await printBtn.count()) > 0) {
      // We can't actually "print" in E2E, but we can check the 'no-print' class
      // which is used to hide elements during printing.
      const toolbar = page.getByTestId('groove-toolbar');
      await expect(toolbar).toHaveClass(/no-print/);

      const sidebar = page.locator('aside');
      if ((await sidebar.count()) > 0) {
        await expect(sidebar).toHaveClass(/no-print/);
      }

      // Check the PrintButton itself is no-print
      await expect(printBtn).toHaveClass(/no-print/);
    }
  });
});

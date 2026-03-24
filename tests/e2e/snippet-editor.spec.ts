import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Groove Snippet Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Start as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

    // Navigate to Snippets tab and create new snippet
    await page.getByTestId('tab-snippet').click();
    await page.click('text=New snippet');
    await expect(page).toHaveURL(/\/snippets\//);
  });

  test('should manage snippet metadata and public toggle', async ({ page }) => {
    // Change Title
    const snippetTitle = `E2E Snippet ${Date.now()}`;
    await page.locator('input[placeholder="Snippet Title"]').fill(snippetTitle);

    // Toggle Public
    const publicToggle = page.getByTestId('toggle-public-button');
    await publicToggle.click();

    // Add a tag
    const tagInput = page.locator('input[placeholder*="ADD TAG"]');
    await tagInput.fill('funk');
    await page.keyboard.press('Enter');

    await waitForSave(page);

    // Verify persistence after reload
    await page.reload();
    await expect(page.locator('input[placeholder="Snippet Title"]')).toHaveValue(snippetTitle);
    await expect(page.getByTestId('toggle-public-button')).toHaveText('PUBLIC');
    await expect(page.locator('span', { hasText: 'funk' })).toBeVisible();

    // Verify "View" link is visible when public
    await expect(page.locator('text=View')).toBeVisible();
    await expect(page.locator('text=View')).toHaveAttribute('href', /\/public\/snippets\//);
  });

  test('should manage snippet grid configuration', async ({ page }) => {
    const toolbar = page.getByTestId('groove-toolbar');

    // Change Resolution
    await toolbar.locator('button', { hasText: '8' }).click();

    // Change Measures
    const measuresLabel = toolbar.locator('span', { hasText: 'Measures:' });
    const _measuresGroup = toolbar.locator('div', { has: measuresLabel });
    await toolbar.locator('button[title="Increase measures"]').click();

    await waitForSave(page);

    // Verify persistence
    await page.reload();
    await expect(toolbar.locator('button', { hasText: '8' })).toHaveClass(/bg-primary/);
    await expect(
      toolbar
        .locator('div', { has: page.locator('span', { hasText: 'Measures:' }) })
        .locator('span')
        .filter({ hasText: /^\d+$/ }),
    ).toHaveText('2');
  });

  test('should auto-save on grid changes', async ({ page }) => {
    // Wait for grid to be stable
    await page.waitForSelector('[data-testid="note-cell"]');
    const firstCell = page.getByTestId('note-cell').first();

    // Toggle a note
    await firstCell.dispatchEvent('click');
    await page.waitForTimeout(1000);
    await expect(firstCell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 15000 });

    // Wait for auto-save
    await waitForSave(page);

    // Verify persistence
    await page.reload();
    await expect(page.getByTestId('note-cell-icon').first()).toBeVisible({ timeout: 15000 });
  });
});

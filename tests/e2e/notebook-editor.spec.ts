import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Notebook Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to library
    await page.goto('/library');

    // Navigate to Notebooks tab and create new notebook
    await page.getByTestId('tab-notebooks').click();
    await expect(page.getByTestId('create-new-button')).toHaveText(/New notebook/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    await expect(page).toHaveURL(/\/notebooks\//);
  });

  test('should manage multiple sections with text and grids', async ({ page }) => {
    // Update Notebook Title
    const notebookTitle = `E2E Notebook ${Date.now()}`;
    await page.locator('input[placeholder="Notebook Title"]').fill(notebookTitle);

    // Add first section (Text)
    await page.click('text=Add New Section');
    // Sections are wrapped in a relative group div
    const firstSection = page.getByTestId('notebook-section').first();
    await firstSection.locator('input[placeholder="Section Name"]').fill('Technical Drills');
    await firstSection.locator('textarea[placeholder*="Add notes"]').fill('Work on single strokes');

    // Add second section (with Grid)
    await page.click('text=Add New Section');
    const secondSection = page.getByTestId('notebook-section').nth(1);
    await secondSection.locator('input[placeholder="Section Name"]').fill('Groove Exercise');

    // Explicitly click the button in the second section
    await secondSection.getByRole('button', { name: /\+ Add Grid/i }).click();

    // Interact with the grid in the second section
    const grid = secondSection.getByTestId('groove-grid');
    await expect(grid).toBeVisible();
    const kickRow = grid.getByTestId('instrument-row-kick'); // Factory uses 'Kick' label
    await kickRow.getByTestId('note-cell').first().click();

    await waitForSave(page);

    // Verify everything persists after reload
    await page.reload();
    await expect(page.locator('input[placeholder="Notebook Title"]')).toHaveValue(notebookTitle);
    await expect(page.locator('input[placeholder="Section Name"]').first()).toHaveValue(
      'Technical Drills',
    );
    await expect(page.locator('textarea[placeholder*="Add notes"]').first()).toHaveValue(
      'Work on single strokes',
    );
    await expect(page.locator('input[placeholder="Section Name"]').nth(1)).toHaveValue(
      'Groove Exercise',
    );

    const reloadedGrid = page.getByTestId('notebook-section').nth(1).getByTestId('groove-grid');
    await expect(
      reloadedGrid
        .getByTestId('instrument-row-kick')
        .getByTestId('note-cell')
        .first()
        .getByTestId('note-cell-icon'),
    ).toBeVisible();
  });

  test('should support independent settings for inline grids', async ({ page }) => {
    // Add two sections with grids
    await page.click('text=Add New Section');
    await page
      .getByTestId('notebook-section')
      .first()
      .getByRole('button', { name: /\+ Add Grid/i })
      .click();

    await page.click('text=Add New Section');
    await page
      .getByTestId('notebook-section')
      .nth(1)
      .getByRole('button', { name: /\+ Add Grid/i })
      .click();

    const firstSection = page.getByTestId('notebook-section').first();
    const secondSection = page.getByTestId('notebook-section').nth(1);

    const firstToolbar = firstSection.getByTestId('groove-toolbar');
    const secondToolbar = secondSection.getByTestId('groove-toolbar');

    // Set first grid to 8th notes
    await firstToolbar.getByTestId('resolution-button-8').click();

    // Set second grid to 16th notes (default) but change measures to 2
    await secondToolbar.locator('button[title="Increase measures"]').click();

    await waitForSave(page);

    // Verify independent settings persist
    await page.reload();

    const reloadedFirstToolbar = page
      .getByTestId('notebook-section')
      .first()
      .getByTestId('groove-toolbar');
    const reloadedSecondToolbar = page
      .getByTestId('notebook-section')
      .nth(1)
      .getByTestId('groove-toolbar');

    // First should still be 8th resolution
    await expect(reloadedFirstToolbar.getByTestId('resolution-button-8')).toHaveClass(/bg-primary/);

    // Second should still have 2 measures
    await expect(
      reloadedSecondToolbar
        .locator('div', { has: page.locator('span', { hasText: 'MEASURES' }) })
        .locator('span')
        .filter({ hasText: /^\d+$/ }),
    ).toHaveText('2');
  });
});

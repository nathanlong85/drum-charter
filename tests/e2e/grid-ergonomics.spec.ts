import { expect, test } from '@playwright/test';

test.describe('Grid Ergonomics', () => {
  test.beforeEach(async ({ page }) => {
    // Start as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

    // Create a new snippet
    await page.getByTestId('tab-snippet').click();
    await page.click('text=New Snippet');
    await expect(page).toHaveURL(/\/snippets\//);
  });

  test('should clear the entire grid', async ({ page }) => {
    const kickRow = page.getByTestId('instrument-row-kick');
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Toggle a note to have something to clear
    await firstCell.click();
    await expect(firstCell.locator('img')).toBeVisible();

    // Handle confirm dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Click Clear Grid button
    await page.getByTestId('clear-grid-button').click();

    // Verify cell is empty
    await expect(firstCell.locator('img')).not.toBeVisible();
  });

  test('should clear a specific row', async ({ page }) => {
    const snareRow = page.getByTestId('instrument-row-snare');
    const firstCell = snareRow.getByTestId('note-cell').first();

    // Toggle a note
    await firstCell.click();
    await expect(firstCell.locator('img')).toBeVisible();

    // Enter Edit mode
    await page.getByTitle('Edit Instruments').click();

    // Handle confirm dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Click Clear Row button
    // Find the instrument ID from the row's test ID or just locator
    const clearRowBtn = snareRow.locator('button[title="Clear Row"]');
    await clearRowBtn.click();

    // Verify cell is empty
    await expect(firstCell.locator('img')).not.toBeVisible();
  });

  test('should select multiple cells via dragging', async ({ page }) => {
    const kickRow = page.getByTestId('instrument-row-kick');
    const cells = kickRow.getByTestId('note-cell');

    const firstCell = cells.nth(0);
    const secondCell = cells.nth(1);

    // Get bounding boxes for dragging
    const box1 = await firstCell.boundingBox();
    const box2 = await secondCell.boundingBox();

    if (!box1 || !box2) throw new Error('Could not find cells');

    // Drag from center of first cell to center of second cell
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
    await page.mouse.down();
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.mouse.up();

    // Verify selection styling (using the class name we added)
    await expect(firstCell).toHaveClass(/bg-blue-200/);
    await expect(secondCell).toHaveClass(/bg-blue-200/);
  });

  test('should toggle optional hits with Shift+Click', async ({ page }) => {
    const kickRow = page.getByTestId('instrument-row-kick');
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Toggle note first (standard)
    await firstCell.click();
    await expect(firstCell.locator('img')).toHaveAttribute('alt', 'standard');

    // Shift + Click to toggle optional
    await page.keyboard.down('Shift');
    await firstCell.click();
    await page.keyboard.up('Shift');

    // Verify it changed to standard_opt
    await expect(firstCell.locator('img')).toHaveAttribute('alt', 'standard_opt');

    // Shift + Click again to toggle back
    await page.keyboard.down('Shift');
    await firstCell.click();
    await page.keyboard.up('Shift');

    await expect(firstCell.locator('img')).toHaveAttribute('alt', 'standard');
  });

  test('should open symbol picker with Alt+Click', async ({ page }) => {
    const snareRow = page.getByTestId('instrument-row-snare');
    const firstCell = snareRow.getByTestId('note-cell').first();

    // Alt + Click
    await page.keyboard.down('Alt');
    await firstCell.click();
    await page.keyboard.up('Alt');

    // Verify Symbol Picker is visible
    await expect(page.getByTestId('symbol-picker')).toBeVisible();
  });

  test('should clear selection with Delete key', async ({ page }) => {
    const kickRow = page.getByTestId('instrument-row-kick');
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Add note
    await firstCell.click();
    await expect(firstCell.locator('img')).toBeVisible();

    // Select the cell
    await firstCell.click();
    const box = await firstCell.boundingBox();
    if (!box) throw new Error('No box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();

    await expect(firstCell).toHaveClass(/bg-blue-200/);

    // Press Delete
    await page.keyboard.press('Delete');

    // Verify note is gone
    await expect(firstCell.locator('img')).not.toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

test.describe('Grid Ergonomics', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to library
    await page.goto('/library');

    // Create a new snippet
    await page.getByTestId('tab-snippets').click();
    await expect(page.getByTestId('create-new-button')).toHaveText(/New snippet/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    await expect(page).toHaveURL(/\/snippets\//);
  });

  test('should clear the entire grid', async ({ page }) => {
    const kickRow = page.getByTestId(/instrument-row-kick/).first();
    await kickRow.waitFor({ state: 'visible' });
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Toggle a note to have something to clear
    await firstCell.click();
    await expect(firstCell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 10000 });

    // Handle confirm dialog - register BEFORE trigger
    page.once('dialog', (dialog) => dialog.accept());

    // Click Clear Grid button
    await page.getByTestId('clear-grid-button').click();

    // Verify cell is empty
    await expect(firstCell.getByTestId('note-cell-icon')).not.toBeVisible();
  });

  test('should clear a specific row', async ({ page }) => {
    const snareRow = page.getByTestId(/instrument-row-snare/).first();
    await snareRow.waitFor({ state: 'visible' });
    const firstCell = snareRow.getByTestId('note-cell').first();

    // Add a note
    await firstCell.click();
    await expect(firstCell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 10000 });

    // Enter Edit mode
    await page.getByTitle('Edit Instruments').click({ force: true });

    // Open settings for the row
    await snareRow.getByTitle('Edit Settings').click();

    // Handle confirm dialog - register BEFORE trigger
    page.once('dialog', (dialog) => dialog.accept());

    // Click Clear Row button in dropdown
    await page.getByRole('menuitem', { name: /Clear Row/i }).click();

    // Verify cell is empty
    await expect(firstCell.getByTestId('note-cell-icon')).not.toBeVisible();
  });

  test('should select multiple cells via dragging', async ({ page }) => {
    const snareRow = page.getByTestId(/instrument-row-snare/).first();
    await snareRow.waitFor({ state: 'visible' });
    const cells = snareRow.getByTestId('note-cell');

    const firstCell = cells.nth(0);
    const secondCell = cells.nth(1);

    // Drag from first cell to second cell using dispatchEvent for total reliability
    await firstCell.dispatchEvent('mousedown', { button: 0 });
    await page.waitForTimeout(100);
    await secondCell.dispatchEvent('mouseenter');
    await secondCell.dispatchEvent('mouseover'); // Extra insurance
    await page.waitForTimeout(100);

    // Verify selection styling (using the data attribute)
    await expect(firstCell).toHaveAttribute('data-selected', 'true', { timeout: 15000 });
    await expect(secondCell).toHaveAttribute('data-selected', 'true', { timeout: 15000 });

    await page.mouse.up();
  });

  test('should toggle optional hits with Shift+Click', async ({ page }) => {
    const kickRow = page.getByTestId(/instrument-row-kick/).first();
    await kickRow.waitFor({ state: 'visible' });
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Toggle note first (standard)
    // Add a note first
    await firstCell.click();
    await expect(firstCell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 15000 });

    // Shift + Click to toggle optional
    await firstCell.click({ modifiers: ['Shift'] });

    // Verify it changed to standard_opt
    await expect(firstCell.getByTestId('note-cell-icon')).toHaveAttribute('alt', 'standard_opt', {
      timeout: 15000,
    });

    // Shift + Click again to toggle back
    await firstCell.click({ modifiers: ['Shift'] });
    await expect(firstCell.getByTestId('note-cell-icon')).toHaveAttribute('alt', 'standard', {
      timeout: 15000,
    });
  });

  test('should open symbol picker with Alt+Click', async ({ page }) => {
    const snareRow = page.getByTestId(/instrument-row-snare/).first();
    await snareRow.waitFor({ state: 'visible' });
    const firstCell = snareRow.getByTestId('note-cell').first();

    // Alt + Click
    await firstCell.click({ modifiers: ['Alt'] });

    // Verify Symbol Picker is visible
    await expect(page.getByTestId('symbol-picker')).toBeVisible({ timeout: 15000 });
  });

  test('should clear selection with Delete key', async ({ page }) => {
    const kickRow = page.getByTestId(/instrument-row-kick/).first();
    await kickRow.waitFor({ state: 'visible' });
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Add note
    await firstCell.click();
    await expect(firstCell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 10000 });

    // Select the cell via mousedown (which is what grid uses for selection start)
    await firstCell.dispatchEvent('mousedown');

    // Verify selection styling (using the data attribute)
    await expect(firstCell).toHaveAttribute('data-selected', 'true', { timeout: 15000 });

    // Press Delete
    await page.keyboard.press('Delete');

    // Verify note is gone
    await expect(firstCell.getByTestId('note-cell-icon')).not.toBeVisible({ timeout: 10000 });
  });
});

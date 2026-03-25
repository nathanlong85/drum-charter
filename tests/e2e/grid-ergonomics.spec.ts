import { expect, test } from '@playwright/test';

test.describe('Grid Ergonomics', () => {
  test.beforeEach(async ({ page }) => {
    // Start as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

    // Create a new snippet
    await page.getByTestId('tab-snippet').click();
    await expect(page.getByTestId('create-new-button')).toHaveText(/New snippet/i, {
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();
    await expect(page).toHaveURL(/\/snippets\//);
  });

  test('should clear the entire grid', async ({ page }) => {
    const kickRow = page.getByTestId('instrument-row-kick');
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
    const snareRow = page.getByTestId('instrument-row-snare');
    await snareRow.waitFor({ state: 'visible' });
    const firstCell = snareRow.getByTestId('note-cell').first();

    // Add a note
    await firstCell.click();
    await expect(firstCell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 10000 });

    // Enter Edit mode
    await page.getByTitle('Edit Instruments').click({ force: true });

    // Handle confirm dialog - register BEFORE trigger
    page.once('dialog', (dialog) => dialog.accept());

    // Click Clear Row button
    const clearRowBtn = snareRow.locator('button[data-testid^="clear-row-"]');
    await clearRowBtn.click();

    // Verify cell is empty
    await expect(firstCell.getByTestId('note-cell-icon')).not.toBeVisible();
  });

  // TODO: Fix flakiness in redesigned UI. See Issue #73
  test.skip('should select multiple cells via dragging', async ({ page }) => {
    const snareRow = page.getByTestId('instrument-row-snare');
    await snareRow.waitFor({ state: 'visible' });
    const cells = snareRow.getByTestId('note-cell');

    const firstCell = cells.nth(0);
    const secondCell = cells.nth(1);

    // Get bounding boxes for dragging
    const box1 = await firstCell.boundingBox();
    const box2 = await secondCell.boundingBox();

    if (!box1 || !box2) throw new Error('Could not find cells');

    // Drag from center of first cell to center of second cell
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 20 });
    await page.waitForTimeout(200);
    await page.mouse.up();

    // Verify selection styling (using the data attribute)
    await expect(firstCell).toHaveAttribute('data-selected', 'true', { timeout: 15000 });
    await expect(secondCell).toHaveAttribute('data-selected', 'true', { timeout: 15000 });
  });

  // TODO: Fix flakiness in redesigned UI. See Issue #73
  test.skip('should toggle optional hits with Shift+Click', async ({ page }) => {
    const kickRow = page.getByTestId('instrument-row-kick');
    await kickRow.waitFor({ state: 'visible' });
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Toggle note first (standard)
    // Add a note first
    await firstCell.click();
    await expect(firstCell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 10000 });

    // Shift + Click to toggle optional
    await firstCell.click({ modifiers: ['Shift'] });

    // Verify it changed to standard_opt
    await expect(firstCell.getByTestId('note-cell-icon')).toHaveAttribute(
      'alt',
      'standard_opt_hit',
      {
        timeout: 15000,
      },
    );

    // Shift + Click again to toggle back
    await firstCell.click({ modifiers: ['Shift'] });
    await expect(firstCell.getByTestId('note-cell-icon')).toHaveAttribute('alt', 'standard', {
      timeout: 15000,
    });

    // Verify it changed back to standard
    await expect(firstCell.getByTestId('note-cell-icon')).toHaveAttribute('alt', 'standard', {
      timeout: 15000,
    });
  });

  test('should open symbol picker with Alt+Click', async ({ page }) => {
    const snareRow = page.getByTestId('instrument-row-snare');
    const firstCell = snareRow.getByTestId('note-cell').first();

    // Alt + Click
    await page.keyboard.down('Alt');
    await firstCell.click();
    await page.keyboard.up('Alt');

    // Verify Symbol Picker is visible
    await expect(page.getByTestId('symbol-picker')).toBeVisible({ timeout: 10000 });
  });

  // TODO: Fix flakiness in redesigned UI. See Issue #73
  test.skip('should clear selection with Delete key', async ({ page }) => {
    const kickRow = page.getByTestId('instrument-row-kick');
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

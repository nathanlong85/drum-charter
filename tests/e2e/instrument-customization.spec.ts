import { expect, test } from '@playwright/test';

test.describe('Instrument Customization', () => {
  test.beforeEach(async ({ page }) => {
    // Go to library and create a new snippet to test customization
    await page.goto('/library');
    // Switch to Snippets tab
    await page.getByTestId('tab-snippet').click();
    await page.click('button:has-text("New snippet")');
    await expect(page).toHaveURL(/\/snippets\/.+/);
  });

  test('should allow adding, editing, reordering and removing instruments', async ({ page }) => {
    const grid = page.getByTestId('groove-grid');
    await expect(grid).toBeVisible();

    // Initial instruments (default: Hi-Hat, Snare, Kick)
    await expect(page.getByTestId('instrument-row-hi-hat')).toBeVisible();
    await expect(page.getByTestId('instrument-row-snare')).toBeVisible();
    await expect(page.getByTestId('instrument-row-kick')).toBeVisible();

    // Enter Edit Mode
    await page.getByTitle('Edit Instruments').click();
    await expect(page.getByTestId('add-instrument-button')).toBeVisible();

    // Add a new instrument
    await page.getByTestId('add-instrument-button').click();
    await expect(page.getByTestId('instrument-row-new-instrument')).toBeVisible();

    // Open settings for the new instrument
    const newRow = page.getByTestId('instrument-row-new-instrument');
    await newRow.getByTitle('Edit Settings').click();

    // Modal should appear
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Change metadata
    await modal.locator('#inst-name').fill('Custom Tom');
    await modal.locator('#inst-category').selectOption('tom');
    await modal.locator('#inst-variety').fill('Floor Tom');
    await modal.getByRole('button', { name: /Save Changes/i }).click();

    // Verify update
    await expect(modal).not.toBeVisible();
    await expect(page.getByTestId('instrument-row-custom-tom')).toBeVisible();

    // Reorder: Move Custom Tom up (it should be at the bottom currently)
    // Rows: Hi-Hat, Snare, Kick, Custom Tom
    await page.getByTestId('instrument-row-custom-tom').getByTitle('Move Up').click();

    // Verify order (Kick should now be below Custom Tom)
    const rows = page.locator('[data-testid^="instrument-row-"]');
    await expect(rows.nth(2)).toHaveAttribute('data-testid', 'instrument-row-custom-tom');
    await expect(rows.nth(3)).toHaveAttribute('data-testid', 'instrument-row-kick');

    // Remove an instrument
    await page.getByTestId('instrument-row-snare').getByTitle('Edit Settings').click();

    // Setup dialog handler for confirm
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /Delete Row/i }).click();

    // Verify removal
    await expect(page.getByTestId('instrument-row-snare')).not.toBeVisible();

    // Finish Editing
    await page.getByTitle('Finish Editing').click();
    await expect(page.getByTestId('add-instrument-button')).toBeHidden();
    await expect(page.getByTitle('Move Up').first()).toBeHidden();
  });

  test('should toggle optional hits playback', async ({ page }) => {
    // Add a snippet with some optional hits
    // By default optional hits are enabled
    const optionalHitsBtn = page.getByRole('button', {
      name: /Hide Optional Hits|Play Optional Hits/,
    });

    // Initial state: Should be "Hide Optional Hits" (meaning they are currently playing)
    await expect(optionalHitsBtn).toHaveAttribute('title', 'Hide Optional Hits');

    // Toggle OFF
    await optionalHitsBtn.click();
    await expect(optionalHitsBtn).toHaveAttribute('title', 'Play Optional Hits');

    // Toggle ON
    await optionalHitsBtn.click();
    await expect(optionalHitsBtn).toHaveAttribute('title', 'Hide Optional Hits');
  });
});

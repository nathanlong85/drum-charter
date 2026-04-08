import { expect, test } from '@playwright/test';

test.describe('Groove Grid Quick Presets', () => {
  // Use unauthenticated state to see the home page demo
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    // Use the demo on the home page for testing
    await page.goto('/');

    // Wait for the groove grid to be visible
    await expect(page.getByTestId('groove-grid')).toBeVisible();
  });

  test('should show quick presets menu when clicking instrument name', async ({ page }) => {
    const row = page.getByTestId('instrument-row-hi-hat');
    await row.scrollIntoViewIfNeeded();

    // Click the instrument name area (the button with the title)
    const trigger = row.locator('button[title="Edit Settings"]');
    await expect(trigger).toBeVisible();
    await trigger.click();

    // Check if the dropdown menu is visible
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByText('Presets')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /On-Beats/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Upbeats/i })).toBeVisible();
  });

  test('should apply On-Beats preset to Hi-Hat', async ({ page }) => {
    // Click instrument name to open menu
    await page
      .getByTestId('instrument-row-hi-hat')
      .locator('button[title="Edit Settings"]')
      .click();

    // Select On-Beats
    await page.getByRole('menuitem', { name: /On-Beats/i }).click();

    // Verify some notes are now active
    // With 4/4 and 16th notes, on-beats are 1, 5, 9, 13 (0-indexed: 0, 4, 8, 12)
    const row = page.getByTestId('instrument-row-hi-hat');
    const firstNote = row.getByTestId('note-cell').nth(0);
    await expect(firstNote.getByTestId('note-cell-icon')).toBeVisible();

    const secondNote = row.getByTestId('note-cell').nth(1);
    await expect(secondNote.getByTestId('note-cell-icon')).not.toBeVisible();

    const fifthNote = row.getByTestId('note-cell').nth(4);
    await expect(fifthNote.getByTestId('note-cell-icon')).toBeVisible();
  });

  test('should toggle mute state', async ({ page }) => {
    const row = page.getByTestId('instrument-row-hi-hat');

    // Open menu
    await row.locator('button[title="Edit Settings"]').click();

    // Select Mute
    await page.getByRole('menuitem', { name: /^Mute$/i }).click();

    // Verify the row has a muted visual state (opacity-40)
    await expect(row).toHaveClass(/opacity-40/);

    // Unmute
    await row.locator('button[title="Edit Settings"]').click();
    await page.getByRole('menuitem', { name: /^Unmute$/i }).click();

    // Verify the row is no longer muted
    await expect(row).not.toHaveClass(/opacity-40/);
  });

  test('should filter presets for 5/4 time signature', async ({ page }) => {
    // Change to 5/4 using the toolbar inputs
    const beatsInput = page.locator('input[value="4"]').first();
    await beatsInput.fill('5');
    await beatsInput.press('Enter');

    // Open Hi-Hat presets
    await page
      .getByTestId('instrument-row-hi-hat')
      .locator('button[title="Edit Settings"]')
      .click();

    // Verify Upbeats is NOT present, but All On is
    await expect(page.getByRole('menuitem', { name: /Upbeats/i })).toHaveCount(0);
    await expect(page.getByRole('menuitem', { name: /All On/i })).toBeVisible();
  });
});

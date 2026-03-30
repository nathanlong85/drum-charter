import { expect, test } from '@playwright/test';

test.describe('Groove Grid Quick Presets', () => {
  test.beforeEach(async ({ page }) => {
    // Use the demo on the home page for testing
    await page.goto('/');

    // Wait for the groove grid to be visible
    await expect(page.getByTestId('groove-grid')).toBeVisible();

    const testIds = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-testid]')).map(
        (el) => (el as HTMLElement).dataset.testid,
      );
    });
    console.log('Found Test IDs:', testIds);

    // Allow for hydration
    await page.waitForTimeout(1000);
  });

  test('should show quick presets menu when clicking instrument name', async ({ page }) => {
    const row = page.getByTestId('instrument-row-hi-hat');
    await row.scrollIntoViewIfNeeded();

    // Click the instrument name area (the button with the title)
    const trigger = row.locator('button[title="Click for Quick Presets"]');
    await expect(trigger).toBeVisible();
    await trigger.click();

    // Check if the dropdown menu is visible
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByText('Quick Presets')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /On-Beats/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Upbeats/i })).toBeVisible();
  });

  test('should apply On-Beats preset to Hi-Hat', async ({ page }) => {
    // Click instrument name to open menu
    await page
      .getByTestId('instrument-row-hi-hat')
      .locator('button[title="Click for Quick Presets"]')
      .click();

    // Select On-Beats
    await page.getByRole('menuitem', { name: /On-Beats/i }).click();

    // Verify some notes are now active
    // With 4/4 and 16th notes, on-beats are 1, 5, 9, 13 (0-indexed: 0, 4, 8, 12)
    const row = page.getByTestId('instrument-row-hi-hat');
    const firstNote = row.locator('[data-index="0"]');
    await expect(firstNote).toHaveAttribute('data-active', 'true');

    const secondNote = row.locator('[data-index="1"]');
    await expect(secondNote).toHaveAttribute('data-active', 'false');

    const fifthNote = row.locator('[data-index="4"]');
    await expect(fifthNote).toHaveAttribute('data-active', 'true');
  });

  test('should toggle mute state', async ({ page }) => {
    const row = page.getByTestId('instrument-row-hi-hat');

    // Open menu
    await row.locator('button[title="Click for Quick Presets"]').click();

    // Select Mute
    await page.getByRole('menuitem', { name: /Mute/i }).click();

    // Verify the row has a muted visual state (opacity-40)
    await expect(row).toHaveClass(/opacity-40/);

    // Verify VolumeX icon is visible
    await expect(row.locator('svg.text-error')).toBeVisible();

    // Unmute
    await row.locator('button[title="Click for Quick Presets"]').click();
    await page.getByRole('menuitem', { name: /Unmute/i }).click();

    // Verify the row is no longer muted
    await expect(row).not.toHaveClass(/opacity-40/);
  });

  test('should filter presets for 5/4 time signature', async ({ page }) => {
    // Change to 5/4 using the toolbar inputs
    const beatsInput = page
      .locator('input[type="number"]')
      .filter({ has: page.locator('..').getByText('/') })
      .first();
    await beatsInput.fill('5');
    await beatsInput.press('Enter');

    // Open Hi-Hat presets
    await page
      .getByTestId('instrument-row-hi-hat')
      .locator('button[title="Click for Quick Presets"]')
      .click();

    // Verify Upbeats is NOT visible, but All On is
    await expect(page.getByRole('menuitem', { name: /Upbeats/i })).not.toBeVisible();
    await expect(page.getByRole('menuitem', { name: /All On/i })).toBeVisible();
  });
});

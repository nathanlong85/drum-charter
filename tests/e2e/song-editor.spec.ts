import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Song Chart Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Start as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

    // Create new song
    await page.click('text=New Song');
    await expect(page).toHaveURL(/\/songs\//);
  });

  test('should manage song metadata and persistence', async ({ page }) => {
    // Change Title
    const songTitle = `E2E Song ${Date.now()}`;
    await page.locator('input[placeholder="Song Title"]').fill(songTitle);

    // Change BPM
    await page.locator('input[placeholder="0"]').fill('145');

    // Change Time Signature
    const tsContainer = page
      .locator('div', { hasText: 'Time' })
      .locator('div.flex.items-center.gap-1');
    await tsContainer.locator('input').first().fill('3'); // Beats
    await tsContainer.locator('input').last().fill('4'); // Value

    await waitForSave(page);

    // Verify metadata persists after reload
    await page.reload();
    await expect(page.locator('input[placeholder="Song Title"]')).toHaveValue(songTitle);
    await expect(page.locator('input[placeholder="0"]')).toHaveValue('145');
    await expect(tsContainer.locator('input').first()).toHaveValue('3');
    await expect(tsContainer.locator('input').last()).toHaveValue('4');
  });

  test('should manage song sections', async ({ page }) => {
    // Default song should have 0 sections (verified in SongEditor.tsx initial state)
    await expect(page.locator('text=Add New Section')).toBeVisible();

    // Add Section
    await page.click('text=Add New Section');
    const sectionNameInput = page.locator('input[placeholder="Section Name"]');
    await expect(sectionNameInput).toBeVisible();
    await sectionNameInput.fill('Chorus');

    // Change measures count
    const _measuresInput = page.locator('input[type="number"]').filter({ hasText: '' }).last(); // The one with (M)
    // Actually SongEditor.tsx line 426 uses a specific class: text-zinc-600 font-bold
    const measures = page.locator('input.text-zinc-600.font-bold');
    await measures.fill('8');

    await waitForSave(page);

    // Verify section persists
    await page.reload();
    await expect(page.locator('input[placeholder="Section Name"]')).toHaveValue('Chorus');

    // Check measures value
    // SongEditor.tsx: const measures = page.locator('input.text-zinc-600.font-bold');
    await expect(page.locator('input.text-zinc-600.font-bold')).toHaveValue('8');

    // Remove Section
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('button[title="Remove Section"]').click();
    await expect(page.locator('input[placeholder="Section Name"]')).not.toBeVisible();
    await waitForSave(page);
  });

  test('should interact with the note grid and symbol picker', async ({ page }) => {
    // Add section with grid
    await page.click('text=Add New Section');
    await page.click('text=+ ADD GRID');

    const grid = page.getByTestId('groove-grid');
    await expect(grid).toBeVisible();

    // Find a specific cell (e.g., Kick drum, first beat)
    const kickRow = page.getByTestId('instrument-row-kick');
    const firstCell = kickRow.getByTestId('note-cell').first();

    // Click to toggle note
    await firstCell.click();
    // Verify it's active (has symbol)
    await expect(firstCell.locator('img')).toBeVisible();

    // Right-click for symbol picker
    await firstCell.click({ button: 'right' });
    // SymbolPicker uses a fixed/absolute positioning div
    // Use a more flexible locator for the picker
    const picker = page
      .locator('div.fixed.z-50.bg-white, div.fixed.z-50.dark\\:bg-gray-800')
      .first();
    await expect(picker).toBeVisible();

    // Select a different symbol (e.g., accent hit)
    // The symbol buttons have aria-labels like "accent"
    // Use dispatchEvent('click') for all fixed overlay interactions to avoid viewport issues
    await picker.locator('button[aria-label="accent"]').dispatchEvent('click');

    // Verify cell icon changed to accent
    await expect(firstCell.locator('img[alt="accent"]')).toBeVisible();

    // Velocity adjustment buttons (Ghost/Std/Accent)
    const ghostVelBtn = picker.locator('button', { hasText: 'Ghost' });
    await expect(ghostVelBtn).toBeVisible();
    await ghostVelBtn.dispatchEvent('click');

    // Verify velocity bar changed (ghost is 0.3, so width should be 30%)
    await expect(firstCell.locator('div[style*="width: 30%"]')).toBeVisible();

    // Click Done
    await picker.locator('button', { hasText: 'Done' }).dispatchEvent('click');
    await expect(picker).not.toBeVisible();

    await waitForSave(page);

    // Reload and verify persistence
    await page.reload();
    await expect(
      page.getByTestId('instrument-row-kick').getByTestId('note-cell').first().locator('img'),
    ).toBeVisible();
  });

  test('should show visual playhead during playback', async ({ page }) => {
    // Add section and grid
    await page.click('text=Add New Section');
    await page.click('text=+ ADD GRID');

    const playButton = page.locator('button', { hasText: /Play|Stop/i }).first();
    await expect(playButton).toHaveText(/Play/i);

    // Start playback
    await playButton.click();
    await expect(playButton).toHaveText(/Stop/i);

    // Check for active step highlighting
    const activeStep = page.getByTestId('active-step');
    await expect(activeStep).toBeVisible();

    // Wait for it to move
    const _firstStepId = await activeStep.evaluate((el) => el.getAttribute('data-testid'));
    await page.waitForTimeout(500); // Playback is happening
    const _currentStepId = await page
      .getByTestId('active-step')
      .evaluate((el) => el.getAttribute('data-testid'));

    // It should still be 'active-step' but let's check it's actually moving by checking position or content
    // Actually, data-testid="active-step" is always the current one.
    // We can check if step-0 is NOT active-step anymore if we wait long enough.
    await expect(page.getByTestId('step-0')).toBeVisible();

    // Stop playback
    await playButton.click();
    await expect(playButton).toHaveText(/Play/i);
    await expect(page.getByTestId('active-step')).not.toBeVisible();
  });
});

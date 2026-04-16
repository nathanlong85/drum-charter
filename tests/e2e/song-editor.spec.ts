import { expect, test } from '@playwright/test';
import { SongEditorPage } from './poms/SongEditorPage';

test.describe('Song Chart Editor', () => {
  let songEditorPage: SongEditorPage;

  test.beforeEach(async ({ page }) => {
    songEditorPage = new SongEditorPage(page);
    // Navigate to library
    await page.goto('/library');

    // Create new song
    await songEditorPage.createNewSongFromLibrary();
  });

  test('should manage song metadata and persistence', async ({ page }) => {
    const songTitle = `E2E Song ${Date.now()}`;
    await songEditorPage.fillMetadata(songTitle, '145', '3', '4');

    // Verify metadata persists after reload
    await page.reload();
    await songEditorPage.verifyMetadata(songTitle, '145', '3', '4');
  });

  test('should support manual order override', async ({ page }) => {
    const songTitle = `Order Test ${Date.now()}`;
    await songEditorPage.fillMetadata(songTitle, '120', '4', '4');

    await songEditorPage.addSection('Intro', '4');
    await songEditorPage.addSection('Verse', '8');

    // Verify auto-generated order in header (this is a bit tricky as header is separate)
    // But we can check it in the SongEditor's header section if it's visible or just check the input
    const orderOverrideInput = page.locator('input[placeholder*="Intro, Verse"]');
    await expect(orderOverrideInput).toBeVisible();

    // Fill override
    const manualOrder = 'Intro x2, Verse, Chorus';
    await orderOverrideInput.fill(manualOrder);
    await songEditorPage.waitForSave();

    // Reload and verify
    await page.reload();
    await expect(page.locator('input[placeholder*="Intro, Verse"]')).toHaveValue(manualOrder);
  });

  test('should manage song sections', async ({ page }) => {
    // Default song should have 0 sections (verified in SongEditor.tsx initial state)
    await expect(songEditorPage.addSectionButton).toBeVisible();

    // Add Section
    await songEditorPage.addSection('Chorus', '8');
    await page.waitForTimeout(1000);

    // Verify section persists
    await page.reload();
    await expect(songEditorPage.sectionNameInput).toHaveValue('Chorus');
    await expect(songEditorPage.measuresInput).toHaveValue('8');

    // Remove Section
    await songEditorPage.removeSection();
  });

  test('should interact with the note grid and symbol picker', async ({ page }) => {
    await songEditorPage.addSection('Verse', '4');
    await songEditorPage.addGrid();

    // Find a specific cell (e.g., Kick drum, first beat)
    const firstCell = await songEditorPage.getCell(songEditorPage.kickRow, 0);
    await firstCell.scrollIntoViewIfNeeded({ block: 'center' });

    // Toggle a note
    await songEditorPage.toggleNote(firstCell);

    // Right-click for symbol picker
    await songEditorPage.openSymbolPicker(firstCell);

    // Select a different symbol (e.g., accent hit)
    await songEditorPage.selectSymbol('Accented Hit');
    await expect(firstCell.locator('img[alt="accent"]')).toBeVisible({ timeout: 10000 });

    // Velocity adjustment buttons (GHOST/STD/ACCENT)
    await songEditorPage.setVelocity('GHOST');
    await expect(firstCell.locator('div[style*="width: 30%"]')).toBeVisible({ timeout: 10000 });

    // Click Done
    await songEditorPage.closeSymbolPicker();

    await songEditorPage.waitForSave();

    // Reload and verify persistence
    await page.reload();
    const reloadedFirstCell = await songEditorPage.getCell(songEditorPage.kickRow, 0);
    await expect(reloadedFirstCell.getByTestId('note-cell-icon')).toBeVisible();
  });

  test('should show visual playhead during playback', async ({ page }) => {
    await songEditorPage.addSection('Verse', '4');
    await songEditorPage.addGrid();

    await expect(songEditorPage.playButton).toBeEnabled({ timeout: 15000 });
    await expect(songEditorPage.playButton).toHaveText(/Play/i);

    // Start playback
    await songEditorPage.togglePlayback();

    // Check for active step highlighting
    await expect(songEditorPage.activeStep).toBeVisible();

    // Wait for it to move
    await page.waitForTimeout(500); // Playback is happening
    await expect(page.getByTestId('note-cell').first()).toBeVisible();

    // Stop playback
    await songEditorPage.togglePlayback();
    await expect(songEditorPage.activeStep).not.toBeVisible();
  });
});

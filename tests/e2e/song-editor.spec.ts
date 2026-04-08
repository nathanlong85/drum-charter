import { expect, test } from '@playwright/test';
import { SongEditorPage } from './poms/SongEditorPage';

test.describe('Song Chart Editor', () => {
  let songEditorPage: SongEditorPage;

  test.beforeEach(async ({ page }) => {
    songEditorPage = new SongEditorPage(page);
    // Start as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

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

  test('should manage song sections', async ({ page }) => {
    // Default song should have 0 sections (verified in SongEditor.tsx initial state)
    await expect(songEditorPage.addSectionButton).toBeVisible();

    // Add Section
    await songEditorPage.addSection('Chorus', '8');

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
    await expect(page.getByTestId('step-0')).toBeVisible();

    // Stop playback
    await songEditorPage.togglePlayback();
    await expect(songEditorPage.activeStep).not.toBeVisible();
  });
});

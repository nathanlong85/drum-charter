import { expect, test } from '@playwright/test';

test.describe('Playback & Metronome', () => {
  test.beforeEach(async ({ page }) => {
    // Start as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/library');

    // Create new snippet for a clean grid
    await page.getByTestId('tab-snippet').click();
    await page.click('text=New snippet');
    await expect(page).toHaveURL(/\/snippets\//);
  });

  test('should toggle playback transport controls', async ({ page }) => {
    const toolbar = page.getByTestId('groove-toolbar');
    const playButton = toolbar.locator('button', { hasText: /Play|Stop/i }).first();

    // Initial state
    await expect(playButton).toHaveText(/Play/i);
    await expect(playButton).toHaveClass(/bg-primary/);

    // Start
    await playButton.click();
    await expect(playButton).toHaveText(/Stop/i);
    await expect(playButton).toHaveClass(/bg-error/);

    // Stop
    await playButton.click();
    await expect(playButton).toHaveText(/Play/i);
    await expect(playButton).toHaveClass(/bg-primary/);
  });

  test('should manage metronome settings', async ({ page }) => {
    const toolbar = page.getByTestId('groove-toolbar');

    // Find metronome toggle (the one with title containing Metronome)
    const metronomeToggle = toolbar.locator('button[title*="Metronome"]').first();

    // Default is usually enabled? Let's check based on UI state
    const isEnabled = (await metronomeToggle.getAttribute('title')) === 'Disable Metronome';

    // Toggle
    await metronomeToggle.click();
    const newTitle = isEnabled ? 'Enable Metronome' : 'Disable Metronome';
    await expect(metronomeToggle).toHaveAttribute('title', newTitle);

    // Open Settings
    const settingsBtn = toolbar.locator('button[title="Metronome Settings"]');
    await settingsBtn.click();

    const settingsPanel = page.getByTestId('metronome-settings-panel');
    await expect(settingsPanel).toBeVisible();

    // Check volume slider
    const volumeSlider = page.getByTestId('metronome-volume-slider');
    await expect(volumeSlider).toBeVisible();

    // Change volume via slider - using dispatchEvent to ensure interaction
    await volumeSlider.fill('0.8');

    // Verify volume percentage text
    await expect(page.getByTestId('metronome-volume-value')).toHaveText('80%');

    // Click a preset button (Ghost = 0.3 = 30%)
    await settingsPanel.locator('button', { hasText: 'Ghost' }).dispatchEvent('click');
    await expect(page.getByTestId('metronome-volume-value')).toHaveText('30%');

    // Close settings
    await settingsPanel.locator('button', { hasText: 'Close' }).dispatchEvent('click');
    await expect(settingsPanel).not.toBeVisible();
  });

  test('should show beat labels and measure boundaries', async ({ page }) => {
    const grid = page.getByTestId('groove-grid');

    // Verify beat labels are visible
    await expect(grid.getByTestId('beat-label-1')).toBeVisible();
    await expect(grid.getByTestId('beat-label-2')).toBeVisible();
    await expect(grid.getByTestId('beat-label-3')).toBeVisible();
    await expect(grid.getByTestId('beat-label-4')).toBeVisible();

    // Beat 1 should have text-primary (from redesigned InstrumentRow beat label)
    await expect(grid.getByTestId('beat-label-1').first()).toHaveClass(/text-primary/);

    // Add a second measure
    const toolbar = page.getByTestId('groove-toolbar');
    await toolbar.locator('button[title="Increase measures"]').click();

    // Should now have labels for measure 2
    // Wait for the labels to appear
    await expect(grid.locator('text=1').nth(1)).toBeVisible();

    // Verify measure boundary (border-r-2) on the last beat of measure 1
    // The note at index 15 (end of measure 1 in 4/4 16th res)
    await expect(grid.getByTestId('step-15')).toHaveClass(/border-r-2/);
  });
});

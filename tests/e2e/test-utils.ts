import { expect, type Page } from '@playwright/test';

/**
 * Common wait helper for auto-save operations.
 * Auto-save is debounced (usually 2s), then async.
 * So we wait for "Saving..." to appear (optional) and then wait for it to be gone.
 */
export const waitForSave = async (page: Page) => {
  const saveIndicator = page.getByTestId('floating-save-status');
  // First, wait long enough for the 2s debounce to trigger and the save to start
  await page.waitForTimeout(3000);
  
  // Now wait for any active "Saving..." to be gone
  await expect(saveIndicator.locator('text=Saving...')).not.toBeVisible({ timeout: 20000 });
  
  // Ensure we are in a "Saved" state or at least not "Saving..."
  // (Some editors show "Saved", some just hide the indicator)
  const isSaving = await saveIndicator.locator('text=Saving...').isVisible();
  if (isSaving) {
    await expect(saveIndicator.locator('text=Saving...')).not.toBeVisible({ timeout: 10000 });
  }
};

/**
 * Waits for the GO LIVE button to be visible and enabled, then clicks it.
 */
export const waitForGoLiveAndClick = async (page: Page) => {
  const goLiveBtn = page.getByTestId('go-live-button');
  await expect(goLiveBtn).toBeVisible({ timeout: 20000 });
  await expect(goLiveBtn).not.toBeDisabled();
  // Ensure it's ready for clicking
  await goLiveBtn.click();
};

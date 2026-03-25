import { expect, type Page } from '@playwright/test';

/**
 * Common wait helper for auto-save operations.
 * Auto-save is debounced (usually 2s), then async.
 * So we wait for "Saving..." to appear (optional) and then wait for it to be gone.
 */
export const waitForSave = async (page: Page) => {
  const saveIndicator = page.getByTestId('floating-save-status').locator('text=Saving...');
  try {
    // Wait for "Saving..." to appear (optional, debounce might have finished already)
    await expect(saveIndicator).toBeVisible({ timeout: 5000 });
  } catch (_e) {
    // Already finished saving or not started yet
  }
  // Wait for it to be gone
  await expect(saveIndicator).not.toBeVisible({ timeout: 10000 });
};

/**
 * Waits for the GO LIVE button to be visible and enabled, then clicks it.
 */
export const waitForGoLiveAndClick = async (page: Page) => {
  const goLiveBtn = page.getByRole('button', { name: /GO LIVE/i });
  await expect(goLiveBtn).toBeVisible({ timeout: 20000 });
  await expect(goLiveBtn).not.toBeDisabled();
  await goLiveBtn.click({ force: true });
};

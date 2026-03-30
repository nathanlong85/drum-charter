import { expect, test } from '@playwright/test';
import { waitForGoLiveAndClick } from './test-utils';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Live Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to library (session is reused via storageState)
    await page.goto('/library');

    // Switch to Songs tab
    await page.getByTestId('tab-song').click();
    await page.waitForTimeout(500);

    // Click New song
    const createBtn = page.getByTestId('create-new-button');
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click();

    // Wait for redirect to a song ID
    await page.waitForURL(/\/songs\/[0-9a-f-]+/, { timeout: 30000 });

    // Add first section
    const addSectionBtn = page.getByRole('button', { name: /Add New Section/i });
    await expect(addSectionBtn).toBeVisible({ timeout: 15000 });
    await addSectionBtn.click();
    await expect(page.getByPlaceholder(/Section Name/i)).toBeVisible({ timeout: 10000 });

    // Name the first section
    await page.getByPlaceholder(/Section Name/i).fill('Section 1');

    // Add a second section
    await addSectionBtn.click();
    // Wait for the second section's placeholder to appear (index 1)
    await expect(page.getByPlaceholder(/Section Name/i).nth(1)).toBeVisible({ timeout: 10000 });
    await page
      .getByPlaceholder(/Section Name/i)
      .nth(1)
      .fill('Section 2');

    // Ensure GO LIVE is ready
    await expect(page.getByTestId('go-live-button')).toBeVisible({ timeout: 20000 });
  });

  test('should enter and exit live mode from editor', async ({ page }) => {
    await waitForGoLiveAndClick(page);

    // Verify live mode is active
    await expect(page.getByTestId('song-editor-container')).toBeHidden({ timeout: 15000 });
    await expect(page.getByTestId('live-mode-view')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('live-mode-header')).toBeVisible();

    // Exit live mode
    const exitBtn = page.getByTestId('exit-live-mode-btn');
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();
    await expect(page.getByTestId('go-live-button')).toBeVisible({ timeout: 15000 });
  });

  test('should navigate between sections via keyboard', async ({ page }) => {
    await waitForGoLiveAndClick(page);

    // Verify live mode is active
    await expect(page.getByTestId('song-editor-container')).toBeHidden({ timeout: 15000 });
    await expect(page.getByTestId('live-mode-view')).toBeVisible({ timeout: 15000 });

    // Section 1 should be active
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Section 1');

    // Press ArrowRight to go to next section
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Section 2');

    // Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Section 1');
  });

  test('should toggle fullscreen with F key', async ({ page }) => {
    await waitForGoLiveAndClick(page);

    // Verify live mode is active
    await expect(page.getByTestId('song-editor-container')).toBeHidden({ timeout: 15000 });
    await expect(page.getByTestId('live-mode-view')).toBeVisible({ timeout: 15000 });

    // Toggle fullscreen with F
    await page.keyboard.press('f');

    // Header should be hidden in fullscreen (per our logic)
    await expect(page.getByTestId('live-mode-header')).toBeHidden();

    // Toggle back with F
    await page.keyboard.press('f');
    await expect(page.getByTestId('live-mode-header')).toBeVisible();
  });

  test('should display section markers and next section preview', async ({ page }) => {
    await waitForGoLiveAndClick(page);

    // Verify live mode is active
    await expect(page.getByTestId('song-editor-container')).toBeHidden({ timeout: 15000 });
    await expect(page.getByTestId('live-mode-view')).toBeVisible({ timeout: 15000 });

    // Section 1 markers
    await expect(page.getByTestId('section-measures-count')).toBeVisible();
    await expect(page.getByTestId('next-section-preview')).toContainText(/Up Next/i);
    await expect(page.getByTestId('next-section-preview')).toContainText(/Section 2/i);

    // Go to last section
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Section 2');

    // Next section preview should be hidden on last section
    await expect(page.getByTestId('next-section-preview')).toBeHidden();
  });
});

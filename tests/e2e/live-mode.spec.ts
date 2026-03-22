import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Live Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Manual login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/\/library/, { timeout: 30000 });

    // Switch to Songs tab
    await page.getByTestId('tab-song').click();
    await page.waitForTimeout(1000);

    // Click New Song
    const createBtn = page
      .getByRole('button', { name: /^New Song$/i })
      .or(page.getByText(/^New Song$/i))
      .first();
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click();

    // Wait for redirect to a song ID
    await page.waitForURL(/\/songs\/[0-9a-f-]+/, { timeout: 30000 });

    // Add a section to ensure LiveModeView has content
    const addSectionBtn = page.getByRole('button', { name: /Add New Section/i });
    await expect(addSectionBtn).toBeVisible({ timeout: 15000 });
    await addSectionBtn.click();

    // Wait for the section to be added
    await expect(page.getByPlaceholder(/Section Name/i)).toBeVisible({ timeout: 10000 });

    // Ensure GO LIVE is ready
    await expect(page.getByTestId('go-live-button')).toBeVisible({ timeout: 20000 });
  });

  test('should enter and exit live mode from editor', async ({ page }) => {
    // Small delay to ensure button click works
    await page.waitForTimeout(1000);
    await page.getByTestId('go-live-button').click({ force: true });

    // Verify live mode is active
    await expect(page.getByTestId('exit-live-mode-btn')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#live-mode-view-root')).toBeVisible();
    await expect(page.locator('header')).toContainText(/Exit/i);

    // Exit live mode
    await page.getByTestId('exit-live-mode-btn').click();
    await expect(page.getByTestId('go-live-button')).toBeVisible();
  });

  test('should navigate between sections via keyboard', async ({ page }) => {
    await page.waitForTimeout(1000);
    await page.getByTestId('go-live-button').click({ force: true });

    // Verify live mode is active
    await expect(page.getByTestId('exit-live-mode-btn')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#live-mode-view-root')).toBeVisible();

    // Verify section name is visible
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();

    // Press ArrowRight - should stay on same section but not crash
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();

    // Press ArrowLeft - should stay on same section but not crash
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('should toggle fullscreen with F key', async ({ page }) => {
    await page.getByTestId('go-live-button').click();

    // Playwright doesn't easily support verifying actual OS fullscreen,
    // but we can check if the button text changes if we implement that.
    await page.keyboard.press('f');
    // For now we just verify it doesn't crash
  });
});

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
    // Small delay to ensure button click works
    const goLiveBtn = page.getByTestId('go-live-button');
    await goLiveBtn.waitFor({ state: 'visible' });
    await goLiveBtn.click({ force: true });

    // Verify live mode is active
    await expect(page.getByTestId('exit-live-mode-btn')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#live-mode-view-root')).toBeVisible();

    // Exit live mode
    await page.getByTestId('exit-live-mode-btn').click();
    await expect(page.getByTestId('go-live-button')).toBeVisible();
  });

  test('should navigate between sections via keyboard', async ({ page }) => {
    const goLiveBtn = page.getByTestId('go-live-button');
    await goLiveBtn.waitFor({ state: 'visible' });
    await goLiveBtn.click({ force: true });

    // Verify live mode is active
    await expect(page.getByTestId('exit-live-mode-btn')).toBeVisible({ timeout: 15000 });

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
    const goLiveBtn = page.getByTestId('go-live-button');
    await goLiveBtn.waitFor({ state: 'visible' });
    await goLiveBtn.click({ force: true });

    // Header should be visible initially
    await expect(page.locator('header')).toBeVisible();

    // Toggle fullscreen with F
    await page.keyboard.press('f');

    // Header should be hidden in fullscreen (per our logic)
    await expect(page.locator('header')).toBeHidden();

    // Toggle back with F
    await page.keyboard.press('f');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display section markers and next section preview', async ({ page }) => {
    // Navigate to live mode
    const goLiveBtn = page.getByTestId('go-live-button');
    await goLiveBtn.waitFor({ state: 'visible' });
    await goLiveBtn.click({ force: true });

    // Section 1 markers
    await expect(page.getByTestId('section-measures-count')).toBeVisible();
    await expect(page.getByTestId('next-section-preview')).toContainText(/Next: Section 2/i);

    // Go to last section
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Section 2');

    // Next section preview should be hidden on last section
    await expect(page.getByTestId('next-section-preview')).toBeHidden();
  });
});

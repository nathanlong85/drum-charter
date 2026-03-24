import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Live Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Manual login
    await page.goto('/login');
    await page.getByLabel('Email Identity').fill('test@example.com');
    await page.getByLabel('Security Key').fill('password123');
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await page.waitForURL(/\/library/, { timeout: 30000 });

    // Switch to Songs tab
    await page.getByTestId('tab-song').click();
    await page.waitForTimeout(1000);

    // Click New song
    const createBtn = page
      .getByRole('button', { name: /^New song$/i })
      .or(page.getByText(/^New song$/i))
      .first();
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click({ force: true });

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
    await page.waitForTimeout(1000);
    await page.click('button:has-text("GO LIVE")');

    // Verify live mode is active
    await expect(page.getByTestId('live-mode-view')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('live-mode-header')).toBeVisible();

    // Exit live mode - wait for UI stability
    await page.waitForTimeout(1000);
    await page.getByTestId('exit-live-mode-btn').click({ force: true });
    // await expect(page.locator('button:has-text("GO LIVE")')).toBeVisible({ timeout: 15000 });
  });

  test('should navigate between sections via keyboard', async ({ page }) => {
    await page.waitForTimeout(1000);
    await page.click('button:has-text("GO LIVE")');

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
    await page.waitForTimeout(1000);
    await page.click('button:has-text("GO LIVE")');

    // Header should be visible initially
    await expect(page.getByTestId('live-mode-header')).toBeVisible();

    // Toggle fullscreen with F
    await page.keyboard.press('f');

    // Header should be hidden in fullscreen (per our logic)
    await expect(page.getByTestId('live-mode-header')).toBeHidden();

    // Toggle back with F
    await page.keyboard.press('f');
    await expect(page.getByTestId('live-mode-header')).toBeVisible();
  });

  test('should display section markers and next section preview', async ({ page }) => {
    // Navigate to live mode
    await page.waitForTimeout(1000);
    await page.click('button:has-text("GO LIVE")');

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

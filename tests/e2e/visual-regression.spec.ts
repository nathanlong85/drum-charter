import { expect, test } from '@playwright/test';

test.describe('Visual Regression', () => {
  // Use a slight threshold to account for rendering differences
  const screenshotOptions = {
    threshold: 0.2,
    maxDiffPixelRatio: 0.05,
  };

  test('Dashboard visual baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('h1:has-text("Dashboard")');
    // Wait for any animations/streaming to settle
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('dashboard-baseline.png', {
      ...screenshotOptions,
      mask: [page.getByTestId('auth-user-avatar')],
    });
  });

  test('Library (Songs) visual baseline', async ({ page }) => {
    await page.goto('/library/songs');
    await page.waitForSelector('h2:has-text("My Library")');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('library-songs-baseline.png', screenshotOptions);
  });

  // FIXME: This test is temporarily marked as fixme until Linux-based CI baselines can be updated
  // to match the new multi-row wrapped grid layout (which increased from 218px to 266px height).
  test.fixme('Groove Grid visual baseline', async ({ page }) => {
    await page.goto('/library/snippets');
    await page.getByTestId('create-new-button').click();
    await page.waitForURL(/\/snippets\/.+/);

    const grid = page.getByTestId('groove-grid');
    await expect(grid).toBeVisible();
    // Wait for samples and state to settle
    await page.waitForTimeout(2000);

    await expect(grid).toHaveScreenshot('groove-grid-baseline.png', screenshotOptions);
  });

  test('Mobile Navigation baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    const bottomNav = page.getByTestId('bottom-nav');
    await expect(bottomNav).toBeVisible();

    await expect(page).toHaveScreenshot('mobile-nav-baseline.png', screenshotOptions);
  });
});

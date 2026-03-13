import { test, expect } from '@playwright/test';

test.describe('Offline Support (PWA)', () => {
  test('should show offline status indicator when connection is lost', async ({ page }) => {
    await page.goto('/');

    // Verify online initially
    await expect(page.getByText('You are offline')).not.toBeVisible();

    // Go offline
    await page.context().setOffline(true);
    
    // Check for indicator
    const offlineIndicator = page.getByText('You are offline');
    await expect(offlineIndicator).toBeVisible();
    await expect(offlineIndicator).toContainText('You are offline');

    // Go back online
    await page.context().setOffline(false);
    await expect(offlineIndicator).not.toBeVisible();
  });

  test('manifest should be linked in the head', async ({ page }) => {
    await page.goto('/');
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });
});

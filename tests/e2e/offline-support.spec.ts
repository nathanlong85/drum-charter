import { test, expect } from '@playwright/test';

test.describe('Offline Support (PWA)', () => {
  test('should show offline status indicator when connection is lost and support offline reloads', async ({ page }) => {
    // Ensure we start in a clean state
    await page.context().setOffline(false);
    await page.goto('/');
    // Wait for a stable element to ensure the app is ready
    await expect(page.locator('main')).toBeVisible();

    // Verify online initially
    await expect(page.getByText('You are offline')).not.toBeVisible();

    // Go offline
    await page.context().setOffline(true);
    
    // Check for indicator
    const offlineIndicator = page.getByText('You are offline');
    await expect(offlineIndicator).toBeVisible();

    // Test PWA: Reload while offline
    await page.reload();
    // App shell should still be visible because it's cached by the service worker
    await expect(page.locator('main')).toBeVisible();
    // Offline indicator should still be there
    await expect(page.getByText('You are offline')).toBeVisible();

    // Test cached asset: Metronome audio should be cached
    const audioAsset = await page.request.get('/audio/metronome-click.wav');
    expect(audioAsset.ok()).toBeTruthy();

    // Go back online
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.getByText('You are offline')).not.toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('manifest should be linked in the head', async ({ page }) => {
    await page.goto('/');
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });
});

import { expect, test } from '@playwright/test';

test.describe('Offline Support (PWA)', () => {
  test('should show offline status indicator when connection is lost and support offline reloads', async ({
    page,
  }) => {
    // Ensure we start in a clean state
    await page.context().setOffline(false);
    await page.goto('/');

    // Wait for the app shell to be visible
    const appShell = page.locator('main');
    await expect(appShell).toBeVisible();

    // Verify online initially
    await expect(page.getByText('You are offline')).not.toBeVisible();

    // Test cached asset: Metronome audio should be cached
    // Use a direct fetch in the browser context to verify service worker caching
    await page.evaluate(async () => {
      await fetch('/audio/samples/metronome/click_high.wav');
    });

    // Go offline
    await page.context().setOffline(true);

    // Check for indicator
    await expect(offlineIndicator).toBeVisible();

    // Test PWA: Reload while offline
    await page.reload();

    // App shell should still be visible because it's cached by the service worker
    await expect(page.locator('main')).toBeVisible();

    // Offline indicator should still be there
    await expect(page.getByText('You are offline')).toBeVisible();

    const isCached = await page.evaluate(async () => {
      const response = await fetch('/audio/samples/metronome/click_high.wav');
      return response.ok;
    });
    expect(isCached).toBeTruthy();

    // Go back online
    await page.context().setOffline(false);
    // Wait for the indicator to disappear (should be automatic via 'online' event)
    await expect(page.getByText('You are offline')).not.toBeVisible();
  });

  test('manifest should be linked in the head', async ({ page }) => {
    await page.goto('/');
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });
});

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

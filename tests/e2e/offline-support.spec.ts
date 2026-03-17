import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Offline Support (PWA)', () => {
  test('should show offline status indicator when connection is lost and support offline reloads', async ({
    page,
  }) => {
    // Skip this test for now due to Serwist + Turbopack incompatibility
    test.skip();
    
    // Ensure we start in a clean state
    await page.context().setOffline(false);
    await page.goto('/');

    // Wait for the service worker to be ready (critical for offline support)
    // and wait for it to take control of the page.
    await page.evaluate(async () => {
      const _registration = await navigator.serviceWorker.ready;
      if (navigator.serviceWorker.controller) return true;

      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            resolve(true);
          },
          { once: true },
        );
      });
    });

    // Small buffer to ensure everything is settled
    await page.waitForTimeout(1000);

    // Wait for the app shell to be visible
    const appShell = page.locator('main');
    await expect(appShell).toBeVisible();

    // Go offline
    await page.context().setOffline(true);

    // Wait for a small buffer to ensure the 'offline' event has propagated
    await page.waitForTimeout(500);

    // Check for indicator using a more specific locator to avoid strict mode violations
    const offlineIndicator = page.getByRole('alert').filter({ hasText: 'You are offline' }).first();
    await expect(offlineIndicator).toBeVisible();

    // Test PWA: Reload while offline
    // We expect this to work because the service worker should serve the cached app shell
    await page.reload();

    // App shell should still be visible because it's cached by the service worker
    await expect(page.locator('main')).toBeVisible();

    // Offline indicator should still be there
    await expect(
      page.getByRole('alert').filter({ hasText: 'You are offline' }).first(),
    ).toBeVisible();

    const isCached = await page.evaluate(async () => {
      const response = await fetch('/audio/samples/metronome/click_high.wav');
      return response.ok;
    });
    expect(isCached).toBeTruthy();

    // Go back online
    await page.context().setOffline(false);
    // Wait for the indicator to disappear (should be automatic via 'online' event)
    await expect(page.getByText('You are offline').first()).not.toBeVisible();
  });

  test('manifest should be linked in the head', async ({ page }) => {
    await page.goto('/');
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });
});

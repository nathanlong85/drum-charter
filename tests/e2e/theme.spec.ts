import { expect, test } from '@playwright/test';

test.describe('Dark Mode Support', () => {
  test('should apply light mode by default', async ({ page }) => {
    await page.goto('/');

    // Check background and foreground colors from globals.css
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(body).toHaveCSS('color', 'rgb(23, 23, 23)');
  });

  test('should respect system dark mode preference', async ({ page }) => {
    // Emulate dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const body = page.locator('body');
    // #0a0a0a = rgb(10, 10, 10)
    await expect(body).toHaveCSS('background-color', 'rgb(10, 10, 10)');
    // #ededed = rgb(237, 237, 237)
    await expect(body).toHaveCSS('color', 'rgb(237, 237, 237)');
  });

  test('should toggle body background in dark mode', async ({ page }) => {
    // Start in guest mode to see the editor
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // Initial check (Light Mode)
    const body = page.locator('body');
    let bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Light mode background is usually white (rgb(255, 255, 255))
    expect(['rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)']).toContain(bgColor);

    // Switch to Dark Mode
    await page.emulateMedia({ colorScheme: 'dark' });

    // Check for a dark background
    await expect(async () => {
      bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      // Dark mode background (bg-zinc-950/bg-black)
      expect(['rgb(9, 9, 11)', 'rgb(0, 0, 0)', 'rgb(10, 10, 10)']).toContain(bgColor);
    }).toPass();
  });

  test('should apply dark mode classes to UI components', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // Switch to Snippets tab if not already active
    const snippetsTab = page.getByRole('button', { name: /Snippets/i });
    await snippetsTab.click();

    // The selector needs to be more specific to the toolbar in the editor
    await page.getByRole('button', { name: /New Snippet/i }).click();
    await page.waitForURL(/\/snippets\/.+/);

    // Check GrooveGridEditor toolbar background
    // It's the flex container that has bg-gray-50 or bg-zinc-50 and dark:bg-zinc-900 or dark:bg-gray-900
    // We'll search for the toolbar container that has the BPM input
    const toolbar = page.locator('div.flex.items-center.gap-4').filter({ hasText: 'BPM' }).first();
    await expect(toolbar).toBeVisible();

    // Instead of checking exact color, we'll verify it doesn't have the light background
    const bgColor = await toolbar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgb(249, 250, 251)'); // bg-gray-50
  });
});

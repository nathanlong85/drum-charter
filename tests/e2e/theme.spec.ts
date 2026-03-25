import { expect, test } from '@playwright/test';

test.describe('Dark Mode Support', () => {
  test('should apply light mode by default', async ({ page }) => {
    await page.goto('/');

    // Check background and foreground colors from globals.css
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(245, 247, 248)');
    await expect(body).toHaveCSS('color', 'rgb(44, 47, 48)');
  });

  test('should respect system dark mode preference', async ({ page }) => {
    // Emulate dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const body = page.locator('body');
    // Dark mode: --background: #0e0e0e = rgb(14, 14, 14), --on-background: #ffffff = rgb(255, 255, 255)
    await expect(body).toHaveCSS('background-color', 'rgb(14, 14, 14)');
    await expect(body).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('should toggle body background in dark mode', async ({ page }) => {
    // Start in guest mode to see the editor
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // Initial check (Light Mode)
    const body = page.locator('body');
    let bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Light mode background is (rgb(245, 247, 248))
    expect(bgColor).toBe('rgb(245, 247, 248)');

    // Switch to Dark Mode
    await page.emulateMedia({ colorScheme: 'dark' });

    // Check for a dark background
    await expect(async () => {
      bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      // Dark mode background
      expect(['rgb(14, 14, 14)', 'rgb(0, 0, 0)']).toContain(bgColor);
    }).toPass();
  });

  test('should apply dark mode classes to UI components', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // Switch to Snippets tab if not already active
    const snippetsTab = page.getByTestId('tab-snippet');
    await snippetsTab.click();

    // The selector needs to be more specific to the toolbar in the editor
    await page.getByRole('button', { name: /New snippet/i }).click();
    await page.waitForURL(/\/snippets\/.+/);

    // Check GrooveGridEditor toolbar background
    const toolbar = page.locator('[data-testid="groove-toolbar"]').first();
    await expect(toolbar).toBeVisible();

    // Check for dark-mode background color
    const bgColor = await toolbar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // In some browsers/environments, this might resolve to a lab() color or rgb()
    // We'll check that it's a dark color (very low lightness)
    if (bgColor.startsWith('rgb')) {
      const match = bgColor.match(/\d+/g);
      if (match) {
        const [r, g, b] = match.map(Number);
        expect(r).toBeLessThan(30);
        expect(g).toBeLessThan(35);
        expect(b).toBeLessThan(50);
      }
    } else if (bgColor.startsWith('lab')) {
      // lab(8.11897 0.811279 -12.254) -> Lightness is ~8%
      const match = bgColor.match(/[\d.]+/);
      if (match) {
        const lightness = Number(match[0]);
        expect(lightness).toBeLessThan(15);
      }
    } else {
      // Fallback for other formats
      expect(bgColor).not.toBe('rgb(255, 255, 255)');
    }
  });
});

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

  test('should invert drum symbols in dark mode', async ({ page }) => {
    // Start in guest mode to see the editor
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // Create a new snippet to get to the editor
    await page.getByRole('button', { name: /New Snippet/i }).click();
    await page.waitForURL(/\/snippets\/.+/);

    // Initial check (Light Mode)
    const firstCell = page.locator('.w-8.h-8').first();
    // Click to add a symbol (assuming empty cell)
    await firstCell.click();

    const symbolImg = firstCell.locator('img');
    await expect(symbolImg).toBeVisible();
    await expect(symbolImg).not.toHaveClass(/dark:invert/); // class exists but filter shouldn't be active in light

    // In light mode, the computed filter should be 'none' or equivalent
    let filter = await symbolImg.evaluate((el) => window.getComputedStyle(el).filter);
    expect(filter === 'none' || filter === '').toBeTruthy();

    // Switch to Dark Mode
    await page.emulateMedia({ colorScheme: 'dark' });

    // In dark mode, 'dark:invert' (invert(1)) should be applied
    filter = await symbolImg.evaluate((el) => window.getComputedStyle(el).filter);
    expect(filter).toContain('invert(1)');
  });

  test('should apply dark mode classes to UI components', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);
    await page.getByRole('button', { name: /New Snippet/i }).click();
    await page.waitForURL(/\/snippets\/.+/);

    // Check GrooveGridEditor toolbar background
    // GrooveGridEditor has className="flex items-center gap-4 mb-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
    const toolbar = page.locator('.bg-gray-50.dark\\:bg-gray-900').first();
    await expect(toolbar).toBeVisible();

    // bg-gray-900 in Tailwind is usually rgb(17, 24, 39)
    await expect(toolbar).toHaveCSS('background-color', 'rgb(17, 24, 39)');
  });
});

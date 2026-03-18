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
    await page.getByRole('button', { name: 'New Snippet' }).click();
    await page.waitForURL(/\/snippets\/.+/);

    // Initial check (Light Mode)
    // The NoteCell is inside the main grid. We'll look for a cell in the first InstrumentRow.
    const firstCell = page.locator('.w-8.h-8.border-r').first();
    await expect(firstCell).toBeVisible();
    
    // Click to add a symbol (assuming empty cell)
    await firstCell.click();
    
    const symbolImg = firstCell.locator('img');
    await expect(symbolImg).toBeVisible();
    
    // In light mode, the computed filter should be 'none' or equivalent
    let filter = await symbolImg.evaluate((el) => window.getComputedStyle(el).filter);
    expect(filter === 'none' || filter === '').toBeTruthy();

    // Switch to Dark Mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // In dark mode, 'dark:invert' (invert(1)) should be applied
    // We might need a small delay or to re-evaluate the style
    await expect(async () => {
      filter = await symbolImg.evaluate((el) => window.getComputedStyle(el).filter);
      expect(filter).toContain('invert(1)');
    }).toPass();
  });

  test('should apply dark mode classes to UI components', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);
    
    // The selector needs to be more specific to the toolbar in the editor
    await page.getByRole('button', { name: 'New Snippet' }).click();
    await page.waitForURL(/\/snippets\/.+/);

    // Check GrooveGridEditor toolbar background
    // It's the flex container that has bg-gray-50 and dark:bg-gray-900
    const toolbar = page.locator('div.flex.items-center.gap-4.bg-gray-50').first();
    await expect(toolbar).toBeVisible();
    
    // bg-gray-900 in Tailwind is usually rgb(17, 24, 39)
    await expect(toolbar).toHaveCSS('background-color', 'rgb(17, 24, 39)');
  });
});

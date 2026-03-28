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

  test('should apply dark mode to all major pages', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    const pages = [
      { path: '/', name: 'Home' },
      { path: '/login', name: 'Login' },
    ];

    for (const p of pages) {
      await page.goto(p.path);
      const body = page.locator('body');
      const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(['rgb(14, 14, 14)', 'rgb(0, 0, 0)'], `Page ${p.name} should be dark`).toContain(
        bgColor,
      );
    }

    // Authenticated pages
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    const authPages = [
      { path: '/library', name: 'Library' },
      { path: '/manual', name: 'Manual' },
    ];

    for (const p of authPages) {
      await page.goto(p.path);
      const body = page.locator('body');
      const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(['rgb(14, 14, 14)', 'rgb(0, 0, 0)'], `Auth Page ${p.name} should be dark`).toContain(
        bgColor,
      );
    }
  });

  test('should apply dark mode to editor pages', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // Check Song Editor
    await page.getByTestId('tab-song').click();
    await page.getByTestId('create-new-button').click();
    await page.waitForURL(/\/songs\/.+/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 14, 14)');

    // Check Snippet Editor
    await page.goto('/library?tab=snippet');
    await page.getByTestId('create-new-button').click();
    await page.waitForURL(/\/snippets\/.+/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 14, 14)');

    // Check Notebook Editor
    await page.goto('/library?tab=notebook');
    await page.getByTestId('create-new-button').click();
    await page.waitForURL(/\/notebooks\/.+/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 14, 14)');

    // Check Setlist Editor
    await page.goto('/library?tab=setlist');
    await page.getByTestId('create-new-button').click();
    await page.waitForURL(/\/setlists\/.+/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 14, 14)');
  });
});

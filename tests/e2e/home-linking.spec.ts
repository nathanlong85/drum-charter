import { expect, test } from '@playwright/test';

test.describe('Universal Home Logo Linking', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a sub-page to test "Return to Home"
    await page.goto('/manual');
  });

  test('sidebar logo links to home and has hover effects', async ({ page }) => {
    const sidebarLogo = page
      .locator('aside')
      .getByRole('link', { name: 'DrumCharter Home' })
      .first();

    // Check link destination
    await expect(sidebarLogo).toHaveAttribute('href', '/');

    // Check for interactive classes (group, hover:opacity-80)
    const className = await sidebarLogo.getAttribute('class');
    expect(className).toContain('group');
    expect(className).toContain('hover:opacity-80');

    // Click and verify navigation
    await sidebarLogo.click();
    await expect(page).toHaveURL('/');
  });

  test('top bar logo links to home and has hover effects', async ({ page }) => {
    const topBarLogo = page
      .locator('header')
      .getByRole('link', { name: 'DrumCharter Home' });

    // Check link destination
    await expect(topBarLogo).toHaveAttribute('href', '/');

    // Check for interactive classes
    const className = await topBarLogo.getAttribute('class');
    expect(className).toContain('hover:opacity-80');

    // Click and verify navigation
    await topBarLogo.click();
    await expect(page).toHaveURL('/');
  });
});

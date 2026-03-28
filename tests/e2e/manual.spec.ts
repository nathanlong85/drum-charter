import { expect, test } from '@playwright/test';

test.describe('Manual Page', () => {
  test('should render the manual correctly', async ({ page }) => {
    // Start in guest mode
    await page.goto('/login');
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.waitForURL(/\/library/);

    // Navigate to manual
    await page.goto('/manual');

    // Check for title
    await expect(page.getByRole('heading', { name: 'User Manual' })).toBeVisible();

    // Check for sections
    await expect(page.getByRole('heading', { name: 'Welcome to DrumCharter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Core Features' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Groove Grid' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Performance & MIDI' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Managing Your Library' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Troubleshooting' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
  });
});

import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials from seed.sql
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  
  // Click sign in and wait for navigation to library
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for redirect to library
  await page.waitForURL(/\/library/, { timeout: 30000 });
  await expect(page.getByText(/My Library/i)).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});

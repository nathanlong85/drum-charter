import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials from seed.sql
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');

  // Click sign in and wait for navigation to dashboard
  const submitBtn = page.locator('button[type="submit"]');
  await expect(submitBtn).toBeVisible({ timeout: 15000 });
  await submitBtn.click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 90000 });
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});

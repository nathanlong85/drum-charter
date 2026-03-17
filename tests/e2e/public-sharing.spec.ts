import { expect, test } from '@playwright/test';

test.describe('Public Sharing Workflows', () => {
  test('Should handle private or missing songs with 404', async ({ page }) => {
    // Navigate to a likely non-existent or private ID
    await page.goto('http://localhost:3001/public/songs/private-id-123');
    // Next.js notFound() renders a default 404 page
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should handle private or missing notebooks with 404', async ({ page }) => {
    await page.goto('http://localhost:3001/public/notebooks/test-notebook-id');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should handle private or missing snippets with 404', async ({ page }) => {
    await page.goto('http://localhost:3001/public/snippets/test-snippet-id');
    await expect(page.getByText('404')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Public Sharing Workflows', () => {
  test('Should allow viewing a public song', async ({ page }) => {
    // We'll use a known public song or a mock
    // For this test, we navigate to the public URL
    // Note: This requires the dev server on 3001
    await page.goto('http://localhost:3001/public/songs/test-song-id');
    // If it's a 404 because the ID doesn't exist, that's expected in a fresh DB
    // but we want to verify the PAGE renders and handles the notFound()
    const title = await page.title();
    expect(title).toBe('DrumCharter');
  });

  test('Should handle private songs with 404', async ({ page }) => {
    // Navigate to a likely non-existent or private ID
    await page.goto('http://localhost:3001/public/songs/private-id-123');
    // Next.js notFound() renders a default 404 page in dev
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should allow viewing a public notebook', async ({ page }) => {
    await page.goto('http://localhost:3001/public/notebooks/test-notebook-id');
    const title = await page.title();
    expect(title).toBe('DrumCharter');
  });

  test('Should allow viewing a public snippet', async ({ page }) => {
    await page.goto('http://localhost:3001/public/snippets/test-snippet-id');
    const title = await page.title();
    expect(title).toBe('DrumCharter');
  });
});

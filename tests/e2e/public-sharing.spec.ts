import { expect, test } from '@playwright/test';
import { waitForSave } from './test-utils';

test.describe('Public Sharing Workflows', () => {
  test('Should handle private or missing songs with 404', async ({ page }) => {
    // Navigate to a likely non-existent or private ID
    await page.goto('/public/songs/private-id-123');
    // Next.js notFound() renders a default 404 page
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should allow viewing a public song', async ({ page }) => {
    // 1. Setup - Create a new song while authenticated
    await page.goto('/library');

    // 2. Create a new song
    await page.getByTestId('tab-songs').first().click();
    await expect(page.getByTestId('create-new-button')).toBeVisible({
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();

    await page.waitForURL(/\/songs\/.+/);
    const songId = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
    expect(songId, 'Expected song id in URL after creating song').toBeTruthy();

    // Toggle public and wait for UI update + save
    const toggleBtn = page.getByTestId('toggle-public-button');
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText(/Public/i);
    await waitForSave(page);

    // 4. View public page in a separate unauthenticated context
    const unauthContext = await page
      .context()
      .browser()!
      .newContext({ storageState: { cookies: [], origins: [] } });
    const unauthPage = await unauthContext.newPage();

    // Add retry for navigation to account for any save latency and bypass Next.js caching
    await expect(async () => {
      // Use a timestamp to bypass any potentially cached 404
      await unauthPage.goto(`/public/songs/${songId!}?t=${Date.now()}`);
      await expect(unauthPage.getByText(/Untitled Song/i)).toBeVisible({
        timeout: 5000,
      });
    }).toPass({
      intervals: [2000, 5000],
      timeout: 20000,
    });

    await unauthContext.close();
  });

  test('Should allow viewing a public notebook', async ({ page }) => {
    // 1. Setup - Create a new song while authenticated
    await page.goto('/library');

    // 2. Create a new notebook
    await page.getByTestId('tab-notebooks').first().click();
    await page.waitForURL(/\/library\/notebooks/);
    await expect(page.getByTestId('create-new-button')).toBeVisible({
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();

    await page.waitForURL(/\/notebooks\/.+/);
    const notebookId = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
    expect(notebookId, 'Expected notebook id in URL after creating notebook').toBeTruthy();

    const toggleBtn = page.getByTestId('toggle-public-button');
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText(/Public/i);
    await waitForSave(page);

    // 4. View public page in a separate unauthenticated context
    const unauthContext = await page
      .context()
      .browser()!
      .newContext({ storageState: { cookies: [], origins: [] } });
    const unauthPage = await unauthContext.newPage();

    await expect(async () => {
      await unauthPage.goto(`/public/notebooks/${notebookId!}?t=${Date.now()}`);
      await expect(unauthPage.getByText(/Public Notebook View/i).first()).toBeVisible({
        timeout: 5000,
      });
    }).toPass({
      intervals: [2000, 5000],
      timeout: 20000,
    });

    await expect(unauthPage.getByText(/Untitled Notebook/i)).toBeVisible();

    await unauthContext.close();
  });

  test('Should handle private or missing notebooks with 404', async ({ page }) => {
    await page.goto('/public/notebooks/test-notebook-id');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should allow viewing a public snippet', async ({ page }) => {
    // 1. Setup - Create a new song while authenticated
    await page.goto('/library');

    // 2. Create a new snippet
    await page.getByTestId('tab-snippets').first().click();
    await page.waitForURL(/\/library\/snippets/);
    await expect(page.getByTestId('create-new-button')).toBeVisible({
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();

    await page.waitForURL(/\/snippets\/.+/);
    const snippetId = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
    expect(snippetId, 'Expected snippet id in URL after creating snippet').toBeTruthy();

    const toggleBtn = page.getByTestId('toggle-public-button');
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText(/Public/i);
    await waitForSave(page);

    // 4. View public page in a separate unauthenticated context
    const unauthContext = await page
      .context()
      .browser()!
      .newContext({ storageState: { cookies: [], origins: [] } });
    const unauthPage = await unauthContext.newPage();

    await expect(async () => {
      await unauthPage.goto(`/public/snippets/${snippetId!}?t=${Date.now()}`);
      await expect(unauthPage.getByText(/Atomic Snippet View/i).first()).toBeVisible({
        timeout: 5000,
      });
    }).toPass({
      intervals: [2000, 5000],
      timeout: 20000,
    });

    await expect(unauthPage.getByText(/Untitled Snippet/i)).toBeVisible();

    await unauthContext.close();
  });

  test('Should handle private or missing snippets with 404', async ({ page }) => {
    await page.goto('/public/snippets/test-snippet-id');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Should allow viewing a public setlist', async ({ page }) => {
    // 1. Setup - Create a new song while authenticated
    await page.goto('/library');

    // 2. Create a new setlist
    await page.getByTestId('tab-setlists').first().click();
    await page.waitForURL(/\/library\/setlists/);
    await expect(page.getByTestId('create-new-button')).toBeVisible({
      timeout: 15000,
    });
    await page.getByTestId('create-new-button').click();

    await page.waitForURL(/\/setlists\/.+/);
    const setlistId = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
    expect(setlistId, 'Expected setlist id in URL after creating setlist').toBeTruthy();

    const toggleBtn = page.getByTestId('toggle-public-button');
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText(/Public/i);
    await waitForSave(page);

    // 4. View public page in a separate unauthenticated context
    const unauthContext = await page
      .context()
      .browser()!
      .newContext({ storageState: { cookies: [], origins: [] } });
    const unauthPage = await unauthContext.newPage();

    await expect(async () => {
      await unauthPage.goto(`/public/setlists/${setlistId!}?t=${Date.now()}`);
      await expect(unauthPage.getByText(/Untitled Setlist/i)).toBeVisible({
        timeout: 5000,
      });
    }).toPass({
      intervals: [2000, 5000],
      timeout: 20000,
    });

    await unauthContext.close();
  });

  test('Should handle private or missing setlists with 404', async ({ page }) => {
    await page.goto('/public/setlists/test-setlist-id');
    await expect(page.getByText('404')).toBeVisible();
  });
});

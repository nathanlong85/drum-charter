import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
  test.describe('Public', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Unauthenticated user sees Marketing Hero', async ({ page }) => {
      await page.goto('/');

      // Check for Marketing Hero elements
      await expect(page.getByText(/The Workspace Built For Rhythm/i)).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign In/i }).first()).toBeVisible();
      await expect(page.getByText(/V1.0 ALPHA REDESIGN NOW LIVE/i)).toBeVisible();
    });
  });
  test.describe('Authenticated Dashboard', () => {
    // Use the storage state from auth.setup.ts
    test.use({ storageState: 'playwright/.auth/user.json' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('Authenticated user sees dashboard', async ({ page }) => {
      // Check for Dashboard elements
      await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
      await expect(page.getByText(/Welcome back/i)).toBeVisible();

      // Check for Quick Start section
      await expect(page.getByRole('heading', { name: /Quick Start/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /New Song Chart/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /New Groove Snippet/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /New Practice Notebook/i })).toBeVisible();

      // Check for Recent Activity section
      await expect(
        page.getByRole('heading', { name: 'Recent Activity', exact: true }),
      ).toBeVisible();
    });

    test('Quick Start "New Song Chart" works', async ({ page }) => {
      const newSongButton = page.getByRole('button', { name: /New Song Chart/i });
      await newSongButton.click();

      // Should redirect to song editor
      await expect(page).toHaveURL(/\/songs\/.+/);
      await expect(page.getByPlaceholder(/Song Title/i)).toBeVisible();
    });

    test('Quick Start "New Groove Snippet" works', async ({ page }) => {
      const newSnippetButton = page.getByRole('button', { name: /New Groove Snippet/i });
      await newSnippetButton.click();

      // Should redirect to snippet editor
      await expect(page).toHaveURL(/\/snippets\/.+/);
      await expect(page.getByPlaceholder(/Snippet Title/i)).toBeVisible();
    });

    test('Quick Start "New Practice Notebook" works', async ({ page }) => {
      const newNotebookButton = page.getByRole('button', { name: /New Practice Notebook/i });
      await newNotebookButton.click();

      // Should redirect to notebook editor
      await expect(page).toHaveURL(/\/notebooks\/.+/);
      await expect(page.getByPlaceholder(/Notebook Title/i)).toBeVisible();
    });

    test('Navigation links work', async ({ page }) => {
      await test.step('Navigate to Library', async () => {
        await page
          .getByRole('link', { name: /Library/i })
          .first()
          .click();
        await expect(page).toHaveURL(/\/library/);
        await expect(page.getByRole('heading', { name: /My Library/i })).toBeVisible();
      });

      await page.goto('/');

      await test.step('Navigate to Setlists', async () => {
        await page
          .getByRole('link', { name: /Setlists/i })
          .first()
          .click();
        await expect(page).toHaveURL(/\/setlists/);
      });

      await page.goto('/');

      await test.step('Navigate to Manual', async () => {
        await page
          .getByRole('link', { name: /User Manual/i })
          .first()
          .click();
        await expect(page).toHaveURL(/\/manual/);
      });
    });
  });
});

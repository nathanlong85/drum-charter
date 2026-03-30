import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);
  const testIds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid]')).map(
      (el) => (el as HTMLElement).dataset.testid,
    );
  });
  console.log('Test IDs found:', testIds);
  await browser.close();
})();

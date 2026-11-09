import { test, expect, devices } from '@playwright/test';
import { requireEnv } from '../helpers';

// iPhone screen size and user agent, run in Chromium (the browser type can't change inside a file).
const { defaultBrowserType, ...iphone } = devices['iPhone 15'];
test.use(iphone);

// ENG-450 (F7): the CFP form's info page fits the phone screen, with nothing cut off sideways.
// Read-only: opens the /event page of the open QA form.
test('ENG-450 CFP info page fits an iPhone screen', async ({ page }) => {
  await page.goto(`${requireEnv('CFP_OPEN_FORM')}/event`);
  await page.waitForLoadState('networkidle');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'The page is wider than the screen (horizontal scroll)').toBeLessThanOrEqual(1);
});

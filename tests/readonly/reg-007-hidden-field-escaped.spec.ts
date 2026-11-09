import { test, expect } from '@playwright/test';

// The editor page source can include session data, so traces and screenshots are off here.
test.use({ trace: 'off', screenshot: 'off' });

// REG-007 / ENG-2180 (F4): hidden fields on the editor purchase form are escaped.
// Uses the run's saved session (tests/setup). The page auto-submits to /purchase/index.php,
// so the raw HTML is read without running it (same as view-source). Never prints the page source.
test('REG-007 editor purchase form escapes sub_code', async ({ page }, info) => {
  const event = process.env.QA_EVENT || 'qaengf6app';
  const base = new URL(info.project.use.baseURL || 'https://sched.com');
  const eventUrl = `${base.protocol}//${event}.${base.host}/editor/signup?sub_code=qatest%22%3E%3Cb%3Ex`;
  const response = await page.context().request.get(eventUrl);
  const html = await response.text();

  expect(html.includes('purchasecode'), 'The purchase form (purchasecode field) did not load').toBe(true);
  expect(html.includes('qatest"><b>x'), 'sub_code is printed unescaped (ENG-2180)').toBe(false);
  expect(html.includes('qatest&quot;&gt;&lt;b&gt;x'), 'sub_code is not escaped as expected').toBe(true);
});

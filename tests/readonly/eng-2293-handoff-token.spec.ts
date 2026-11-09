import { test, expect } from '@playwright/test';

// Traces and screenshots would capture the page source and session data, so they are off here.
test.use({ trace: 'off', screenshot: 'off' });

// ENG-2293 (F3): the Dashboard sign-in handoff page must not print the viewer's login token.
// Uses the run's saved session (tests/setup). Expected to FAIL until the fix is deployed.
// Never prints the page source or the token.
test('ENG-2293 handoff page source has no login token', async ({ page }) => {
  const response = await page.context().request.get('/connect/dashboard?path=test', { maxRedirects: 0 });
  const html = await response.text();
  const hasToken = /["']token["']\s*:\s*["'][^"']+["']/.test(html);
  expect(hasToken, 'The handoff page source still contains a login token (ENG-2293)').toBe(false);
});

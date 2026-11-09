import { test, expect, Page } from '@playwright/test';
import { requireEnv } from '../helpers';

// TC-F7-02 (F7): a CFP form accepts applications only between its opening and closing dates.
// Read-only: opens the public links of three QA forms on the production CFP (qaengreminders).
// An open form shows "Ready to speak? ... Apply now" with a "Submit" button (checked 2026-11-04).
function submitControl(page: Page) {
  return page
    .getByRole('button', { name: /^(submit|apply)$/i })
    .or(page.getByRole('link', { name: /^(submit|apply)$/i }));
}

test.describe('TC-F7-02 CFP dates', () => {
  test('an open form offers Submit', async ({ page }) => {
    await page.goto(requireEnv('CFP_OPEN_FORM'));
    await expect(submitControl(page)).toBeVisible();
    await expect(page.getByText(/currently closed/i)).toHaveCount(0);
  });

  test('a form that opens in the future is closed, with no Submit', async ({ page }) => {
    await page.goto(requireEnv('CFP_FUTURE_FORM'));
    await expect(page.getByText(/currently closed/i)).toBeVisible();
    await expect(submitControl(page)).toHaveCount(0);
  });

  test('a form past its closing date is closed, with no Submit', async ({ page }) => {
    await page.goto(requireEnv('CFP_CLOSED_FORM'));
    await expect(page.getByText(/currently closed/i)).toBeVisible();
    await expect(submitControl(page)).toHaveCount(0);
  });
});

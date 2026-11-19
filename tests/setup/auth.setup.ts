import { test as setup, expect } from '@playwright/test';
import { creds } from '../helpers';

// Logs in once per run and saves the session, so tests don't log in again and again
// (Sched throttles repeated logins). The file holds session cookies: it's git-ignored
// and should be deleted after the run (see README).
setup('log in to production once', async ({ page }) => {
  const c = creds('prod');
  await page.goto(`${process.env.SCHED_BASE_URL || 'https://sched.com'}/login`);
  const main = page.getByRole('main');
  await main.getByRole('textbox').nth(0).fill(c.email);
  await main.getByRole('textbox').nth(1).fill(c.password);
  await main.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page, 'Sched login failed (still on /login)').not.toHaveURL(/\/login/, { timeout: 20_000 });
  await page.context().storageState({ path: '.auth/prod.json' });
});

import { test as setup, expect } from '@playwright/test';
import { requireEnv } from '../helpers';

// Logs in to an eph event's editor once per run and saves the session (.auth/eph.json).
// eph has its own database: use the docker-cd test accounts (see README), not production ones.
setup('log in to the eph editor once', async ({ page }) => {
  const base = requireEnv('EPH_BASE_URL').replace(/\/$/, '');
  await page.goto(`${base}/editor/login`);
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.getByRole('textbox').first().fill(requireEnv('EPH_USERNAME'));
  await form.locator('input[type="password"]').fill(requireEnv('EPH_PASSWORD'));
  await form.getByRole('button', { name: /^log in$/i }).click();
  await expect(page, 'eph editor login failed (still on /editor/login)').not.toHaveURL(/\/editor\/login/, { timeout: 20_000 });
  await page.context().storageState({ path: '.auth/eph.json' });
});

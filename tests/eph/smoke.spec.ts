import { test, expect } from '@playwright/test';

// eph smoke: the environment is up and the saved admin session works. Read-only.
test.describe('eph smoke', () => {
  test('the editor opens for the admin', async ({ page }) => {
    await page.goto('/editor');
    await expect(page, 'Redirected to the login page').not.toHaveURL(/\/editor\/login/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 2 })).toBeVisible({ timeout: 15_000 });
  });

  test('settings show the event visibility section', async ({ page }) => {
    await page.goto('/editor/settings');
    await expect(page.getByText(/event visibility/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('the public schedule opens for the logged-in admin', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /^schedule$/i }).or(page.getByText(/^schedule$/i)).first()).toBeVisible({ timeout: 15_000 });
  });
});

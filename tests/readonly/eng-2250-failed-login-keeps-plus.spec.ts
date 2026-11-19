import { test, expect } from '@playwright/test';

// Starts logged out (the run's saved session would skip the login page).
test.use({ storageState: { cookies: [], origins: [] } });

// TC-F3-03 / ENG-2250 (F3): after a failed login, the email field keeps the "+" and the user
// stays on the login page. Uses an email that has no account, so no real account is affected.
test('ENG-2250 failed login keeps the "+" in the email field', async ({ page }) => {
  const email = 'suazosilvina+qa-no-account@gmail.com';
  await page.goto('/login');
  const main = page.getByRole('main');
  await main.getByRole('textbox').nth(0).fill(email);
  await main.getByRole('textbox').nth(1).fill('not-the-password');
  await main.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(main.getByRole('textbox').nth(0)).toHaveValue(email);
});

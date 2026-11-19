import { test } from '@playwright/test';
import { creds, login } from '../helpers';

// Starts logged out (the run's saved session would skip the login page).
test.use({ storageState: { cookies: [], origins: [] } });

// REG-008 (F3, ENG-82): login accepts email as well as username. Read-only: runs on prod and eph.
test.describe('REG-008 login', () => {
  test('logs in with email', async ({ page }, info) => {
    const c = creds(info.project.name);
    await login(page, c.email, c.password);
  });

  test('logs in with username', async ({ page }, info) => {
    const c = creds(info.project.name);
    test.skip(!c.username, 'Set the USERNAME variable in .env to run this check.');
    await login(page, c.username!, c.password);
  });
});

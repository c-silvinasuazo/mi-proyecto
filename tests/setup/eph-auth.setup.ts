import { test as setup } from '@playwright/test';
import { logInToEphEditor } from '../helpers';

// Logs in to an eph event's editor once per run and saves the session (.auth/eph.json).
// eph has its own database: use the docker-cd test accounts (see README), not production ones.
setup('log in to the eph editor once', async ({ page }) => {
  await logInToEphEditor(page);
});

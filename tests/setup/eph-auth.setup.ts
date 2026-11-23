import { test as setup } from '@playwright/test';
import { logInToEphEditor } from '../helpers';

// Logs in to an eph event's editor once per run and saves the session (.auth/eph.json).
// eph has its own database: use the docker-cd test accounts (see README), not production ones.
setup('log in to the eph editor once', async ({ page }) => {
  await logInToEphEditor(page);
});

// The ticket payment cases (F4, ENG-2884) run on an event of their own, with Stripe connected in test mode.
setup('log in to the eph payments event once', async ({ page }) => {
  setup.skip(!process.env.EPH_PAYMENTS_URL, 'EPH_PAYMENTS_URL is not set: the payment cases skip');
  await logInToEphEditor(page, process.env.EPH_PAYMENTS_URL);
});

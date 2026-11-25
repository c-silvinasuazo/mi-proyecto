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

// Session capacity and the waitlist (F6) run on an event of their own, on Boost with the waitlist on.
setup('log in to the eph capacity event once', async ({ page }) => {
  setup.skip(!process.env.EPH_CAPACITY_URL, 'EPH_CAPACITY_URL is not set: the capacity cases skip');
  await logInToEphEditor(page, process.env.EPH_CAPACITY_URL);
});

// The registration form (F6) runs on an event of its own, with registration on and the QA form questions.
setup('log in to the eph registration event once', async ({ page }) => {
  setup.skip(!process.env.EPH_REGISTRATION_URL, 'EPH_REGISTRATION_URL is not set: the registration form cases skip');
  await logInToEphEditor(page, process.env.EPH_REGISTRATION_URL);
});

// PD Hours (REG-124, ENG-1543) runs on an event of its own with PD Hours set up, so the setup doesn't change another one.
setup('log in to the eph PD event once', async ({ page }) => {
  setup.skip(!process.env.EPH_PD_URL, 'EPH_PD_URL is not set: the PD Hours cases skip');
  await logInToEphEditor(page, process.env.EPH_PD_URL);
});

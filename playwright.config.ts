import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

// Targets (see README):
// - prod: read-only checks against production. Never writes.
// - cfp-readonly: read-only checks on public QA CFP forms (production CFP). Never writes.
// - eph:  read-only checks plus every flow that creates data, against an isolated eph environment.
// - dev2: payments with Stripe test mode. Writes to the production database: opt in with DEV2_BASE_URL.
// - cfp:  CFP flows on the production CFP with a qaeng event. Opt in with CFP_ENABLED=1.
// Credentials and URLs come from .env (git-ignored).
export default defineConfig({
  timeout: 90_000,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'prod-setup',
      testDir: './tests/setup',
      testMatch: /^(?!.*eph-auth).*\.setup\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'prod',
      testDir: './tests/readonly',
      dependencies: ['prod-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: process.env.SCHED_BASE_URL || 'https://sched.com', storageState: '.auth/prod.json' },
    },
    {
      name: 'cfp-readonly',
      testDir: './tests/cfp-readonly',
      dependencies: ['prod-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: 'https://cfp.sched.com', storageState: '.auth/prod.json' },
    },
    {
      name: 'eph-setup',
      testDir: './tests/setup',
      testMatch: /eph-auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'eph',
      testDir: './tests/eph',
      dependencies: ['eph-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: process.env.EPH_BASE_URL, storageState: '.auth/eph.json' },
    },
    {
      name: 'eph-safari',
      testDir: './tests/eph',
      grep: /REG-220/,
      dependencies: ['eph-setup'],
      use: { ...devices['Desktop Safari'], baseURL: process.env.EPH_BASE_URL, storageState: '.auth/eph.json' },
    },
    {
      name: 'dev2',
      testDir: './tests/dev2',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.DEV2_BASE_URL },
    },
    {
      name: 'cfp',
      testDir: './tests/cfp',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://cfp.sched.com' },
    },
    {
      name: 'cfp-iphone',
      testDir: './tests/cfp',
      grep: /ENG-2267/,
      use: { ...devices['iPhone 15'], baseURL: 'https://cfp.sched.com' },
    },
  ],
});

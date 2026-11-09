import { Page, expect, test } from '@playwright/test';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  return value;
}

// Credentials for the project being run: eph uses its own accounts (production accounts don't exist there).
export function creds(projectName: string) {
  const prefix = projectName === 'eph' ? 'EPH_' : 'SCHED_';
  return {
    email: requireEnv(`${prefix}EMAIL`),
    username: process.env[`${prefix}USERNAME`],
    password: requireEnv(`${prefix}PASSWORD`),
  };
}

// Unique suffix so each eph run creates fresh data (eph is isolated, so no cleanup is needed).
export function runId(): string {
  return new Date().toISOString().replace(/\D/g, '').slice(2, 14);
}

// Skips write tests when the eph target isn't configured.
export function requireEph() {
  test.skip(!process.env.EPH_BASE_URL, 'Set EPH_BASE_URL in .env to run eph tests.');
}

// Logs in on the main Sched login page with an email or a username.
// The labels aren't linked to their inputs: the first textbox in the main area is
// "Username or Email address" and the second one is "Password".
export async function login(page: Page, identifier: string, password: string) {
  await page.goto('/login');
  const main = page.getByRole('main');
  await main.getByRole('textbox').nth(0).fill(identifier);
  await main.getByRole('textbox').nth(1).fill(password);
  await main.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}

// Skips a group unless its opt-in variable is set (dev2 writes to the production database;
// the CFP group writes to the production CFP), so these never run by accident.
export function requireTarget(variable: string) {
  test.skip(!process.env[variable], `Set ${variable} in .env to run this group.`);
}

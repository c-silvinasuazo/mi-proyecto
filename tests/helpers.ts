import { APIResponse, Page, expect, test } from '@playwright/test';

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

// eph sometimes drops a request under load (a 503, or "socket hang up"; blocker #8 in ENG-2665). Requests that set up or
// clean up a test's data go through this, which tries twice more, a few seconds apart. The checks themselves never
// retry.
export async function retryRequest(send: () => Promise<APIResponse>) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await send();
      if (response.status() < 500 || attempt === 3) return response;
    } catch (error) {
      if (attempt === 3) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000 * attempt));
  }
}

// Reads the JSON an editor request answers. The editor sometimes prints a PHP notice before it, so this starts at the
// JSON; a server error fails with the status and the start of the page instead of a JSON parse error.
export async function editorJson(response: APIResponse, what: string) {
  const text = await response.text();
  const start = text.search(/\{\s*"/);
  if (!response.ok() || start < 0) throw new Error(`${what}: HTTP ${response.status()} ${text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)}`);
  return JSON.parse(text.slice(start));
}

// Unique suffix for the names of the data a test creates, so runs don't collide (the eph fixtures delete that data
// after each test).
export function runId(): string {
  return new Date().toISOString().replace(/\D/g, '').slice(2, 14);
}

// Logs in to the eph event's editor and saves the session to .auth/eph.json, which every eph test loads. eph has
// its own database: use the docker-cd test admin (see README), not a production account.
export async function logInToEphEditor(page: Page) {
  await logInToEph(page, 'EPH');
  await page.context().storageState({ path: '.auth/eph.json' });
}

// Logs in to the eph event with the admin (EPH) or one of the optional accounts (EPH_SPEAKER, EPH_ATTENDEE). The
// event's /login only asks for the event password; /editor/login takes any account, and non-admins land on the
// public site.
export async function logInToEph(page: Page, prefix: 'EPH' | 'EPH_SPEAKER' | 'EPH_ATTENDEE') {
  const base = requireEnv('EPH_BASE_URL').replace(/\/$/, '');
  await page.goto(`${base}/editor/login`);
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.getByRole('textbox').first().fill(requireEnv(`${prefix}_USERNAME`));
  await form.locator('input[type="password"]').fill(requireEnv(`${prefix}_PASSWORD`));
  await form.getByRole('button', { name: /^log in$/i }).click();
  await expect(page, `eph login failed for ${prefix}_USERNAME (still on /editor/login)`).not.toHaveURL(/\/editor\/login/, { timeout: 20_000 });
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

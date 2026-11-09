import { test, expect, Page } from '@playwright/test';

// eph, batch 1: every area of the editor and the public site opens for the admin, without
// errors or a redirect to login. Read-only. Uses URLs (the eph test event renames some menus,
// for example "Ploppens" for Speakers).

function where(p: Page) {
  const u = new URL(p.url());
  return `${u.origin}${u.pathname}`;
}

// A page "works" if it isn't the login page and doesn't show a server error.
async function expectPageWorks(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status() ?? 0, `${path} returned an HTTP error. Landed on: ${where(page)}`).toBeLessThan(400);
  await expect(page, `${path} redirected to login`).not.toHaveURL(/\/login/);
  await expect(page.getByText(/fatal error|exception|500 internal server error|page not found/i)).toHaveCount(0);
}

test.describe('eph areas: editor', () => {
  for (const [name, path] of [
    ['Schedule', '/editor/schedule'],
    ['Speakers', '/editor/speakers'],
    ['Attendees', '/editor/attendees'],
    ['Sponsors', '/editor/sponsors'],
    ['Registration', '/editor/registration'],
    ['Call For Papers', '/editor/callforpapers'],
    ['Communication', '/editor/messages'],
    ['Feedback Forms', '/editor/forms/'],
    ['Reports', '/editor/exports'],
    ['PD Hours', '/editor/ce-compliance'],
    ['Settings: Pages', '/editor/settings/pages'],
  ]) {
    test(`editor ${name} opens`, async ({ page }) => {
      await expectPageWorks(page, path);
    });
  }
});

test.describe('eph areas: public site', () => {
  // REG-103: the schedule, a session page and search work.
  test('REG-103 schedule lists sessions and a session page opens', async ({ page }) => {
    await expectPageWorks(page, '/');
    const session = page.locator('a[href*="/event/"]').first();
    await expect(session, `No session links on the schedule. Landed on: ${where(page)}`).toBeVisible({ timeout: 15_000 });
    const title = (await session.innerText()).trim().split('\n')[0];
    await session.click();
    await expect(page, 'The session page did not open').toHaveURL(/\/event\//);
    if (title) await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
  });

  test('REG-103 search returns results', async ({ page }) => {
    await expectPageWorks(page, '/');
    const box = page.getByPlaceholder(/schedule or people/i).first();
    await expect(box, `No search box on the schedule. Landed on: ${where(page)}`).toBeVisible({ timeout: 15_000 });
    await box.fill('test');
    await box.press('Enter');
    await expect(page.locator('a[href*="/event/"]').first(), 'Search for "test" returned no sessions').toBeVisible({ timeout: 15_000 });
  });

  test('attendees directory opens', async ({ page }) => {
    await expectPageWorks(page, '/directory/attendees');
  });

  // ENG-1568 / REG-107: the printable schedule loads with sessions.
  test('printable schedule (/print/all) lists sessions', async ({ page }) => {
    await expectPageWorks(page, '/print/all');
    await expect(page.locator('body'), 'The printable schedule is empty').not.toHaveText(/^\s*$/);
  });
});

test.describe('eph areas: Dashboard', () => {
  // TC-F3-08: the editor's Sched logo goes to the eph Dashboard without asking to log in again.
  test('TC-F3-08 the Dashboard opens from the editor without logging in again', async ({ page }) => {
    await expectPageWorks(page, '/editor');
    await page.getByRole('link', { name: 'Sched' }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page, `The Dashboard asked to log in again. Landed on: ${where(page)}`).not.toHaveURL(/\/login/, { timeout: 20_000 });
    await expect(page, `Didn't reach the eph Dashboard. Landed on: ${where(page)}`).toHaveURL(/dashboard\./, { timeout: 20_000 });
  });
});

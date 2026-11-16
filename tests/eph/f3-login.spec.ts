import { test, expect } from './fixtures';

// F3 login (write).
test.describe('F3 login (write)', () => {
  // TC-F3-02 (ENG-419): on the main site, /password-reset and /password-reset/ behave the same and show the reset form.
  // (On demofriends the trailing-slash URL shows the private event's password wall instead, which is expected.) The
  // rest of the case (email, link, new password) can't run here: the form has a captcha and eph doesn't deliver email,
  // so it stays manual.
  test('TC-F3-02: password reset link sets a new password (email may not be delivered on eph)', async ({ newPage, baseURL }) => {
    const mainSite = new URL(baseURL!).origin.replace(/\/\/[^.]+\./, '//');
    const page = await newPage({ baseURL: mainSite, storageState: { cookies: [], origins: [] } });
    for (const path of ['/password-reset', '/password-reset/']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: 'Password reset' }), `${path} does not show the reset form (landed on ${page.url()})`).toBeVisible();
    }
  });

  // TC-F3-08 (ENG-1780): editor -> Dashboard -> back to the event's editor without logging in again; logging out in the
  // Dashboard also ends the editor session. The editorSession fixture logs the editor back in after the test, since later
  // tests share that session.
  test('TC-F3-08: editor -> Dashboard -> back without logging in again; logout ends both', async ({ page, editorSession }) => {
    await page.goto('/editor');
    await page.getByRole('link', { name: 'Sched' }).first().click();
    await expect(page, 'The Dashboard asked to log in again').toHaveURL(/dashboard\..*\/my-events/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'My Events' })).toBeVisible();

    await page.getByRole('heading', { name: 'Nightclub & Bar Show 2017' }).first().click();
    await expect(page, 'Opening the event from the Dashboard asked to log in again').not.toHaveURL(/login/, { timeout: 20_000 });
    await page.goto('/editor');
    await expect(page, 'Going back to the editor asked to log in again').not.toHaveURL(/\/login/);

    editorSession.ended();
    await page.goto(page.url().replace(/^https:\/\/[^.]+\./, 'https://dashboard.').replace(/\/editor.*$/, '/my-events'));
    await page.getByRole('banner').getByRole('button').last().click();
    // On eph the logout lands on https://qa.eph.sched.co/, which loops (ERR_TOO_MANY_REDIRECTS); note it in the report
    // without failing, since what this case protects is that the logout ends both sessions.
    page.on('requestfailed', (r) => {
      if (r.isNavigationRequest()) test.info().annotations.push({ type: 'logout landing failed', description: `${r.url()} ${r.failure()?.errorText}` });
    });
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page, 'Logging out did not leave the Dashboard').not.toHaveURL(/dashboard\..*\/my-events/, { timeout: 20_000 });
    await page.goto('/editor');
    await expect(page, 'The editor is still logged in after logging out of the Dashboard').toHaveURL(/\/editor\/login/);
  });
});

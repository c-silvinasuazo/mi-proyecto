import { test, expect, devices, Browser, Page } from '@playwright/test';
import { logInToEph, logInToEphEditor, requireEnv, requireEph, runId } from '../helpers';
import { addAttendee, removeAddedAttendees } from './people';
import { requireAccount } from './preconditions';
import { createSession, deleteCreatedSessions } from './sessions';

// Sched Count is iOS only: on Android, check-in staff use the web Check-In App (/checkin) in the phone's browser
// (Mobile automation plan, Notion). These checks run it at the size of an Android phone, the way Sched Count's cases
// (SC-02, SC-03, SC-05, SC-06, SC-10) check the iOS app. The editor stays on the desktop `page`.
const { defaultBrowserType, ...androidPhone } = devices['Pixel 7'];

type Account = 'EPH' | 'EPH_ATTENDEE';

// Opens the Check-In App on a phone and logs in. demofriends is a private event, so the phone needs a session on the
// event to get past its password wall: the admin's phone starts from the saved editor session (a new context in a test
// does), and another account starts empty and logs in to the event first. Then the app's own login. eph allows only a
// few logins in a row ("Too many attempts at log in. Try again in 10 minutes"), so each case logs in as few times as
// it can. Logging in to the app ends the editor session (see logEditorBackIn). `sessions` is the app's first request
// after logging in (its list of sessions), which tells whether the app let the account in.
async function openCheckinApp(browser: Browser, baseURL: string, account: Account) {
  const context = account === 'EPH'
    ? await browser.newContext({ ...androidPhone, baseURL })
    : await browser.newContext({ ...androidPhone, baseURL, storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  if (account !== 'EPH') await logInToEph(page, account);
  await page.goto('/checkin');
  await page.getByRole('textbox', { name: 'Email or Username' }).fill(requireEnv(`${account}_USERNAME`));
  await page.getByRole('textbox', { name: 'Password' }).fill(requireEnv(`${account}_PASSWORD`));
  const sessions = page.waitForResponse((r) => r.url().includes('/api/v2.0/checkin/sessions'));
  await page.getByRole('button', { name: 'Log in' }).click();
  return { page, sessions };
}

// Waits until the app shows its session list (on eph there are no upcoming sessions, so only "Show All Sessions").
async function waitForSessions(page: Page) {
  await expect(page.getByRole('textbox', { name: 'Password' }), 'The Check-In App did not log in').toBeHidden({ timeout: 20_000 });
  await expect(page.getByText(/show all sessions/i).or(page.locator('ons-list[modifier="session"]')).first()).toBeVisible({ timeout: 20_000 });
}

// Menu -> Name Search Event Check-In, then searches. The app asks for 3+ characters of a first or last name.
async function nameSearch(page: Page, text: string) {
  await page.locator('[ng-click*="menu.toggle"]').first().click();
  await page.getByText('Name Search Event Check-In').click();
  await page.locator('input[type="search"]:visible').fill(text);
}

// The attendee's row in Name Search: the circle at its end (label.sched-checkbox) checks them in or out; the checkbox
// behind it is hidden and holds the state.
const searchResult = (page: Page, name: string) => page.locator('#name-search-list .person', { hasText: name });

// Opens the app again from scratch (a reload), so what it shows comes from the server, not from the screen.
async function reopen(page: Page) {
  await page.reload();
  await waitForSessions(page);
}

// Logs the editor in again from scratch, once per case (a case that needs the editor after the app does it itself;
// afterEach does it otherwise). The Check-In App's login ends the editor session on the server, but the browser keeps
// its cookies, and with a dead session the editor's requests (such as deleting a session) still answer 200 without
// doing anything.
let editorLoggedBackIn = false;
async function logEditorBackIn(editor: Page) {
  await editor.context().clearCookies();
  await logInToEphEditor(editor);
  editorLoggedBackIn = true;
}

// The event check-ins the editor lists for an attendee (Attendees -> the attendee -> Checked-in).
async function eventCheckins(editor: Page, id: string) {
  await editor.goto(`/editor/attendees?id=${id}#person-checkin-tab`);
  const heading = editor.locator('#person-checkin-tab').getByText(/Event Check-Ins \(\d+\)/);
  return Number((await heading.innerText()).match(/\((\d+)\)/)![1]);
}

test.describe('Android check-in: the web Check-In App on a phone', () => {
  // Each case logs in two or three times (event, app, editor again).
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(() => requireEph());
  test.afterEach(async ({ page }) => {
    if (!editorLoggedBackIn) await logEditorBackIn(page);
    editorLoggedBackIn = false;
    await removeAddedAttendees(page);
    await deleteCreatedSessions(page);
  });

  // SC-03 on Android: Sched Count tells an account with no admin or check-in role "No events assigned yet" (ENG-754).
  // The web app refuses it too (the session list answers 401), but goes back to the login form with no message.
  test('an attendee without an admin or check-in role can\'t log in to the Check-In App', async ({ browser, baseURL }) => {
    requireAccount('ATTENDEE');
    const { page, sessions } = await openCheckinApp(browser, baseURL!, 'EPH_ATTENDEE');
    expect((await sessions).status(), 'The Check-In App gave an attendee without a role the event\'s sessions').toBe(401);
    await expect(page.getByRole('textbox', { name: 'Password' }), 'The app should stay on its login form').toBeVisible();
    await expect(page.getByText(/show all sessions/i)).toBeHidden();
    test.info().annotations.push({ type: 'note', description: `Message shown: "${(await page.locator('body').innerText()).replace(/\s+/g, ' ').trim()}"` });
    await page.context().close();
  });

  // SC-05 and SC-10 on Android: Name Search finds an attendee by one word of their name, checks them in, the check-in
  // survives reopening the app and the editor lists it.
  test('Name Search checks an attendee in; the check-in is saved and shows in the editor', async ({ page: editor, browser, baseURL }) => {
    const attendee = await addAttendee(editor);
    const { page, sessions } = await openCheckinApp(browser, baseURL!, 'EPH');
    expect((await sessions).status()).toBe(200);
    await waitForSessions(page);
    await nameSearch(page, attendee.name.split(' ').pop()!);
    const row = searchResult(page, attendee.name);
    await expect(row, 'Name Search did not find the attendee by one word of their name').toBeVisible();
    await expect(row.locator('input[type="checkbox"]'), 'A new attendee should start not checked in').not.toBeChecked();
    const saved = page.waitForResponse((r) => r.url().includes('/api/v2.0/checkin/add'));
    await row.locator('label.sched-checkbox').click();
    expect((await saved).ok(), 'The check-in request failed').toBe(true);
    await expect(row.locator('input[type="checkbox"]')).toBeChecked();

    await reopen(page);
    await nameSearch(page, attendee.name.split(' ').pop()!);
    await expect(row.locator('input[type="checkbox"]'), 'The check-in was not saved').toBeChecked();
    await page.context().close();

    await logEditorBackIn(editor);
    expect(await eventCheckins(editor, attendee.id), 'The editor does not list the event check-in').toBe(1);
  });

  // Found 2026-11-12, not filed yet. The search box asks for "first/last name", but a search with a space finds nobody:
  // the app encodes the space twice (query=QA%2520add) and the server answers 404 "No results".
  test('Name Search finds an attendee by first and last name (issue found 2026-11-12: expected to fail until fixed)', async ({ page: editor, browser, baseURL }) => {
    const attendee = await addAttendee(editor);
    const { page } = await openCheckinApp(browser, baseURL!, 'EPH');
    await waitForSessions(page);
    await nameSearch(page, attendee.name);
    await expect(searchResult(page, attendee.name), `Searching "${attendee.name}" found nobody`).toBeVisible();
    await page.context().close();
  });

  // SC-06 for event check-ins, on Android. ENG-183 (open): tapping the circle again unticks it on screen, but the app
  // sends nothing to the server, so the attendee is still checked in (eph and qaengreminders, 2026-11-12).
  test('ENG-183: undoing an event check-in in Name Search is saved (open bug: expected to fail until fixed)', async ({ page: editor, browser, baseURL }) => {
    const attendee = await addAttendee(editor);
    const word = attendee.name.split(' ').pop()!;
    const { page } = await openCheckinApp(browser, baseURL!, 'EPH');
    await waitForSessions(page);
    await nameSearch(page, word);
    const row = searchResult(page, attendee.name);
    const saved = page.waitForResponse((r) => r.url().includes('/api/v2.0/checkin/add'));
    await row.locator('label.sched-checkbox').click();
    await saved;
    await reopen(page);
    await nameSearch(page, word);
    await expect(row.locator('input[type="checkbox"]'), 'The check-in was not saved, so there is nothing to undo').toBeChecked();

    await row.locator('label.sched-checkbox').click();
    await expect(row.locator('input[type="checkbox"]')).not.toBeChecked();
    await reopen(page);
    await nameSearch(page, word);
    await expect(row).toBeVisible();
    const stillCheckedIn = await row.locator('input[type="checkbox"]').isChecked();
    await page.context().close();
    await logEditorBackIn(editor);
    const inEditor = await eventCheckins(editor, attendee.id);
    test.info().annotations.push({ type: 'after the undo', description: `app: ${stillCheckedIn ? 'checked in' : 'not checked in'}; editor: Event Check-Ins (${inEditor})` });
    expect.soft(stillCheckedIn, 'After reopening the app, the attendee is checked in again: the undo was not saved').toBe(false);
    expect.soft(inEditor, 'The editor still lists the event check-in after the undo').toBe(0);
  });

  // SC-06 on Android, for a session: the admin adds a session to their schedule (so they're its one attendee), checks
  // themself in from the session's list, undoes it, and after reopening the app the session shows 0 of 1 again.
  test('undoing a session check-in is saved', async ({ page: editor, browser, baseURL }) => {
    const title = `QA checkin undo ${runId()}`;
    const id = await createSession(editor, title);
    await editor.goto(`/event/${id}`);
    await editor.getByRole('button', { name: /my schedule/i }).first().click();
    await expect(editor.locator('#add-remove-text')).not.toHaveText(/^add to My Schedule$/);

    const { page } = await openCheckinApp(browser, baseURL!, 'EPH');
    await waitForSessions(page);
    // Past sessions (the event's dates are in the past) are behind "Show All Sessions".
    const openSession = async () => {
      const showAll = page.getByText(/show all sessions/i);
      if (await showAll.isVisible()) await showAll.click();
      await page.getByText(title).first().click();
    };
    await openSession();
    await expect(page.getByText(`(0/1) ${title}`)).toBeVisible();
    await page.locator('label.sched-checkbox').first().click();
    await expect(page.getByText(`(1/1) ${title}`), 'The check-in count did not go up').toBeVisible();
    await page.locator('label.sched-checkbox').first().click();
    await expect(page.getByText(`(0/1) ${title}`), 'The check-in count did not go down').toBeVisible();

    await reopen(page);
    await openSession();
    await expect(page.getByText(`(0/1) ${title}`), 'After reopening the app the session is checked in again: the undo was not saved').toBeVisible();
    await page.context().close();
  });
});

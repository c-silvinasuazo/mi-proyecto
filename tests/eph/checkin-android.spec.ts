import { devices, BrowserContextOptions, Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { runId } from '../helpers';
import { CheckinAccount, CheckinApp } from './pages/checkin-app';
import { SessionPage } from './pages/session-page';
import { addAttendee } from './people';
import { openBug, requireAccount } from './preconditions';
import { createSession } from './sessions';

// Sched Count is iOS only: on Android, check-in staff use the web Check-In App (/checkin) in the phone's browser
// (Mobile automation plan, Notion). These checks run it at the size of an Android phone, the way Sched Count's cases
// (SC-02, SC-03, SC-05, SC-06, SC-10) check the iOS app. The editor stays on the desktop `page`.
const { defaultBrowserType, ...androidPhone } = devices['Pixel 7'];

// Opens the Check-In App on a phone. The admin's phone starts from the saved editor session; another account starts
// empty (CheckinApp.logIn logs it in to the event first). `newPage` is the fixture: it closes the phone's context after
// the test.
async function phoneApp(newPage: (options?: BrowserContextOptions) => Promise<Page>, baseURL: string, account: CheckinAccount) {
  const page = account === 'EPH'
    ? await newPage({ ...androidPhone, baseURL })
    : await newPage({ ...androidPhone, baseURL, storageState: { cookies: [], origins: [] } });
  return new CheckinApp(page);
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

  // SC-03 on Android: Sched Count tells an account with no admin or check-in role "No events assigned yet" (ENG-754).
  // The web app refuses it too (the session list answers 401), but goes back to the login form with no message (ENG-2785).
  test('an attendee without an admin or check-in role can\'t log in to the Check-In App', async ({ newPage, baseURL }) => {
    requireAccount('ATTENDEE');
    const app = await phoneApp(newPage, baseURL!, 'EPH_ATTENDEE');
    expect((await app.logIn('EPH_ATTENDEE')).status(), 'The Check-In App gave an attendee without a role the event\'s sessions').toBe(401);
    await expect(app.passwordField, 'The app should stay on its login form').toBeVisible();
    await expect(app.showAllSessions).toBeHidden();
    test.info().annotations.push({ type: 'note', description: `Message shown: "${(await app.page.locator('body').innerText()).replace(/\s+/g, ' ').trim()}"` });
  });

  // SC-05 and SC-10 on Android: Name Search finds an attendee by one word of their name, checks them in, the check-in
  // survives reopening the app and the editor lists it.
  test('Name Search checks an attendee in; the check-in is saved and shows in the editor', async ({ page: editor, newPage, editorSession, baseURL }) => {
    const attendee = await addAttendee(editor);
    editorSession.ended();
    const app = await phoneApp(newPage, baseURL!, 'EPH');
    expect((await app.logIn('EPH')).status()).toBe(200);
    await app.waitForSessions();
    await app.nameSearch(attendee.name.split(' ').pop()!);
    const row = app.searchResult(attendee.name);
    await expect(row, 'Name Search did not find the attendee by one word of their name').toBeVisible();
    await expect(app.checkbox(row), 'A new attendee should start not checked in').not.toBeChecked();
    expect((await app.tapCircle(row)).ok(), 'The check-in request failed').toBe(true);
    await expect(app.checkbox(row)).toBeChecked();

    await app.reopen();
    await app.nameSearch(attendee.name.split(' ').pop()!);
    await expect(app.checkbox(row), 'The check-in was not saved').toBeChecked();

    await editorSession.logBackIn();
    expect(await eventCheckins(editor, attendee.id), 'The editor does not list the event check-in').toBe(1);
  });

  // ENG-2784 (open, found 2026-11-12). The search box asks for "first/last name", but a search with a space finds nobody:
  // the app encodes the space twice (query=QA%2520add) and the server answers 404 "No results".
  test('ENG-2784: Name Search finds an attendee by first and last name (open bug: expected to fail until fixed)', async ({ page: editor, newPage, editorSession, baseURL }) => {
    openBug('ENG-2784', 'Name Search encodes the space twice, so a first and last name finds nobody');
    const attendee = await addAttendee(editor);
    editorSession.ended();
    const app = await phoneApp(newPage, baseURL!, 'EPH');
    await app.logIn('EPH');
    await app.waitForSessions();
    await app.nameSearch(attendee.name);
    await expect(app.searchResult(attendee.name), `Searching "${attendee.name}" found nobody`).toBeVisible();
  });

  // SC-06 for event check-ins, on Android. ENG-183 (open): tapping the circle again unticks it on screen, but the app
  // sends nothing to the server, so the attendee is still checked in (eph and qaengreminders, 2026-11-12).
  test('ENG-183: undoing an event check-in in Name Search is saved (open bug: expected to fail until fixed)', async ({ page: editor, newPage, editorSession, baseURL }) => {
    openBug('ENG-183', 'undoing an event check-in in Name Search sends nothing to the server');
    const attendee = await addAttendee(editor);
    const word = attendee.name.split(' ').pop()!;
    editorSession.ended();
    const app = await phoneApp(newPage, baseURL!, 'EPH');
    await app.logIn('EPH');
    await app.waitForSessions();
    await app.nameSearch(word);
    const row = app.searchResult(attendee.name);
    await app.tapCircle(row);
    await app.reopen();
    await app.nameSearch(word);
    await expect(app.checkbox(row), 'The check-in was not saved, so there is nothing to undo').toBeChecked();

    await row.locator('label.sched-checkbox').click();
    await expect(app.checkbox(row)).not.toBeChecked();
    await app.reopen();
    await app.nameSearch(word);
    await expect(row).toBeVisible();
    // Read the state (not a web-first assertion) so the report shows what the app and the editor each say.
    const stillCheckedIn = await app.checkbox(row).isChecked();
    await editorSession.logBackIn();
    const inEditor = await eventCheckins(editor, attendee.id);
    test.info().annotations.push({ type: 'after the undo', description: `app: ${stillCheckedIn ? 'checked in' : 'not checked in'}; editor: Event Check-Ins (${inEditor})` });
    // eslint-disable-next-line playwright/prefer-web-first-assertions -- the state was read above, for the annotation
    expect.soft(stillCheckedIn, 'After reopening the app, the attendee is checked in again: the undo was not saved').toBe(false);
    expect.soft(inEditor, 'The editor still lists the event check-in after the undo').toBe(0);
  });

  // SC-06 on Android, for a session: the admin adds a session to their schedule (so they're its one attendee), checks
  // themself in from the session's list, undoes it, and after reopening the app the session shows 0 of 1 again.
  test('undoing a session check-in is saved', async ({ page: editor, newPage, editorSession, baseURL }) => {
    const title = `QA checkin undo ${runId()}`;
    const id = await createSession(editor, title);
    const sessionPage = new SessionPage(editor);
    await sessionPage.goto(id);
    await sessionPage.addToMySchedule();

    editorSession.ended();
    const app = await phoneApp(newPage, baseURL!, 'EPH');
    await app.logIn('EPH');
    await app.waitForSessions();
    await app.openSession(title);
    await expect(app.sessionCount(title, 0, 1)).toBeVisible();
    // The admin is the session's one attendee, so its list has one check-in circle.
    await expect(app.circles, 'The session should list one attendee (the admin)').toHaveCount(1);
    await app.circles.click();
    await expect(app.sessionCount(title, 1, 1), 'The check-in count did not go up').toBeVisible();
    await app.circles.click();
    await expect(app.sessionCount(title, 0, 1), 'The check-in count did not go down').toBeVisible();

    await app.reopen();
    await app.openSession(title);
    await expect(app.sessionCount(title, 0, 1), 'After reopening the app the session is checked in again: the undo was not saved').toBeVisible();
  });
});

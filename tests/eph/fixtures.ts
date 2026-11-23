import { test as base, BrowserContextOptions, Page } from '@playwright/test';
import { logInToEphEditor } from '../helpers';
import { removeAddedAttendees, removeAddedSpeakers } from './people';
import { deleteCreatedSessions } from './sessions';
import { CfpOrganizer } from './pages/cfp';

export { expect } from '@playwright/test';

type EditorSession = {
  // Call before something that ends the editor session: the editor is logged back in after the test, even if it fails.
  ended: () => void;
  // Logs the editor back in right away, for a test that needs the editor again itself.
  logBackIn: () => Promise<void>;
  isEnded: () => boolean;
};

type EphFixtures = {
  // Opens a page in a browser context of its own (another device, or another account) and closes it after the test,
  // even when the test fails. Takes the same options as browser.newContext: like it, it starts from the project's
  // saved editor session unless the options say otherwise (storageState: { cookies: [], origins: [] } for a visitor).
  newPage: (options?: BrowserContextOptions) => Promise<Page>;
  // Logging in to the Check-In App, or logging out in the Dashboard, ends the editor session on the server, and every
  // later test loads that session from .auth/eph.json. A test that does either calls editorSession.ended() first.
  editorSession: EditorSession;
  // The event's CFP app as the organizer, opened from the editor on first use (on `page` unless another editor page is
  // given). After the test, the forms it created are archived.
  cfp: (editor?: Page) => Promise<CfpOrganizer>;
  // Runs around every eph test: skips it when eph isn't configured, and afterwards logs the editor back in if its
  // session ended and removes the sessions and attendees the test created, even when it failed or timed out.
  ephTest: void;
};

export const test = base.extend<EphFixtures>({
  newPage: async ({ browser }, use) => {
    const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
    await use(async (options = {}) => {
      const context = await browser.newContext(options);
      contexts.push(context);
      return context.newPage();
    });
    for (const context of contexts) await context.close();
  },

  editorSession: async ({ page, baseURL }, use) => {
    let ended = false;
    await use({
      ended: () => { ended = true; },
      logBackIn: async () => {
        // The browser keeps the dead session's cookies, and with them the editor's requests still answer 200 without
        // doing anything, so clear them first.
        await page.context().clearCookies();
        await logInToEphEditor(page, baseURL);
        ended = false;
      },
      isEnded: () => ended,
    });
  },

  cfp: async ({ page }, use) => {
    let organizer: CfpOrganizer | undefined;
    await use(async (editor = page) => (organizer ??= await CfpOrganizer.open(editor)));
    await organizer?.archiveForms();
  },

  ephTest: [async ({ page, editorSession }, use, testInfo) => {
    testInfo.skip(!process.env.EPH_BASE_URL, 'Set EPH_BASE_URL in .env to run eph tests.');
    // If an earlier test left the saved editor session dead (it failed before logging back in, or eph was redeployed),
    // log in again first, so one failure doesn't fail every test after it.
    const editor = await page.request.get('/editor', { maxRedirects: 0 });
    if (editor.status() >= 300 && editor.status() < 400 && /\/login/.test(editor.headers().location ?? '')) {
      testInfo.annotations.push({ type: 'editor session', description: 'was dead at the start; logged back in' });
      await editorSession.logBackIn();
    }
    await use();
    // With a dead session the deletes below would answer 200 and do nothing.
    if (editorSession.isEnded()) await editorSession.logBackIn();
    await removeAddedAttendees(page);
    await removeAddedSpeakers(page);
    await deleteCreatedSessions(page);
  }, { auto: true }],
});

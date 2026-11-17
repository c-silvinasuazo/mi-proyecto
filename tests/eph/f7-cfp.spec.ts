import { BrowserContextOptions, Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { requireEnv, runId } from '../helpers';
import { CfpForm, CfpSpeaker } from './pages/cfp';
import { speakersNamed } from './people';
import { openBug, requireCfpApplications, stepsNotRecordedYet } from './preconditions';
import { adoptSession, editDescription, findSessions, openEditSession } from './sessions';

// F7 CFP, on the eph event's CFP app (cfp.<env>.eph.sched.co). Each check creates its own form through the organizer
// API and the fixtures archive it afterwards. Checks that send an application also create an applicant account and an
// application, which the CFP can't delete, so they only run with EPH_ALLOW_CFP_APPLICATIONS=1.
// Stay manual: ENG-2267 (the form title is left-aligned in real iOS Safari; Playwright's WebKit centers it, as Android
// does, so it can't reproduce it), and the CFP emails (eph doesn't deliver email).

// A day relative to today, as YYYY-MM-DD.
const daysFromToday = (days: number) => new Date(Date.now() + days * 24 * 3600 * 1000).toISOString().slice(0, 10);

const visitorState = { storageState: { cookies: [], origins: [] } };

// A new applicant, signed up from the form at `url` in a fresh browser, and the speaker details they apply with.
async function newApplicant(newPage: (options?: BrowserContextOptions) => Promise<Page>, url: string, run: string) {
  const form = new CfpForm(await newPage(visitorState), url);
  await form.open();
  const email = `qa-cfp-${run}@nomail.sched.co`;
  expect((await form.signUp(email, `Qa-${run}-cfp`)).ok(), 'Signing up from the form failed').toBe(true);
  const speaker: CfpSpeaker = { name: `QA Speaker ${run}`, email, company: 'QA', position: 'Tester', about: 'The applicant.' };
  return { form, speaker };
}

test.describe('F7 CFP', () => {
  // TC-F7-02: a form only takes applications between its dates. Outside them the public page says "Submissions are
  // currently closed" and has no Submit button.
  test('TC-F7-02: a CFP form is closed before it opens and after it closes', async ({ cfp, newPage }) => {
    const organizer = await cfp();
    const run = runId();
    const forms = {
      open: await organizer.createForm(`QA F7 open ${run}`),
      'not open yet': await organizer.createForm(`QA F7 not open yet ${run}`, { start: daysFromToday(30), end: daysFromToday(60) }),
      closed: await organizer.createForm(`QA F7 closed ${run}`, { start: daysFromToday(-60), end: daysFromToday(-30) }),
    };
    const visitor = await newPage(visitorState);
    for (const [state, { url }] of Object.entries(forms)) {
      await test.step(`a form that is ${state}`, async () => {
        const form = new CfpForm(visitor, url);
        await form.open();
        const open = state === 'open';
        await expect(form.submit, `The ${state} form ${open ? 'has no' : 'still has a'} Submit button`).toHaveCount(open ? 1 : 0);
        await expect(form.closedNotice, `The ${state} form ${open ? 'says' : 'doesn\'t say'} submissions are closed`).toHaveCount(open ? 0 : 1);
      });
    }
  });

  // ENG-2091 (in review, PR #309): logging in from a form with a Sched-linked account that has no CFP password sends
  // the applicant to Sched's My Events and then the sched.com login page, instead of keeping them on the form. The eph
  // admin is such an account. On the PR's eph the applicant stays on the form, so this passes there.
  test('ENG-2091: logging in from a CFP form with a Sched account keeps you on the form (open bug: expected to fail until fixed)', async ({ page, cfp, newPage, editorSession }) => {
    openBug('ENG-2091', 'the login sends a Sched-linked account without a CFP password to the Sched login page');
    // The admin's email, from their profile on the event site.
    await page.goto('/profile');
    const email = await page.locator('input[name="email"]').inputValue();
    expect(email, 'The eph admin\'s profile has no email').toContain('@');
    const organizer = await cfp();
    const { url } = await organizer.createForm(`QA ENG-2091 ${runId()}`);
    const visitor = await newPage(visitorState);
    const form = new CfpForm(visitor, url);
    await form.open();
    // Without the fix, the login goes through Sched as the admin, which ends the editor session.
    editorSession.ended();
    await form.logIn(email, requireEnv('EPH_PASSWORD'));
    // Without the fix the page leaves the CFP a moment after the login answers; give it time to.
    const cfpOrigin = new URL(url).origin;
    await visitor.waitForURL((u) => u.origin !== cfpOrigin, { timeout: 8_000 }).catch(() => {});
    expect(visitor.url(), 'Logging in left the CFP form').toContain(`${cfpOrigin}/speaker/`);
  });

  // REG-215 / TC-F7-01 (part): an applicant signs up from the form, applies with a co-speaker, and the organizer sees
  // the application with both speakers. The file (REG-109), conditional answers and the confirmation email (ENG-1328)
  // are not covered here.
  test('REG-215 / TC-F7-01: an application with a co-speaker reaches the organizer', async ({ cfp, newPage }) => {
    requireCfpApplications();
    const organizer = await cfp();
    const run = runId();
    const { url } = await organizer.createForm(`QA F7 apply ${run}`);
    const applicant = await newPage(visitorState);
    const form = new CfpForm(applicant, url);
    await form.open();
    const email = `qa-cfp-${run}@nomail.sched.co`;
    expect((await form.signUp(email, `Qa-${run}-cfp`)).ok(), 'Signing up from the form failed').toBe(true);

    const title = `QA F7 session ${run}`;
    const speakers = [
      { name: `QA Speaker ${run}`, email, company: 'QA', position: 'Tester', about: 'The applicant.' },
      { name: `QA Co-speaker ${run}`, email: `qa-cfp-co-${run}@nomail.sched.co`, company: 'QA', position: 'Tester', about: 'The co-speaker.' },
    ];
    const sent = await form.apply(speakers, { title, description: 'Sent by the QA suite.' });
    expect(await sent.json(), 'Sending the application failed').toMatchObject({ success: true });
    await expect(applicant.getByText(/your application has been submitted/i)).toBeVisible();

    await organizer.page.goto(`${organizer.origin}/organizer/${organizer.confId}/applications`);
    const application = organizer.page.getByText(title, { exact: true });
    await expect(application, 'The organizer\'s Applications list doesn\'t show the application').toBeVisible();
    await application.click();
    for (const speaker of speakers) await expect(organizer.page.getByText(speaker.name, { exact: true }), `The application doesn't list ${speaker.name}`).toBeVisible();
  });

  // REG-108 / TC-F7-05 (ENG-33, ENG-2072) and ENG-1565: Sync with Sched with only Sync Applicants brings the applicant
  // in as a speaker and creates no session; with everything on, the session keeps its title and formatted description
  // and has the speaker attached. New sessions get the sync's date and time: the API can't create a TBA session
  // (ENG-2072), so the date is only noted. Re-syncing an existing session isn't covered.
  test('REG-108 / TC-F7-05 / ENG-1565: Sync with Sched brings in the speaker, then the session with its speaker', async ({ page, cfp, newPage }) => {
    requireCfpApplications();
    test.setTimeout(300_000);
    const organizer = await cfp();
    const run = runId();
    const formName = `QA F7 sync ${run}`;
    const { url } = await organizer.createForm(formName);
    const { form, speaker } = await newApplicant(newPage, url, run);
    const title = `QA F7 synced session ${run}`;
    await form.send([speaker], { title, description: '<p>Synced by the QA suite, with <strong>bold</strong> text.</p>' });

    await test.step('Sync Applicants only: the speaker comes in, no session is created (ENG-1565)', async () => {
      expect(await organizer.sync(formName, { 'Sync Applicants': true, 'Sync Sessions': false, 'Attach Applicants to Sessions': false })).toMatchObject({ success: true });
      expect(await speakersNamed(page, speaker.name), 'The applicant is not a speaker of the event after the sync').toHaveLength(1);
      expect(await findSessions(page, title), 'Sync Applicants alone created the session').toHaveLength(0);
    });

    await test.step('Sync everything: the session keeps its title and description and has the speaker (ENG-33)', async () => {
      expect(await organizer.sync(formName, { 'Sync Applicants': true, 'Sync Sessions': true, 'Attach Applicants to Sessions': true })).toMatchObject({ success: true });
      await adoptSession(page, title);
      await openEditSession(page, title);
      await expect(editDescription(page).locator('strong'), 'The description lost its formatting').toHaveText('bold');
      await expect(page.locator('#edit-session-peoplelist-speakers'), 'The speaker is not attached to the session').toContainText(speaker.name);
      const date = `${await page.locator('#edit-session-start-date').inputValue()} ${await page.locator('#edit-session-start-time').inputValue()}`;
      test.info().annotations.push({ type: 'synced session date (ENG-2072: the sync time, not TBA)', description: date });
      expect(await speakersNamed(page, speaker.name), 'Syncing again duplicated the speaker').toHaveLength(1);
    });
  });

  // REG-214 (ENG-228, ENG-335): one applicant sends two proposals; after a full sync both sessions have that speaker,
  // and the event has the speaker once.
  test('REG-214: two proposals from one applicant sync with that speaker attached, no duplicate speaker', async ({ page, cfp, newPage }) => {
    requireCfpApplications();
    test.setTimeout(300_000);
    const organizer = await cfp();
    const run = runId();
    const formName = `QA F7 two proposals ${run}`;
    const { url } = await organizer.createForm(formName);
    const { form, speaker } = await newApplicant(newPage, url, run);
    const titles = ['first', 'second'].map((n) => `QA F7 ${n} proposal ${run}`);
    for (const title of titles) await form.send([speaker], { title, description: '<p>Sent by the QA suite.</p>' });

    expect(await organizer.sync(formName, { 'Sync Applicants': true, 'Sync Sessions': true, 'Attach Applicants to Sessions': true })).toMatchObject({ success: true });
    for (const title of titles) {
      await adoptSession(page, title);
      await openEditSession(page, title);
      await expect.soft(page.locator('#edit-session-peoplelist-speakers'), `"${title}" doesn't have the speaker attached`).toContainText(speaker.name);
    }
    expect(await speakersNamed(page, speaker.name), 'The speaker should be in the event once').toHaveLength(1);
  });

  // REG-216: Messages -> Send message -> About Applications, with nine applications so the recipient list scrolls (it
  // shows about seven). ENG-157: a search by a speaker's name found nobody. ENG-158: dragging the list's scrollbar closed
  // the list on release. ENG-159: Cancel left the recipients in the To field for the next message. Nothing is sent.
  test('REG-216: Messages: the recipients can be searched by speaker, scrolled and cleared with Cancel', async ({ cfp, newPage }) => {
    requireCfpApplications();
    test.setTimeout(240_000);
    const organizer = await cfp();
    const run = runId();
    const { url } = await organizer.createForm(`QA F7 messages ${run}`);
    const { form, speaker } = await newApplicant(newPage, url, run);
    const titles = Array.from({ length: 9 }, (_, i) => `QA F7 message ${run} ${i + 1}`);
    // The first application names another speaker, to search by.
    const named = { ...speaker, name: `QA Searchable ${run}` };
    for (const [i, title] of titles.entries()) await form.send([i === 0 ? named : speaker], { title, description: '<p>Sent by the QA suite.</p>' });

    const page = organizer.page;
    const sends: string[] = [];
    page.on('request', (r) => { if (r.method() !== 'GET' && /\/api\/organizer\/messages/.test(r.url())) sends.push(r.url()); });
    const dialog = page.locator('.n-modal').last();
    const to = dialog.locator('.n-base-selection').first();
    const tags = to.locator('.n-tag');
    const options = page.locator('.n-base-select-option');
    const openNewMessage = async () => {
      await page.goto(`${organizer.origin}/organizer/${organizer.confId}/messages`);
      await page.getByText('Send message', { exact: true }).click();
      await page.getByText('About Applications', { exact: true }).last().click();
      await expect(dialog).toContainText('Send new message');
    };
    await openNewMessage();

    await test.step('searching by a speaker\'s name finds their application (ENG-157)', async () => {
      await to.click();
      await page.keyboard.type(named.name);
      await expect(options, `Searching "${named.name}" should find only their application`).toHaveText([titles[0]]);
      await options.first().click();
      await expect(tags).toHaveText([titles[0]]);
    });

    await test.step('the list scrolls by dragging its scrollbar, and stays open on release (ENG-158)', async () => {
      // Type over the last search (Backspace in an empty search would remove the last recipient).
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.type(run);
      await expect(options).toHaveCount(titles.length);
      const last = options.filter({ hasText: titles[8] });
      const bar = page.locator('.n-base-select-menu .n-scrollbar-rail--vertical .n-scrollbar-rail__scrollbar');
      const box = (await bar.boundingBox())!;
      expect(box, 'The recipient list has no scrollbar (fewer applications than fit?)').toBeTruthy();
      await page.mouse.move(box.x + box.width / 2, box.y + 5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + 400, { steps: 10 });
      await page.mouse.up();
      await expect(page.locator('.n-base-select-menu'), 'Releasing the scrollbar closed the recipient list').toBeVisible();
      await expect(last, 'Dragging the scrollbar to the bottom did not show the last application').toBeInViewport();
      await last.click();
      await expect(tags).toHaveText([titles[0], titles[8]]);
    });

    await test.step('Cancel clears the recipients for the next message (ENG-159)', async () => {
      // Close the list with a click on the dialog's title (Escape would close the whole dialog).
      await dialog.getByText('Send new message').click();
      await expect(page.locator('.n-base-select-menu')).toBeHidden();
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
      await page.getByText('Send message', { exact: true }).click();
      await page.getByText('About Applications', { exact: true }).last().click();
      await expect(dialog).toContainText('Send new message');
      await expect(tags, 'The recipients from the cancelled message are still in the To field').toHaveCount(0);
      await dialog.getByRole('button', { name: 'Cancel' }).click();
    });
    expect(sends, 'A message request was sent').toEqual([]);
  });

  // Placeholders: they need applications on eph (EPH_ALLOW_CFP_APPLICATIONS=1), and REG-212 a paid plan. Their steps
  // get recorded next; until then they show as fixme, also when applications are allowed.
  test.fixme('REG-213 / TC-F7-03: a reviewer rates an application; the organizer sees the rating', async () => stepsNotRecordedYet());
  test.fixme('REG-212 / TC-F7-06: the export includes conditional answers (needs a paid plan)', async () => stepsNotRecordedYet());
  test.fixme('REG-109: a file within the recommended size can be uploaded in a CFP application', async () => stepsNotRecordedYet());
  // Security: verified by reviewing the fix, never by exploiting it.
  test.fixme('TC-F7-04 / REG-111: an unrelated CFP account is denied the organizer pages (security: verify fixes, don\'t exploit)', async () => stepsNotRecordedYet());
});

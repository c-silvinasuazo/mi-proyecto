import { test, expect } from './fixtures';
import { requireEnv, runId } from '../helpers';
import { CfpForm } from './pages/cfp';
import { openBug, requireCfpApplications, stepsNotRecordedYet } from './preconditions';

// F7 CFP, on the eph event's CFP app (cfp.<env>.eph.sched.co). Each check creates its own form through the organizer
// API and the fixtures archive it afterwards. Checks that send an application also create an applicant account and an
// application, which the CFP can't delete, so they only run with EPH_ALLOW_CFP_APPLICATIONS=1.
// Stay manual: ENG-2267 (the form title is left-aligned in real iOS Safari; Playwright's WebKit centers it, as Android
// does, so it can't reproduce it), and the CFP emails (eph doesn't deliver email).

// A day relative to today, as YYYY-MM-DD.
const daysFromToday = (days: number) => new Date(Date.now() + days * 24 * 3600 * 1000).toISOString().slice(0, 10);

const visitorState = { storageState: { cookies: [], origins: [] } };

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

  // Placeholders: they need applications on eph (EPH_ALLOW_CFP_APPLICATIONS=1), and REG-212 a paid plan. Their steps
  // get recorded next; until then they show as fixme, also when applications are allowed.
  test.fixme('REG-108 / TC-F7-05 / ENG-1565: Sync with Sched with only Sync Applicants syncs speakers and creates no sessions', async () => stepsNotRecordedYet());
  test.fixme('REG-214: two proposals from one applicant sync with that speaker attached, no duplicate speaker', async () => stepsNotRecordedYet());
  test.fixme('REG-216: Messages: recipient search, scroll and removal work', async () => stepsNotRecordedYet());
  test.fixme('REG-213 / TC-F7-03: a reviewer rates an application; the organizer sees the rating', async () => stepsNotRecordedYet());
  test.fixme('REG-212 / TC-F7-06: the export includes conditional answers (needs a paid plan)', async () => stepsNotRecordedYet());
  test.fixme('REG-109: a file within the recommended size can be uploaded in a CFP application', async () => stepsNotRecordedYet());
  // Security: verified by reviewing the fix, never by exploiting it.
  test.fixme('TC-F7-04 / REG-111: an unrelated CFP account is denied the organizer pages (security: verify fixes, don\'t exploit)', async () => stepsNotRecordedYet());
});

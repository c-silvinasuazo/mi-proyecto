import { test, Page, Browser } from '@playwright/test';
import { solidPng } from './people';
import { eventFirstDay } from './sessions';

// Checks for what some cases need on the eph event and don't have yet. A test that needs one calls it first: while the
// precondition is missing it skips with the reason (shown in the report); once it's met, the test fails with "steps
// not recorded yet", so a newly unblocked case gets written instead of silently passing.

export async function requirePdHours(page: Page) {
  await page.goto('/editor/ce-compliance');
  const promo = await page.getByText(/request early access/i).count();
  test.skip(promo > 0, 'PD Hours is not enabled on this event (needs the Professional Development tag in Schedmin)');
}

export async function requireRegistration(page: Page) {
  await page.goto('/editor/registration');
  // The setup wizard alone doesn't turn registration on: it needs an intro text, then the "Enable Sched Registration"
  // switch, which only shows once the form is set up. demofriends has neither (its plan is changed in Schedmin, which
  // would change other cases too). The empty-state page stays in the DOM, hidden, so check the switch, not that text.
  const on = await page.locator('#enable-registration').isChecked().catch(() => false);
  test.skip(!on, 'Registration is not on for this event: give the registration form an intro text and turn on "Enable Sched Registration"');
}

// Session capacity and the waitlist (F6) and secret sessions (F9) run on an eph event of their own on Ultra,
// EPH_CAPACITY_URL: on demofriends' plan a session's capacity isn't enforced and secret sessions are locked, and on the
// payments event attendees need a ticket before they can join a session. A spec that uses it calls
// test.use(capacityEvent). Setup is manual (see .env.example): Ultra in Schedmin, the waitlist on, a People Tag
// "QA enroll"; registration stays off.
const capacityUrl = process.env.EPH_CAPACITY_URL;
export const capacityEvent = capacityUrl ? { baseURL: capacityUrl, storageState: '.auth/eph-capacity.json' } : {};

// The registration form cases (F6) run on an eph event of their own, EPH_REGISTRATION_URL, set up as .env.example says:
// registration on, a free ticket and the QA form questions. A spec that uses it calls test.use(registrationEvent).
const registrationUrl = process.env.EPH_REGISTRATION_URL;
export const registrationEvent = registrationUrl ? { baseURL: registrationUrl, storageState: '.auth/eph-registration.json' } : {};

export async function requireRegistrationEvent(page: Page) {
  test.skip(!registrationUrl, 'Needs an eph event with the QA registration form: set EPH_REGISTRATION_URL (see .env.example)');
  requireAccount('ATTENDEE');
  await requireRegistration(page);
}

// PD Hours runs on an eph event of its own, EPH_PD_URL, with PD Hours set up once (see .env.example): setting it up
// can't be undone and locks once the event starts, so the shared events stay without it. A spec that uses it calls
// test.use(pdEvent).
const pdUrl = process.env.EPH_PD_URL;
export const pdEvent = pdUrl ? { baseURL: pdUrl, storageState: '.auth/eph-pd.json' } : {};

export async function requirePdEvent(page: Page) {
  test.skip(!pdUrl, 'Needs an eph event with PD Hours set up: set EPH_PD_URL (see .env.example)');
  await requirePdHours(page);
  await page.goto('/editor/ce-compliance/sessions/');
  const setUp = await page.getByText('Set session eligibility and credit values').count();
  test.skip(setUp === 0, 'PD Hours is on but not set up on the PD event: set it up once (Session-Level Credit, check-in required)');
}

export async function requireCapacityEvent(page: Page) {
  test.skip(!capacityUrl, 'Needs an eph event with session capacity and the waitlist on: set EPH_CAPACITY_URL (see .env.example)');
  requireAccount('ATTENDEE');
  requireAccount('SPEAKER');
  await page.goto('/editor/settings');
  test.skip(!(await page.locator('#enable_waitlist').isChecked()), 'The waitlist is off on the capacity event (Settings -> Waitlist Settings -> Enable waitlist, then Save)');
}

// Ticket sales (F4, and ENG-2884's checkout cases) run on an eph event of their own, EPH_PAYMENTS_URL: demofriends
// can't sell tickets. A spec that uses it calls test.use(paymentsEvent). Setting the event up is manual: create it in
// the Dashboard, put it on Boost in Schedmin, give the registration form an intro text and turn on "Enable Sched
// Registration", connect Stripe in test mode (Registration -> Payments; typing an existing Stripe account's email in the
// onboarding's first step lets you pick the country, and the onboarding ends on sched.com, so open
// /editor/registration/stripe-connected-account?onboard_result=return on the event to activate it), then pick the
// currency and add the paid tickets.
const paymentsUrl = process.env.EPH_PAYMENTS_URL;
export const paymentsEvent = paymentsUrl ? { baseURL: paymentsUrl, storageState: '.auth/eph-payments.json' } : {};

// Skips with what's missing on the payments event, in setup order. Once all of it is there, the case fails with
// "steps not recorded yet" so it gets recorded.
export async function requireTicketPayments(page: Page) {
  test.skip(!paymentsUrl, 'Needs an eph event that can sell tickets: set EPH_PAYMENTS_URL (see .env.example)');
  await page.goto('/editor/registration/payments');
  const onPayments = new URL(page.url()).pathname.startsWith('/editor/registration/payments');
  test.skip(!onPayments, 'Registration -> Payments opens the editor instead: the payments event has no registration');
  const connected = await page.getByText('Stripe account is connected').count();
  test.skip(connected === 0, 'Stripe isn\'t connected to the payments event, or its onboarding didn\'t finish (Registration -> Payments)');
  await page.goto('/editor/registration/tickets');
  const registrationOff = await page.getByText(/Enable Registration\s+to sell tickets/).count();
  // The setup wizard alone leaves registration off: it needs an intro text, then the "Enable Sched Registration" switch.
  test.skip(registrationOff > 0, 'Registration isn\'t on for the payments event ("Enable Registration to sell tickets"): give the registration form an intro text and turn on "Enable Sched Registration"');
}

export async function requireSecretSessions(page: Page) {
  await page.goto('/editor/schedule');
  // "Add New", or "Add Sessions" while the event has no sessions.
  await page.locator('button[data-rel="#add"]:visible').first().click();
  const disabled = await page.locator('#session-add-tab').getByRole('switch', { name: 'Secret session' }).isDisabled();
  test.skip(disabled, 'Secret sessions are disabled on this event\'s plan ("Upgrade to unlock"; needs Ultra)');
}

export async function requireSponsorLevelEditing(page: Page) {
  await page.goto('/editor/sponsors');
  const addLevel = await page.getByText(/add (a |new )?(sponsor )?level/i).count();
  test.skip(addLevel === 0, 'Sponsor levels can only be renamed on this event\'s plan, not added or deleted (needs a paid plan)');
}

export async function requireEventFeedback(page: Page) {
  await page.goto('/');
  const button = await page.getByText(/provide feedback/i).count();
  // Session and event feedback are both enabled on demofriends, yet nothing shows to the admin, and on 2026-11-10 the
  // attendee account (demofriendssimple) saw no feedback button either, on the schedule, My Schedule or Info.
  test.skip(button === 0, 'No feedback button on this event\'s public site, for the admin or the attendee (feedback is enabled in Settings)');
}

export async function requireEventRunningToday(page: Page) {
  await page.goto('/editor/settings');
  const dates = (await page.locator('body').innerText()).match(/(\w+ \d+, \d{4}) to (\w+ \d+, \d{4})/);
  const end = dates ? new Date(dates[2]) : new Date(0);
  test.skip(end.getTime() < Date.now() - 24 * 3600 * 1000, `The event's dates (${dates?.[0] ?? 'unknown'}) don't include today; sessions outside them don't show`);
}

export function requireAccount(role: 'SPEAKER' | 'ATTENDEE') {
  const ok = !!process.env[`EPH_${role}_USERNAME`] && !!process.env[`EPH_${role}_PASSWORD`];
  test.skip(!ok, `Needs an eph ${role.toLowerCase()} account: set EPH_${role}_USERNAME and EPH_${role}_PASSWORD in .env`);
}

export async function requireSignupWithoutCaptcha(browser: Browser, baseURL: string) {
  const mainSite = new URL(baseURL).origin.replace(/\/\/[^.]+\./, '//');
  const visitor = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await visitor.newPage();
  await page.goto(`${mainSite}/signup?workflow=lf_planning`);
  const captcha = await page.locator('iframe[src*="captcha"], .g-recaptcha, [data-sitekey], iframe[src*="turnstile"]').count();
  await visitor.close();
  test.skip(captcha > 0, '/signup has a captcha on eph; the tests never try to get past it (needs test captcha keys or the captcha off)');
}

// Applying to a CFP form creates an applicant account and an application, and the CFP can't delete either: these
// checks only run when asked for, so the shared eph doesn't fill up with them.
export function requireCfpApplications() {
  test.skip(!process.env.EPH_ALLOW_CFP_APPLICATIONS, 'Creates a CFP applicant and an application on eph each run, and neither can be deleted: opt in with EPH_ALLOW_CFP_APPLICATIONS=1');
}

export function requireEventCreationAllowed() {
  test.skip(!process.env.EPH_ALLOW_EVENT_CREATION, 'Creates an event on eph each run and events can\'t be deleted from the tests: opt in with EPH_ALLOW_EVENT_CREATION=1');
}

// Spreadsheet imports (sessions and people) run as background jobs. If an import job has been "Queued" for over half an
// hour, the queue isn't processing on this environment: skip, rather than queue one more job that would create test
// data later with nothing left to clean it up.
export async function requireImportQueueWorking(page: Page) {
  await page.goto('/editor/schedule');
  const response = await page.request.post('/editor/schedule', { form: { what: 'getImportJobs' } });
  const jobs = Object.values((await response.json()).results ?? {}) as { status: string; time_uploaded: string }[];
  const stuck = jobs.filter((job) => /queued/i.test(job.status) && Date.now() - new Date(`${job.time_uploaded.replace(' ', 'T')}Z`).getTime() > 30 * 60 * 1000);
  test.skip(stuck.length > 0, `The import job queue isn't processing on eph (${stuck.length} job(s) Queued for over 30 minutes, the oldest from ${stuck[0]?.time_uploaded})`);
}

// Session photos and files are saved under hosted_files; on eph that folder was missing (2026-11-09: "Could not
// upload the file"). Tries a tiny upload the way REG-210 does and skips while it fails.
export async function requireFileUploads(page: Page) {
  await page.goto('/editor/schedule');
  await page.getByRole('button', { name: 'Add New' }).click();
  const form = page.locator('#session-add-tab');
  await page.locator('#add-session-title').fill(`QA upload probe ${Date.now()}`);
  await page.locator('#add-session-start-date').fill(await eventFirstDay(page));
  await form.getByRole('link', { name: 'Photo', exact: true }).click();
  await page.evaluate(() => (window as any).Dropzone.forElement('#add-session-uploadphoto-dropzone').hiddenFileInput.setAttribute('data-qa', 'upload-probe'));
  await page.locator('input[data-qa="upload-probe"]').setInputFiles({ name: 'probe.png', mimeType: 'image/png', buffer: solidPng(120, 120, 120) });
  const saved = page.waitForResponse((r) => r.request().method() === 'POST' && /\/editor\/schedule$/.test(r.url()) && r.request().postDataBuffer() === null);
  await page.getByRole('button', { name: 'Publish' }).click();
  const text = await (await saved).text();
  const result = JSON.parse(text.slice(text.search(/\{\s*"/)));
  const id = result.result ?? (await page.goto('/editor/schedule').then(() => page.locator('a[href*="#edit"]', { hasText: 'QA upload probe' }).first().getAttribute('href')).then((h) => h && new URL(h, page.url()).searchParams.get('id')));
  if (id) await page.request.post('/editor/schedule', { form: { what: 'delete', data: id } });
  test.skip(result.status !== 'OK', `File uploads fail on eph ("${result.message ?? result.status}"; the hosted_files folder is missing)`);
}

// An open product bug the check reproduces: the check is expected to fail until the bug is fixed. The run stays green,
// and once the fix lands Playwright reports the check as "unexpectedly passed", the cue to remove this line.
export function openBug(ticket: string, what: string) {
  test.fail(true, `${ticket} (open): ${what}`);
}

// An eph environment gap from the blocker list in ENG-2832 that blocks everything the check looks at, with no way to
// tell it apart from the bug the check guards against. Expected to fail like openBug, for the same reason.
export function ephGap(blocker: number, what: string) {
  test.fail(true, `eph blocker #${blocker} in ENG-2832: ${what}`);
}

// Whether eph generates PDFs (blocker #2 in ENG-2832: the PDF library is missing from the image). Checks that only
// end in a PDF still run their other steps and skip the PDF one while this is false. Read once per run, from the
// "Download PDF" link of the printable schedule.
let pdfs: boolean | undefined;
export async function ephMakesPdfs(page: Page) {
  if (pdfs === undefined) {
    const probe = await page.context().newPage();
    await probe.goto('/print');
    const href = await probe.getByRole('link', { name: /download pdf/i }).getAttribute('href', { timeout: 5_000 }).catch(() => null);
    const body = href ? await probe.request.get(new URL(href, probe.url()).toString(), { timeout: 30_000 }).then((r) => r.body(), () => Buffer.alloc(0)) : Buffer.alloc(0);
    pdfs = body.subarray(0, 5).toString() === '%PDF-';
    await probe.close();
  }
  if (!pdfs) test.info().annotations.push({ type: 'skipped step', description: 'The PDF: eph blocker #2 in ENG-2832 (PDFs aren\'t generated)' });
  return pdfs;
}

// Runs a step that ends in a PDF only while eph generates PDFs; otherwise ephMakesPdfs notes the skipped step.
export async function whenEphMakesPdfs(page: Page, step: () => Promise<void>) {
  if (await ephMakesPdfs(page)) await step();
}

// Spreadsheet exports come back empty on eph (blocker #3 in ENG-2832). Tries the attendee export and skips while it's
// empty, so the check runs for real once exports work.
export async function requireExports(page: Page) {
  await page.goto('/editor/exports');
  const href = await page.getByRole('link', { name: /XLS Attendees/ }).getAttribute('href');
  const size = href ? (await (await page.request.get(new URL(href, page.url()).toString())).body()).length : 0;
  test.skip(size === 0, 'Spreadsheet exports come back empty on eph (0 bytes; blocker #3 in ENG-2832)');
}

// Reached only once the precondition above is met: the steps still have to be recorded against the real screens.
export function stepsNotRecordedYet(): never {
  throw new Error('The precondition for this case is now met on eph, but its steps are not recorded yet: record them (see README).');
}

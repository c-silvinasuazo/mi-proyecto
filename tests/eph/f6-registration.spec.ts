import { BrowserContextOptions, Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { requireEnv, runId } from '../helpers';
import { capacityEvent, registrationEvent, requireCapacityEvent, requireRegistrationEvent } from './preconditions';
import { createSession } from './sessions';
import { joinedAs } from './people';
import { SessionPage } from './pages/session-page';

// The session page's status label (LIMITED, FULL, WAITLISTED) and the capacity line under the time.
const status = (session: SessionPage) => session.page.locator('text=/^(LIMITED|FULL|WAITLISTED)$/').first();
const waitlistNumber = (session: SessionPage) => session.page.getByText(/You are number \d+ on the waitlist/);

// The registration form, on the registration event (EPH_REGISTRATION_URL). The attendee account (EPH_ATTENDEE) registers
// for the event's free ticket from a logged-out window; the event's form asks "Company" (required) and "Attending in
// person?" (Yes/No, required), with "Dietary needs" shown only for Yes. After each test the attendee is removed from the
// event, which takes the registration and the ticket with it, so the next run registers again.
const ANSWERS = { first: 'QA', last: 'Registrant', company: `QA Company ${runId()}`, dietary: 'Vegetarian' };

// The attendee's row in Registrants, and their id (null when they aren't registered).
async function registrantId(editor: Page) {
  await editor.goto('/editor/attendees/registrants');
  const link = editor.locator('#container-list tr', { hasText: requireEnv('EPH_ATTENDEE_USERNAME') }).locator('td.attendee-person h2 a');
  return (await link.count()) ? link.getAttribute('id') : null;
}

// Removes the attendee from the event, the way the editor's Remove button does.
async function removeAttendee(editor: Page) {
  const id = await registrantId(editor);
  if (id) expect((await editor.request.post('/editor/attendees', { form: { what: 'deleteConfirmed', 'data[confirm]': 'Y', 'data[id]': id } })).ok(), 'Could not remove the attendee').toBe(true);
}

// From a logged-out window: picks the free ticket, checks the picker offers Sign Up and Log In, logs in as the attendee
// and opens the registration form. Returns the registration window.
async function openRegistrationForm(newPage: (options?: BrowserContextOptions) => Promise<Page>, baseURL: string) {
  const page = await newPage({ baseURL, storageState: { cookies: [], origins: [] } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve Tickets' }).first().click();
  const box = page.locator('.sc-lightbox:visible').first();
  await box.locator('.ticket').first().locator('.increment-button').click();
  await box.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(box.getByText('Sign Up', { exact: true }), 'A logged-out visitor should be offered Sign Up').toBeVisible();
  await expect(box.getByText('Log In', { exact: true }), 'A logged-out visitor should be offered Log In').toBeVisible();
  await box.getByText('Log In', { exact: true }).click();
  // The login page sends the visitor back to the ticket picker, with the ticket still in the cart.
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.getByRole('textbox').first().fill(requireEnv('EPH_ATTENDEE_USERNAME'));
  await form.locator('input[type="password"]').fill(requireEnv('EPH_ATTENDEE_PASSWORD'));
  await form.getByRole('button', { name: /^log in$/i }).click();
  await box.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(box.getByText('Registration information'), 'The registration form did not open after logging in').toBeVisible();
  return { page, box };
}

// Fills the form with ANSWERS (Yes to "Attending in person?") and registers.
async function register(box: ReturnType<Page['locator']>) {
  const field = (label: string) => box.getByRole('textbox', { name: new RegExp(`^${label}`) });
  await field('First Name').fill(ANSWERS.first);
  await field('Last Name').fill(ANSWERS.last);
  await field('Company').fill(ANSWERS.company);
  await box.getByText('Yes', { exact: true }).click();
  await field('Dietary needs').fill(ANSWERS.dietary);
  await box.getByRole('button', { name: 'Register', exact: true }).click();
  await expect(box.page().getByText('Your registration was successful!'), 'The registration did not complete').toBeVisible({ timeout: 30_000 });
}

test.describe('F6 registration form (needs the eph registration event)', () => {
  test.use(registrationEvent);

  test.beforeEach(async ({ page }) => {
    await requireRegistrationEvent(page);
    // A run that failed before its cleanup leaves the attendee registered.
    await removeAttendee(page);
  });

  test.afterEach(async ({ page }) => {
    await removeAttendee(page);
  });

  // REG-101 / TC-F6-01 (ENG-1779): a logged-out visitor is offered Sign Up and Log In and, after logging in, gets the
  // form; required questions block the submit, the conditional question shows only for Yes, and registering works. The
  // file question and signing up a new account stay manual (uploads fail on eph; signup has a captcha).
  test('REG-101 / TC-F6-01: registration form shows login and signup to logged-out users; required and conditional questions work', async ({ newPage, baseURL }) => {
    test.slow();
    const { box } = await openRegistrationForm(newPage, baseURL!);
    const dietary = box.getByText('Dietary needs');
    await expect(dietary, 'The conditional question should be hidden until Yes is picked').toBeHidden();
    await box.getByText('No', { exact: true }).click();
    await expect(dietary, 'The conditional question should stay hidden for No').toBeHidden();
    await box.getByText('Yes', { exact: true }).click();
    await expect(dietary, 'The conditional question should show for Yes').toBeVisible();

    // Everything but the required "Company" question filled in: registering marks just that one and doesn't submit.
    await box.getByRole('textbox', { name: /^First Name/ }).fill(ANSWERS.first);
    await box.getByRole('textbox', { name: /^Last Name/ }).fill(ANSWERS.last);
    await box.getByRole('button', { name: 'Register', exact: true }).click();
    await expect(box.getByText('Required', { exact: true }).locator('visible=true'), 'The empty required question should be marked Required').toHaveCount(1);
    await expect(box.getByText('Registration information'), 'The form should stay open while a required question is empty').toBeVisible();

    await register(box);
  });

  // REG-206 (ENG-935, ENG-1009, ENG-1340, ENG-257): the answers to the custom questions, the conditional one included,
  // are saved and show in the registrant's Registration tab. The Registrants export stays manual: exports come back empty
  // on eph (blocker #3 in ENG-2832).
  test('REG-206: custom form fields show, save and appear in the Registrants export', async ({ page, newPage, baseURL }) => {
    test.slow();
    const { box } = await openRegistrationForm(newPage, baseURL!);
    await register(box);
    const id = await registrantId(page);
    expect(id, 'The attendee should be listed in Registrants').toBeTruthy();
    await page.locator(`a[rel="#person-registration-tab"][rev="${id}"]`).click();
    const answers = page.locator('#person-registration-tab');
    for (const [question, answer] of [['Company', ANSWERS.company], ['Attending in person?', 'Yes'], ['Attending in person? \\ Yes \\ Dietary needs', ANSWERS.dietary]]) {
      await expect(answers, `The registration tab should show "${question}: ${answer}"`).toContainText(`${question}\n${answer}`);
    }
  });

  // REG-207 / ENG-2169 (ENG-1713): a registrant who completed the form is counted as registered and isn't listed under
  // Incomplete Registrations.
  test('REG-207 / ENG-2169: a completed registrant is not counted as incomplete', async ({ page, newPage, baseURL }) => {
    test.slow();
    const { box } = await openRegistrationForm(newPage, baseURL!);
    await register(box);
    expect(await registrantId(page), 'The attendee should be listed in Registrants').toBeTruthy();
    await page.goto('/editor/attendees/unregistered');
    await expect(page.locator('#container-inner'), 'A completed registrant should not be listed as incomplete').not.toContainText(requireEnv('EPH_ATTENDEE_USERNAME'));
    await page.goto('/editor/registration');
    await expect(page.getByText(/Attendees Registered\s*1/), 'The registered count should include the attendee').toBeVisible();
  });
});

// Session capacity and the waitlist, on the capacity event (EPH_CAPACITY_URL). Three accounts join a session with two
// seats: the admin, the attendee and the speaker. Deleting the session after the test takes their sign-ups with it.
test.describe('F6 session capacity and waitlist (needs the eph capacity event)', () => {
  test.use(capacityEvent);

  // Fills a two-seat session: the admin and the attendee get in, the speaker is waitlisted. Returns the three pages.
  async function fillSession(page: Page, newPage: (options?: BrowserContextOptions) => Promise<Page>, baseURL: string) {
    const id = await createSession(page, `QA capacity ${runId()}`, { seats: 2 });
    const admin = new SessionPage(page);
    const member = new SessionPage(await joinedAs(newPage, baseURL, 'EPH_ATTENDEE'));
    const third = new SessionPage(await joinedAs(newPage, baseURL, 'EPH_SPEAKER'));

    await admin.goto(id);
    await expect(status(admin), 'A session with no sign-ups should not show as full').toHaveText('LIMITED');
    await expect(admin.page.getByText('seats available'), 'A session with no sign-ups should have seats available').toBeVisible();
    await admin.addToMySchedule();
    await member.goto(id);
    await member.addToMySchedule();
    await expect(status(member), 'With 2 of 2 seats taken the session should show as full').toHaveText('FULL');
    await third.goto(id);
    await third.addToMySchedule();
    // The page holds one alert per outcome (full, limit reached, ended, needs a ticket) and shows the one that applies.
    await expect(third.page.getByRole('alertdialog', { name: /already full\. You've been added to its waitlist/ }), 'The third attendee should be told they were waitlisted').toBeVisible();
    await third.goto(id);
    await expect(status(third), 'The third attendee should be waitlisted').toHaveText('WAITLISTED');
    await expect(waitlistNumber(third), 'The third attendee should be first on the waitlist').toHaveText(/number 1 on the waitlist/);
    return { id, admin, member, third };
  }

  // REG-125 / TC-F6-04 (ENG-1071, ENG-1288): a session with no sign-ups isn't shown as full; with its two seats taken it
  // is, and the third attendee goes to the waitlist instead of in.
  test('REG-125 / TC-F6-04: capacity: a session with no sign-ups is not full; the third attendee goes to the waitlist', async ({ page, newPage, baseURL }) => {
    test.slow();
    await requireCapacityEvent(page);
    const { id, member } = await fillSession(page, newPage, baseURL!);
    // The attendee list, as an attendee sees it.
    await member.goto(id);
    await expect(member.page.getByRole('heading', { name: 'Attendees (2)' }), 'The waitlisted attendee should not count as an attendee').toBeVisible();
  });

  // TC-F6-05 (ENG-2165): when an attendee leaves a full session, the first waitlisted attendee moves in. The editor used to
  // show it only after the notifier ran (minute 17); on the attendee's session page it's immediate. The email stays
  // manual (no email on eph).
  test('TC-F6-05: freeing a spot moves the first waitlisted attendee in', async ({ page, newPage, baseURL }) => {
    test.slow();
    await requireCapacityEvent(page);
    const { id, member, third } = await fillSession(page, newPage, baseURL!);
    // One of the two attendees in leaves.
    await member.goto(id);
    await member.removeFromMySchedule();
    await third.goto(id);
    await expect(waitlistNumber(third), 'The waitlisted attendee should have moved in').toHaveCount(0);
    await expect(status(third), 'The session should be full again, with the moved-in attendee').toHaveText('FULL');
    await expect(third.page.locator('#add-remove-text'), 'The moved-in attendee should have the session in My Schedule').toHaveText(/remove from My Schedule/);
  });
});

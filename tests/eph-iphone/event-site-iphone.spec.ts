import { devices, Page } from '@playwright/test';
import { test as base, expect } from '../eph/fixtures';
import { runId } from '../helpers';
import { createSession } from '../eph/sessions';
import { SessionPage } from '../eph/pages/session-page';

// The event site on an iPhone (WebKit, iPhone 15 size), the web side of the Sched app's checks (APP-07 to APP-10)
// while the app itself waits for a simulator build (mobile/README.md). Runs with the eph-iphone project. The logged-in
// admin plays the attendee, as in REG-102. Each test creates its session from a desktop editor (`editor`) and deletes
// it afterwards (the eph fixtures); the page under test (`page`) is the phone.
const { defaultBrowserType, ...desktop } = devices['Desktop Safari'];
const test = base.extend<{ editor: Page }>({
  editor: async ({ newPage }, use) => use(await newPage(desktop)),
});

// The page fits the phone's width (no sideways scrolling), as in ENG-450 for the CFP.
async function expectFitsWidth(page: Page, what: string) {
  const [content, screen] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(content, `${what} is wider than the iPhone screen (${content}px for ${screen}px)`).toBeLessThanOrEqual(screen);
}

test.describe('event site on an iPhone', () => {

  // APP-07 on the web: Menu -> Search finds a session by name (on a phone the search box sits behind the menu).
  test('APP-07 (web): search finds a session by name', async ({ page, editor }) => {
    const title = `QA iPhone search ${runId()}`;
    await createSession(editor, title);
    await page.goto('/');
    await expectFitsWidth(page, 'The schedule');
    await page.locator('.button--menu').click();
    await page.getByRole('link', { name: 'Search', exact: true }).locator('visible=true').first().click();
    const box = page.getByPlaceholder('Find schedule or people').locator('visible=true');
    await box.fill(title);
    await box.press('Enter');
    await expect(page.getByRole('link', { name: new RegExp(title) }).first(), `Search for "${title}" did not find the session`).toBeVisible();
  });

  // APP-09 on the web: a session with a description shows it on the session page.
  test('APP-09 (web): a session page shows its description', async ({ page, editor }) => {
    const title = `QA iPhone description ${runId()}`;
    const text = `Description for ${title}`;
    const id = await createSession(editor, title, { description: `<p>${text}</p>` });
    await page.goto(`/event/${id}`);
    await expect(page.getByText(title).first()).toBeVisible();
    await expect(page.getByText(text), 'The session page does not show the description').toBeVisible();
    await expectFitsWidth(page, 'The session page');
  });

  // APP-08 on the web: add a session to My Schedule from its page, see it in My Schedule, remove it.
  test('APP-08 (web): a session is added to My Schedule and removed', async ({ page, editor }) => {
    const title = `QA iPhone my schedule ${runId()}`;
    const id = await createSession(editor, title);
    const sessionPage = new SessionPage(page);
    await sessionPage.goto(id);
    await sessionPage.addToMySchedule();
    await sessionPage.openMySchedule();
    await expect(sessionPage.mySchedulesEntry(title).first(), 'My Schedule does not list the added session').toBeVisible();
    await expectFitsWidth(page, 'My Schedule');

    await sessionPage.goto(id);
    await sessionPage.removeFromMySchedule();
    await sessionPage.openMySchedule();
    await expect(sessionPage.mySchedulesEntry(title), 'The session is still in My Schedule after removing it').toHaveCount(0);
  });

  // APP-10 on the web (ENG-2213 was a blank attendee list in the app): the attendee directory lists people.
  test('APP-10 (web): the attendee list isn\'t blank', async ({ page }) => {
    await page.goto('/directory/attendees');
    await expect(page.locator('.sched-container-people .sched-person').first(), 'The attendee list is blank').toBeVisible();
    await expectFitsWidth(page, 'The attendee list');
  });
});

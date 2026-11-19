import { test, expect } from './fixtures';
import { runId } from '../helpers';
import { SessionPage } from './pages/session-page';
import { createSession, eventDates } from './sessions';

// public site. Each test creates the session it looks for (on the event's first day, inside the event's dates; sessions
// outside them don't show, "No schedule listed yet") and deletes it afterwards. Schedule links are relative ("event/<id>/...").
test.describe('public site', () => {
  // REG-103 (ENG-1816): the schedule, a session page, Filter By Date and search work; the date filter stays on the
  // schedule instead of redirecting to the landing page.
  test('REG-103: schedule, session page, date filter and search load; the date filter doesn\'t redirect', async ({ page }) => {
    const title = `QA public ${runId()}`;
    const { first: day, last } = await eventDates(page);
    await createSession(page, title);

    await page.goto('/');
    await expect(page.locator('a[href*="event/"]').first(), 'The schedule lists no sessions').toBeVisible();

    // A day's schedule lives at /<date>; it must stay there and list that day's sessions.
    await page.goto(`/${day}`);
    await expect(page, 'The date filter redirected away from the schedule').toHaveURL(new RegExp(`/${day}$`));
    const session = page.getByRole('link', { name: new RegExp(title) }).first();
    await expect(session, 'The date filter does not show the session').toBeVisible();
    // The sidebar's Filter By Date link must also keep the schedule (with sessions) on screen. A one-day event has no
    // Filter By Date (demofriends on eph, 2026-11-15), so that part only runs on a longer event.
    if (last === day) {
      test.info().annotations.push({ type: 'skipped step', description: `Filter By Date: the event has one day (${day})` });
    } else {
      const [year] = day.split('-');
      const month = new Date(`${day}T12:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      await page.getByRole('link', { name: new RegExp(year) }).filter({ hasText: new RegExp(month, 'i') }).first().click();
      await expect(page.locator('a[href*="event/"]').first(), 'Filter By Date left the schedule').toBeVisible();
      await page.goto(`/${day}`);
    }

    await session.click();
    await expect(page).toHaveURL(/\/event\//);
    await expect(page.getByText(title).first(), 'The session page does not show the session').toBeVisible();

    await page.goto('/');
    const box = page.getByPlaceholder(/schedule or people/i).first();
    await box.fill(title);
    await box.press('Enter');
    await expect(page.getByRole('link', { name: new RegExp(title) }).first(), `Search for "${title}" did not find the session`).toBeVisible();
  });

  // REG-102 (ENG-669): the admin, logged in, adds a session to My Schedule; My Schedule and its print view list it;
  // removing it takes it out.
  test('REG-102: an attendee adds and removes a session in My Schedule; its print view isn\'t blank', async ({ page }) => {
    const title = `QA my schedule ${runId()}`;
    const id = await createSession(page, title);

    const sessionPage = new SessionPage(page);
    await sessionPage.goto(id);
    await sessionPage.addToMySchedule();
    await sessionPage.openMySchedule();
    await expect(sessionPage.mySchedulesEntry(title).first(), 'My Schedule does not list the added session').toBeVisible();

    // The print icon next to the mobile icon opens the attendee's schedule for printing.
    await page.goto((await page.locator('a[href*="print"]').first().getAttribute('href'))!);
    await expect(page.getByText(title).first(), 'The My Schedule print view is blank').toBeVisible();

    await sessionPage.goto(id);
    await sessionPage.removeFromMySchedule();
    await sessionPage.openMySchedule();
    await expect(sessionPage.mySchedulesEntry(title), 'The session is still in My Schedule after removing it').toHaveCount(0);
  });

  // REG-220 (ENG-2178, ENG-118): the embed code from Settings -> Appearance, on a page served over http, loads, scrolls
  // to the end and stays centered. Run with the eph-safari project for Safari (needs `npx playwright install webkit`).
  test('REG-220: the embed loads, scrolls and stays centered (run with the webkit project for Safari)', async ({ page, baseURL }) => {
    const site = new URL(baseURL!).hostname;
    const embed = `<a id="sched-embed" href="//${site}/">View the schedule</a><script type="text/javascript" src="//${site}/js/embed.js"></script>`;
    await page.route('http://embed-test.local/', (route) =>
      route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><body style="margin:0"><div id="box" style="width:900px;margin:0 auto">${embed}</div></body></html>` }));
    await page.goto('http://embed-test.local/');
    const frame = page.locator('#box iframe').first();
    await expect(frame, 'The embedded schedule did not load').toBeVisible({ timeout: 30_000 });
    const center = async () => {
      const [f, b] = [await frame.boundingBox(), await page.locator('#box').boundingBox()];
      return Math.abs(f!.x + f!.width / 2 - (b!.x + b!.width / 2));
    };
    expect(await center(), 'The embed is not centered in its container').toBeLessThan(5);
    await page.mouse.wheel(0, 20_000);
    await expect.poll(() => page.evaluate(() => window.scrollY), { message: 'The page did not scroll' }).toBeGreaterThan(0);
    await page.setViewportSize({ width: 1000, height: 700 });
    expect(await center(), 'The embed is not centered after resizing').toBeLessThan(5);
  });

  // ENG-1568: /print/all shows each session's description. How pasted formatting should print is still a Product
  // decision, so only the text is checked.
  test('ENG-1568: /print/all shows descriptions (expected behavior for pasted formatting pending a Product decision)', async ({ page }) => {
    const title = `QA print all ${runId()}`;
    const description = `QA description for print ${runId()}`;
    await createSession(page, title, { description: `<p>${description}</p>` });

    await page.goto('/print/all');
    await expect(page.getByText(title).first()).toBeVisible();
    await expect(page.getByText(description).first(), '/print/all does not show the description').toBeVisible();
  });

  // REG-129 (ENG-359, ENG-634, ENG-1230, ENG-2088): the help chat bubble and banners don't sit on top of the editor's
  // menus and buttons. Checks that the element on top at the center of each control is the control itself.
  test('REG-129: chatbot and banners don\'t cover editor menus or buttons', async ({ page }) => {
    const expectUncovered = async (controls: ReturnType<typeof page.getByRole>[]) => {
      for (const control of controls) {
        await expect(control).toBeVisible();
        const covered = await control.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return top && !el.contains(top) && !top.contains(el) ? `${top.tagName}#${top.id}.${top.className}` : '';
        });
        expect(covered, `${await control.innerText()} is covered by ${covered}`).toBe('');
      }
    };
    await page.goto('/editor/schedule');
    // The chat bubble and banners load after the page, from other services, and they're what this case looks for, so
    // wait for the network to go quiet (an exception to waiting for something on the page: there is nothing to wait
    // for when nothing covers the controls). The chat keeps a connection open, so give up after 15 seconds.
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await expectUncovered([
      page.getByRole('button', { name: 'Add New' }),
      page.getByRole('link', { name: 'Account menu' }),
      page.getByRole('link', { name: 'Preview Event' }),
      page.getByRole('link', { name: /^Sessions \(/ }),
    ]);
    await page.getByRole('button', { name: 'Add New' }).click();
    await expectUncovered([page.getByRole('button', { name: 'Publish' }), page.getByRole('button', { name: 'Save as Draft' })]);
  });
});

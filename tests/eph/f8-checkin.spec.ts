import { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import * as fs from 'fs';
import { runId } from '../helpers';
import { CheckinApp } from './pages/checkin-app';
import { SessionPage } from './pages/session-page';
import { createSession } from './sessions';
import { ephMakesPdfs, requireFileUploads, stepsNotRecordedYet } from './preconditions';

// Self Check-in in Settings (needed for the session QR export), and its value before REG-113 changed it.
let selfCheckinBefore: boolean | undefined;
async function setSelfCheckin(page: Page, on: boolean) {
  const box = page.locator('input[name="general[selfCheckin]"]');
  await page.goto('/editor/settings');
  if ((await box.isChecked()) !== on) await box.evaluate((el) => (el as HTMLInputElement).click());
  const saved = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/editor/settings'));
  await page.locator('#frm-general-submit').click();
  await saved;
  await page.goto('/editor/settings');
  await expect(box, 'Self Check-in did not save').toBeChecked({ checked: on });
}

// F8 check-in, QR and badges. Cases still marked fixme are placeholders until they're recorded (see README: Recording a flow).
test.describe('F8 check-in, QR and badges', () => {
  test.afterEach(async ({ page }) => {
    // REG-113 turns Self Check-in on; put it back even if the test failed or timed out.
    if (selfCheckinBefore !== undefined) await setSelfCheckin(page, selfCheckinBefore);
    selfCheckinBefore = undefined;
  });

  // REG-113 / TC-F8-03 (ENG-194, ENG-770, ENG-544, ENG-545, ENG-546): with Self Check-in on, Sessions -> select some ->
  // "Export Self Check-in QR Codes" opens the QR export (a new tab) with only those sessions, and its "Export all (PDF)"
  // has 3 per page. The PDF's text is compressed, so the layout is checked through its page count: 4 sessions -> 2
  // pages. Turns Self Check-in back to how it was at the end (afterEach).
  test('REG-113 / ENG-544 / ENG-545 / ENG-546: QR export has only the selected published sessions, 3 per page', async ({ page, context }) => {
    // Creating five sessions plus two Settings saves takes longer than the default 90 seconds.
    test.setTimeout(240_000);
    await page.goto('/editor/settings');
    selfCheckinBefore = await page.locator('input[name="general[selfCheckin]"]').isChecked();
    await setSelfCheckin(page, true);
    const titles = [1, 2, 3, 4].map((i) => `QA F8 QR ${i} ${runId()}`);
    const ids: string[] = [];
    for (const title of titles) ids.push(await createSession(page, title));
    const skipped = `QA F8 QR not selected ${runId()}`;
    await createSession(page, skipped);

    await page.goto('/editor/schedule');
    // The row checkboxes are hidden behind a styled control; click the inputs directly.
    for (const id of ids) await page.locator(`input.row_checkbox[value="${id}"]`).evaluate((box) => (box as HTMLInputElement).click());
    const tab = context.waitForEvent('page');
    await page.locator('#export-qr-link').evaluate((a) => (a as HTMLElement).click());
    const qr = await tab;
    await qr.waitForLoadState();
    expect(new URL(qr.url()).searchParams.get('ids')?.split(',').sort(), 'The export did not get exactly the selected sessions').toEqual([...ids].sort());
    // The export shows 3 sessions per page ("Page 1 of 2", "Next Page"); read every page.
    await expect(qr.getByText(/Page 1 of 2/), 'The export should put 4 sessions on 2 pages (3 per page)').toBeVisible();
    const pageTitles = () => qr.locator('body').innerText().then((t) => titles.concat(skipped).filter((title) => t.replace(/\s+/g, ' ').includes(title)));
    const firstPage = await pageTitles();
    expect(firstPage, 'The first page should hold 3 sessions').toHaveLength(3);
    await qr.getByText(/Next Page/).click();
    await expect(qr.getByText(/Page 2 of 2/)).toBeVisible();
    const shown = firstPage.concat(await pageTitles());
    for (const title of titles) expect(shown, `The export is missing "${title}"`).toContain(title);
    expect(shown, 'The export includes a session that was not selected').not.toContain(skipped);

    if (!(await ephMakesPdfs(page))) return;
    const download = qr.waitForEvent('download', { timeout: 30_000 }).catch(() => null);
    // "Export all (PDF)" sits at the top of the first page; go back there.
    await qr.reload();
    await qr.getByText(/export all/i).first().click({ timeout: 15_000 });
    const file = await download;
    expect(file, '"Export all (PDF)" did not download anything').toBeTruthy();
    const pdf = fs.readFileSync(await file!.path());
    expect(pdf.subarray(0, 5).toString(), 'Export all (PDF) is not a PDF').toBe('%PDF-');
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pages, 'The QR PDF should have the 4 sessions on 2 pages (3 per page)').toBe(2);
  });

  // TC-F8-05: the admin adds a session to their schedule (so they're its attendee), checks themself in from the
  // Check-In App (/checkin, which has its own login) and the check-in shows in the session's Check-in tab.
  test('TC-F8-05: /checkin records a session check-in', async ({ page: editor, newPage, editorSession, baseURL }) => {
    const title = `QA F8 checkin ${runId()}`;
    const id = await createSession(editor, title);
    const sessionPage = new SessionPage(editor);
    await sessionPage.goto(id);
    await sessionPage.addToMySchedule();

    // A separate context for the app: it starts from the saved session, which gets past the private event's password
    // wall. Logging in to the app ends the editor session (the editorSession fixture logs it back in).
    editorSession.ended();
    const app = new CheckinApp(await newPage({ baseURL }));
    await app.logIn('EPH');
    await app.waitForSessions();
    await app.openSession(title);
    await expect(app.sessionCount(title, 0, 1), 'The session should start with its one attendee not checked in').toBeVisible();
    // The admin is the session's one attendee, so its list has one check-in circle.
    await expect(app.circles, 'The session should list one attendee (the admin)').toHaveCount(1);
    // The app shows the new count before the save (/api/v2.0/checkin/put) answers, and on eph that can take seconds.
    // Reloading before it answers can lose the check-in (TC-F8-05 failed that way in CI, run #5 on 2026-11-19).
    const saved = app.page.waitForResponse((r) => r.url().includes('/api/v2.0/checkin/put'));
    await app.circles.click();
    await expect(app.sessionCount(title, 1, 1), 'The check-in count did not go up').toBeVisible();
    expect((await saved).ok(), 'Saving the check-in failed').toBeTruthy();
    // Reopen the app: the count must come back from the server, not just from the screen.
    await app.reopen();
    await app.openSession(title);
    await expect(app.sessionCount(title, 1, 1), 'The check-in was not saved').toBeVisible();

    await editorSession.logBackIn();

    await editor.goto(`/editor/schedule/?id=${id}#session-checkin-tab`);
    const tab = editor.locator('#session-checkin-tab');
    await expect(tab, 'The check-in is not in the session\'s Check-in tab').toContainText(/demofriends/i);
  });

  // REG-117 (ENG-80, ENG-2084): a badge template's Background -> Image applies and names print in the template format.
  // Needs file uploads, which fail on eph; the badge editor steps get recorded once they work.
  test('REG-117: badge background image and name format apply', async ({ page }) => {
    await requireFileUploads(page);
    stepsNotRecordedYet();
  });
  // ENG-241 (open): badge preview of names with special characters. Stays a manual, visual check (see the skip reason).
  // eslint-disable-next-line playwright/expect-expect -- listed so the report shows the case and why it's manual
  test('ENG-241: badge preview shows special characters in the event name (open bug: expected to fail until fixed)', async () => {
    test.skip(true, 'Visual check: the bug is special characters (a̓, m̓, ʔ) drawn as boxes in the badge preview, which the page text can\'t show; check it by eye');
  });
});

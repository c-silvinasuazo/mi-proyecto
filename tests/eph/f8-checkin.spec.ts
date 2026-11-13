import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import { logInToEphEditor, requireEnv, requireEph, runId } from '../helpers';
import { createSession, deleteCreatedSessions } from './sessions';
import { requireFileUploads, stepsNotRecordedYet } from './preconditions';

// Self Check-in in Settings (needed for the session QR export), and its value before REG-113 changed it.
let selfCheckinBefore: boolean | undefined;
async function setSelfCheckin(page: Page, on: boolean) {
  const box = page.locator('input[name="general[selfCheckin]"]');
  await page.goto('/editor/settings');
  if ((await box.isChecked()) !== on) await box.evaluate((el) => (el as HTMLInputElement).click());
  await page.locator('#frm-general-submit').click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.goto('/editor/settings');
  await expect(box, 'Self Check-in did not save').toBeChecked({ checked: on });
}

// F8 check-in, QR and badges. Cases still marked fixme are placeholders until they're recorded (see README: Recording a flow).
test.describe('F8 check-in, QR and badges', () => {
  test.beforeEach(() => requireEph());
  test.afterEach(async ({ page }) => {
    await deleteCreatedSessions(page);
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

    const download = qr.waitForEvent('download', { timeout: 30_000 }).catch(() => null);
    // "Export all (PDF)" sits at the top of the first page; go back there.
    await qr.reload();
    await qr.getByText(/export all/i).first().click({ timeout: 15_000 });
    const file = await download;
    expect(file, '"Export all (PDF)" did not download anything (PDF generation fails on eph, see REG-107)').toBeTruthy();
    const pdf = fs.readFileSync(await file!.path());
    expect(pdf.subarray(0, 5).toString(), 'Export all (PDF) is not a PDF').toBe('%PDF-');
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pages, 'The QR PDF should have the 4 sessions on 2 pages (3 per page)').toBe(2);
  });

  // TC-F8-05: the admin adds a session to their schedule (so they're its attendee), checks themself in from the
  // Check-In App (/checkin, which has its own login) and the check-in shows in the session's Check-in tab.
  test('TC-F8-05: /checkin records a session check-in', async ({ page: editor, browser, baseURL }) => {
    const title = `QA F8 checkin ${runId()}`;
    const id = await createSession(editor, title);
    await editor.goto(`/event/${id}`);
    await editor.getByRole('button', { name: /my schedule/i }).first().click();
    await expect(editor.locator('#add-remove-text')).not.toHaveText(/^add to My Schedule$/);

    // The Check-In App has its own login, and logging in there ends the editor session every other test uses. Use a
    // separate context (it starts from the saved session, which gets past the private event's password wall) and log
    // the editor back in afterwards (below).
    const checkin = await browser.newContext({ baseURL });
    const page = await checkin.newPage();
    await page.goto('/checkin');
    await page.getByRole('textbox', { name: 'Email or Username' }).fill(requireEnv('EPH_USERNAME'));
    await page.getByRole('textbox', { name: 'Password' }).fill(requireEnv('EPH_PASSWORD'));
    await page.getByRole('button', { name: 'Log in' }).click();
    // The app lists upcoming sessions first; past ones (the event's dates are in the past) are behind "Show All Sessions".
    const session = page.getByText(title).first();
    const showAll = page.getByText(/show all sessions/i);
    await expect(session.or(showAll).first()).toBeVisible({ timeout: 20_000 });
    if (await showAll.isVisible()) await showAll.click();
    await session.click();
    await expect(page.getByText(`(0/1) ${title}`), 'The session should start with its one attendee not checked in').toBeVisible();
    // The circle at the end of the attendee's row (.checkbox__checkmark) is the check-in toggle; the checkbox behind it
    // is hidden, and tapping elsewhere on the row opens the attendee's details instead.
    await page.locator('label.sched-checkbox').first().click();
    await expect(page.getByText(`(1/1) ${title}`), 'The check-in count did not go up').toBeVisible();
    // Reload the app: the count must come back from the server, not just from the screen.
    await page.reload();
    await expect(session.or(showAll).first()).toBeVisible({ timeout: 20_000 });
    if (await showAll.isVisible()) await showAll.click();
    await session.click();
    await expect(page.getByText(`(1/1) ${title}`), 'The check-in was not saved').toBeVisible();

    await checkin.close();
    await logInToEphEditor(editor);

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
  test('ENG-241: badge preview shows special characters in the event name (open bug: expected to fail until fixed)', async () => {
    test.skip(true, 'Visual check: the bug is special characters (a̓, m̓, ʔ) drawn as boxes in the badge preview, which the page text can\'t show; check it by eye');
  });
});

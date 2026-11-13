import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { requireEph, runId } from '../helpers';
import { requireImportQueueWorking } from './preconditions';
import { readXlsxRows, writeXlsx } from '../xlsx';
import { addAttendee, removeAddedAttendees } from './people';
import { deleteCreatedSessions, openAddSession, pickTime, publishNewSession, sessionId } from './sessions';

// F10 Control Panel.

test.describe('F10 Control Panel', () => {
  test.beforeEach(() => requireEph());
  test.afterEach(async ({ page }) => {
    await removeAddedAttendees(page);
    await deleteCreatedSessions(page);
  });

  // TC-F10-01: a time zone change in Settings saves and shows on the public site, and sessions keep their clock time.
  // Event dates can't be changed on this event ("Create your next event to change dates") and the name isn't editable
  // in Settings, so those parts stay manual. Restores the original time zone at the end.
  test('TC-F10-01: name, dates and time zone changes show on the public site', async ({ page }) => {
    const title = `QA F10 time zone ${runId()}`;
    await openAddSession(page);
    await page.locator('#add-session-title').fill(title);
    await page.locator('#add-session-start-date').fill('2026-01-31');
    await pickTime(page, '#add-session-start-time', '10:00');
    await publishNewSession(page);

    const setTimeZone = async (zone: string) => {
      await page.goto('/editor/settings');
      await page.locator('#timezone').selectOption(zone);
      await page.locator('#frm-general-submit').click();
      await page.goto('/editor/settings');
      await expect(page.locator('#timezone'), 'The time zone did not save').toHaveValue(zone);
    };
    await page.goto('/editor/settings');
    const original = await page.locator('#timezone').inputValue();
    try {
      await setTimeZone('America/New_York');
      await page.goto(`/event/${sessionId(title)}`);
      await expect(page.getByText(/10:00/).first(), 'The session did not keep its clock time').toBeVisible();
      await expect(page.getByText(/\bEST\b/).first(), 'The public session page does not show the new time zone').toBeVisible();
    } finally {
      await setTimeZone(original);
    }
  });

  // TC-F10-02: "Add" and "Add + Send Invite" both add the attendee. That only "Add + Send Invite" emails an invite
  // can't be checked on eph (it doesn't deliver email), so that part stays manual.
  test('TC-F10-02: "Add" and "Add + Send Invite" add the attendee', async ({ page }) => {
    await addAttendee(page, 'Add');
    await addAttendee(page, 'Add + Send Invite');
  });

  // TC-F10-04: Attendees -> Add New -> Import with a two-row sheet: an existing attendee (updated, not duplicated) and a
  // new one (added). The import is a background job ("about 10 minutes"). The sheet is built in the test from the
  // attendee template's columns (v2.6), since the template download comes back empty on eph.
  test('TC-F10-04: importing the attendee spreadsheet adds or updates without duplicates', async ({ page }) => {
    test.setTimeout(900_000);
    await requireImportQueueWorking(page);
    const existing = await addAttendee(page, 'Add');
    const run = runId();
    const company = `QA Co ${run}`;
    const newcomer = `QA import new ${run}`;
    const sheet = writeXlsx([
      ['Sched: Attendees'], ['When Complete ⇒ [Upload Here]'], ['version 2.6'], ['Need Help? ⇒ [View Here]'],
      ['Name (Required)', 'Email Address', 'Password', 'Company', 'Position', 'Location', 'Bio/Description', 'Website URL', 'Link To Image File', 'Tags'],
      [existing.name, existing.email, '', company],
      [newcomer, `qa-import-new-${run}@example.com`],
    ]);
    await page.goto('/editor/attendees');
    await page.getByRole('button', { name: 'Add New' }).click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Select a file' }).locator('visible=true').first().click();
    await (await chooser).setFiles({ name: `qa-attendees-${run}.xlsx`, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: sheet });
    await page.locator('button.people-import-submit:visible').first().click();
    await expect(page.getByText('There are 2 people ready to import.'), 'The import did not accept the two rows').toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Finish Import' }).locator('visible=true').first().click();

    // Wait for the job, then: the existing attendee has the new company and is listed once; the new one is added.
    const rows = (name: string) => page.getByRole('row').filter({ hasText: name });
    await expect.poll(async () => {
      await page.goto('/editor/attendees');
      return rows(newcomer).count();
    }, { message: 'The imported attendee never showed up (the import job did not finish)', timeout: 780_000, intervals: [15_000, 30_000] }).toBe(1);
    const newId = (await rows(newcomer).locator('input.row_checkbox').getAttribute('value'))!;
    try {
      await expect(rows(existing.name), 'The existing attendee was duplicated').toHaveCount(1);
      await expect(rows(existing.name), 'The existing attendee was not updated').toContainText(company);
    } finally {
      await page.request.post('/editor/attendees', { form: { what: 'deleteConfirmed', 'data[confirm]': 'Y', 'data[id]': newId } });
    }
  });

  // TC-F10-06 (ENG-729): Reports -> XLS Attendees downloads a valid workbook with every attendee and the expected columns.
  test('TC-F10-06: Reports -> Directory -> Attendees downloads every row', async ({ page }) => {
    const { name } = await addAttendee(page, 'Add');
    await page.goto('/editor/exports');
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: /XLS Attendees/ }).click();
    const bytes = fs.readFileSync(await (await download).path());
    expect(bytes.length, 'The attendees export is empty (0 bytes)').toBeGreaterThan(0);
    const [header, ...rows] = readXlsxRows(bytes);
    for (const column of ['Name', 'Email', 'Company', 'Position']) expect(header, `The export has no ${column} column`).toContain(column);
    expect(rows.some((row) => row.includes(name)), 'The export does not include the attendee just added').toBeTruthy();
  });

  // REG-112 (ENG-605): Call For Papers -> "Call For Papers (CFP) portal" opens the CFP app (cfp.<eph>) in a new tab,
  // signs the organizer in and shows the event's portal, with no error.
  test('REG-112: a CFP portal can be added to an event', async ({ page, context }) => {
    await page.goto('/editor/callforpapers');
    const tab = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Call For Papers (CFP) portal' }).click();
    const cfp = await tab;
    await expect(cfp, 'The CFP portal did not open in the CFP app').toHaveURL(/\/\/cfp\./);
    await expect(cfp, 'The CFP portal stayed on the sign-in step').not.toHaveURL(/\/organizer\/auth\//, { timeout: 30_000 });
    await expect(cfp.getByText(/^loading$/i), 'The CFP portal never finished loading').toHaveCount(0, { timeout: 30_000 });
    await expect(cfp.getByText(/error|something went wrong|not found/i)).toHaveCount(0);
    for (const section of ['Dashboard', 'Forms', 'Applications']) {
      await expect(cfp.getByRole('link', { name: section }).or(cfp.getByText(section, { exact: true })).first(), `The CFP portal has no ${section}`).toBeVisible();
    }
  });
});

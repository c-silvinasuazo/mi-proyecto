import { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import * as fs from 'fs';
import { logInToEph, requireEnv, retryRequest, runId } from '../helpers';
import { writeXlsx } from '../xlsx';
import { attendeeId, expectImageLoads, joinedAs, setPeopleTag, solidPng } from './people';
import { addDescription, createSession, editDescription, eventFirstDay, nextDay, openAddSession, openEditSession, pickTime, publishNewSession } from './sessions';
import { capacityEvent, ephGap, ephMakesPdfs, openBug, requireAccount, requireFileUploads, requireImportQueueWorking, requireSecretSessions } from './preconditions';

// F9 session editor. Cases still marked fixme are placeholders until they're recorded (see README: Recording a flow).

test.describe('F9 session editor', () => {
  // REG-208 / TC-F9-01 (ENG-630): dates and times stay the same after save, reopen and a description-only edit.
  test('REG-208 / TC-F9-01: a multi-day session keeps its dates after save and reopen', async ({ page }) => {
    const title = `QA F9 multi-day ${runId()}`;
    const start = await eventFirstDay(page);
    const end = nextDay(start);
    await openAddSession(page);
    await page.locator('#add-session-title').fill(title);
    await page.locator('#add-session-start-date').fill(start);
    await pickTime(page, '#add-session-start-time', '10:00');
    // After the start time changes, the form sets a default end time (start + 15 minutes) on its own.
    // Wait for that before typing ours, or the default overwrites it and the session saves with 10:15.
    await expect(page.locator('#add-session-end-time')).toHaveValue('10:15');
    await page.locator('#add-session-multiday-toggle').click();
    await page.locator('#add-session-multiday-end-date').fill(end);
    await expect(page.locator('#add-session-multiday-end-time')).not.toHaveValue('');
    await pickTime(page, '#add-session-multiday-end-time', '11:00');
    await expect(page.locator('#add-session-multiday-end-time'), 'The end time did not stick in the form').toHaveValue('11:00');
    expect(await publishNewSession(page), 'The form sent a different end time').toContain(`${end} 11:00:00`);

    const expectDates = async () => {
      await expect(page.locator('#edit-session-start-date')).toHaveValue(start);
      await expect(page.locator('#edit-session-start-time')).toHaveValue('10:00');
      await expect(page.locator('#edit-session-multiday-end-date')).toHaveValue(end);
      await expect(page.locator('#edit-session-multiday-end-time')).toHaveValue('11:00');
    };
    await test.step('dates after the first save', async () => {
      await openEditSession(page, title);
      await expectDates();
    });

    // A description-only edit must not move the dates.
    await editDescription(page).fill('Description-only edit');
    await page.locator('#edit-savePublish').click();
    await test.step('dates after a description-only edit', async () => {
      await openEditSession(page, title);
      await expect(editDescription(page), 'The description edit was not saved').toContainText('Description-only edit');
      await expectDates();
    });
  });
  // REG-209 / TC-F9-02 (ENG-1202): formatting made with the editor toolbar is saved, shows the same when the
  // session is reopened, and renders on the public session page. Apps, print and PDF stay manual.
  test('REG-209: description formatting (bold, italic, lists, centered, link) persists in the editor and on the public page', async ({ page }) => {
    const title = `QA F9 formatting ${runId()}`;
    await openAddSession(page);
    await page.locator('#add-session-title').fill(title);
    await page.locator('#add-session-start-date').fill(await eventFirstDay(page));

    // The content is set in the editor in the markup its toolbar produces (line breaks, not paragraphs: the server
    // turns <p> into <br>, and centering is a <div style="text-align: center;">). Typing it key by key isn't reliable
    // in this editor (formats carry over between lines), and what this case protects is how formatting is saved and shown.
    const formatted = [
      '<strong>QA bold text</strong><br>',
      '<em>QA italic text</em><br>',
      '<ul><li>QA bullet item</li></ul>',
      '<ol><li>QA numbered item</li></ol>',
      '<div style="text-align: center;">QA centered text</div>',
      '<a href="https://example.com/qa-reg-209">QA link</a><br>',
    ].join('');
    await addDescription(page).evaluate((el, html) => {
      el.innerHTML = html;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    }, formatted);
    await publishNewSession(page);

    const id = await openEditSession(page, title);
    const reopened = editDescription(page);
    await expect(reopened.locator('strong', { hasText: 'QA bold text' })).toBeVisible();
    await expect(reopened.locator('em', { hasText: 'QA italic text' })).toBeVisible();
    await expect(reopened.locator('ul li', { hasText: 'QA bullet item' })).toBeVisible();
    await expect(reopened.locator('ol li', { hasText: 'QA numbered item' })).toBeVisible();
    await expect(reopened.getByText('QA centered text')).toHaveCSS('text-align', 'center');
    await expect(reopened.locator('a', { hasText: 'QA link' })).toHaveAttribute('href', 'https://example.com/qa-reg-209');

    await page.goto(`/event/${id}`);
    await expect(page.locator('strong', { hasText: 'QA bold text' }).first()).toBeVisible();
    await expect(page.locator('em', { hasText: 'QA italic text' }).first()).toBeVisible();
    await expect(page.locator('ul li', { hasText: 'QA bullet item' }).first()).toBeVisible();
    await expect(page.locator('ol li', { hasText: 'QA numbered item' }).first()).toBeVisible();
    await expect(page.getByText('QA centered text').first()).toHaveCSS('text-align', 'center');
    await expect(page.locator('a', { hasText: 'QA link' }).first()).toHaveAttribute('href', 'https://example.com/qa-reg-209');
  });
  // REG-210
  // REG-210 (ENG-721, ENG-1561, ENG-1407): a session photo saves and shows in the editor and on the public site; a PDF
  // added to the session downloads from the public page as a .pdf (not a zip or .bin).
  test('REG-210: session image saves; a PDF downloads as .pdf from the public page', async ({ page }) => {
    await requireFileUploads(page);
    const title = `QA F9 files ${runId()}`;
    await openAddSession(page);
    await page.locator('#add-session-title').fill(title);
    await page.locator('#add-session-start-date').fill(await eventFirstDay(page));

    // Photo and File are under Extras and stay hidden until opened.
    const form = page.locator('#session-add-tab');
    await form.getByRole('link', { name: 'Photo', exact: true }).click();
    await form.getByRole('link', { name: 'File', exact: true }).click();
    // The upload areas are Dropzone.js zones; each keeps a hidden file input that the test fills directly.
    const upload = async (dropzone: string, file: string | { name: string; mimeType: string; buffer: Buffer }) => {
      const marker = `qa-${dropzone.replace(/\W/g, '')}`;
      await page.evaluate(({ dropzone, marker }) => {
        const zone = (window as any).Dropzone.forElement(dropzone);
        zone.hiddenFileInput.setAttribute('data-qa', marker);
      }, { dropzone, marker });
      await page.locator(`input[data-qa="${marker}"]`).setInputFiles(file);
    };
    await upload('#add-session-uploadphoto-dropzone', { name: 'qa-session.png', mimeType: 'image/png', buffer: solidPng(30, 100, 160) });
    // A crop step may ask to Accept the photo (the button ENG-685 broke for sponsors).
    const accept = page.getByRole('button', { name: /^accept$/i });
    await accept.click({ timeout: 5_000 }).catch(() => {});
    // In a new session the files wait in the upload areas and are sent with Publish.
    await expect(page.locator('#add-session-uploadphoto-dropzone .dz-preview'), 'The photo was not accepted').toBeVisible();
    await upload('#add-session-uploadfile-dropzone', 'tests/fixtures/sample.pdf');
    await expect(page.locator('#add-session-uploadfile-dropzone'), 'The PDF was not accepted').toContainText('sample.pdf');
    await publishNewSession(page);

    const id = await openEditSession(page, title);
    await expect(page.locator('#edit-session-uploadphoto-current'), 'The photo is not in the editor after reopening').toBeVisible();

    await page.goto(`/event/${id}`);
    const photo = page.locator('img[src*="upload"], img[src*="sched"]').filter({ hasNot: page.locator('[alt*="logo" i]') });
    await expect(photo.first(), 'No session photo on the public page').toBeVisible();
    const file = page.locator('a[href*=".pdf" i], a', { hasText: /sample/i }).first();
    await expect(file, 'No file link on the public page').toBeVisible();
    const response = await page.request.get((await file.getAttribute('href'))!);
    const bytes = await response.body();
    expect(bytes.subarray(0, 5).toString(), 'The file is not a PDF').toBe('%PDF-');
    const name = `${response.headers()['content-disposition'] ?? ''} ${response.url()}`;
    expect(name, 'The file does not download as .pdf').toMatch(/\.pdf/i);
    expect(name, 'The file downloads as zip or bin').not.toMatch(/\.(zip|bin)\b/i);
  });
  // ENG-2244: a long description pasted from Google Docs carries heavy markup (inline styles on every span), well
  // over the 8,192-character limit, while its visible text is under 5,000. The limit counts visible text only, so it
  // must not be cut off, and the public page must render it without HTML or CSS fragments.
  test('ENG-2244: a long description pasted with heavy markup is not cut off and renders cleanly', async ({ page }) => {
    const title = `QA F9 long description ${runId()}`;
    const span = (text: string) =>
      `<span style="font-size:10.5pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">${text}</span>`;
    const sentence = 'The Writer/Director follows a young filmmaker through a summer of short films, chasing dragonflies and small victories.';
    const last = `Final QA sentence ${runId()}.`;
    // Every few words get their own styled span, as Google Docs does, so the markup stays over the limit even after
    // the editor cleans part of it on paste.
    const spans = (text: string) => text.split(/(?<=,| a | of )/).map(span).join('');
    const paragraphs = Array.from({ length: 12 }, (_, i) => `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;">${span(`Paragraph ${i + 1}. `)}${spans(sentence)}${spans(` ${sentence}`)}</p>`);
    paragraphs.push(`<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;">${span(last)}</p>`);
    const html = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-qa">${paragraphs.join('')}</b>`;
    const visible = html.replace(/<[^>]+>/g, '');
    expect(html.length, 'The pasted HTML should be over the 8,192 limit').toBeGreaterThan(8192);
    expect(visible.length, 'The visible text should be under the 5,000 limit').toBeLessThan(5000);

    await openAddSession(page);
    await page.locator('#add-session-title').fill(title);
    await page.locator('#add-session-start-date').fill(await eventFirstDay(page));
    // Paste the way a browser does after copying from Google Docs: a paste event carrying text/html.
    await addDescription(page).click();
    await addDescription(page).evaluate((el, data) => {
      const transfer = new DataTransfer();
      transfer.setData('text/html', data.html);
      transfer.setData('text/plain', data.visible);
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
    }, { html, visible });
    await expect(addDescription(page)).toContainText(last);
    const sent = (await publishNewSession(page)).match(/name="data\[description\]"\r\n\r\n([\s\S]*?)\r\n------/)?.[1] ?? '';
    expect(sent.length, 'The description sent should still be over 8,192 characters of markup').toBeGreaterThan(8192);

    const id = await openEditSession(page, title);
    await expect(editDescription(page), 'The saved description was cut off').toContainText(last);

    await page.goto(`/event/${id}`);
    const body = page.locator('body');
    await expect(body, 'The public page cut off the description').toContainText(last);
    await expect(body).toContainText('Paragraph 1. The Writer/Director follows a young filmmaker');
    for (const fragment of ['style=', 'font-family', '<span', '<br', 'r>']) {
      await expect(body, `The public page shows the fragment "${fragment}"`).not.toContainText(fragment);
    }
  });
  // REG-106 / TC-F9-03 (ENG-181, ENG-2050): Add New -> Import Sessions with a two-row sheet (one secret with feedback
  // on, one not). The import is checked, finished, and processed by the job queue; then each session keeps its Secret
  // and Collect Feedback values. The sheet is built in the test from the session template's columns (v3.0), since the
  // template download comes back empty on eph.
  test('REG-106 / TC-F9-03: session import completes; secret and feedback flags respected (ENG-2050)', async ({ page }) => {
    // The import runs as a background job; give it time.
    test.setTimeout(240_000);
    await requireImportQueueWorking(page);
    const run = runId();
    // The sheet's dates are MM/DD/YYYY, on the event's first day.
    const [year, month, day] = (await eventFirstDay(page)).split('-');
    const sheetDay = `${month}/${day}/${year}`;
    const keys = ['event_key', 'name', 'active', 'pinned', 'frozen', 'private', 'event_start', 'event_end', 'event_type', 'event_subtype', 'seats', 'description', 'speakers', 'moderators', 'artists', 'sponsors', 'exhibitors', 'venue', 'address', 'media_url', 'video_stream', 'sessionTags', 'company', 'audience', 'subject', 'geo_area', 'host_org', 'rsvp_url', 'checkin', 'surveys'];
    const labels = ['ID', 'Title', 'Published?', 'Pinned?', 'Frozen?', 'Secret?', 'Start Date & Time', 'End Date & Time', 'Type/Track', 'Sub-type', 'Capacity', 'Description', 'Speakers', 'Moderators', 'Artists', 'Sponsors', 'Exhibitors', 'Venue', 'Physical Address', 'Link To Image File', 'Video Stream', 'Tags', 'Custom Filter 1', 'Custom Filter 2', 'Custom Filter 3', 'Custom Filter 4', 'Deprecated', 'Feedback Survey URL', 'Manager Emails', 'Collect y/n'];
    const sessions = [
      { title: `QA F9 import secret ${run}`, secret: 'Y', feedback: 'Y' },
      { title: `QA F9 import open ${run}`, secret: 'N', feedback: 'N' },
    ];
    const rows = sessions.map((session, i) => keys.map((key) => ({
      event_key: `qa106-${run}-${i + 1}`, name: session.title, active: 'Y', pinned: 'N', frozen: 'N', private: session.secret,
      event_start: `${sheetDay} 10:00 AM`, event_end: `${sheetDay} 11:00 AM`, surveys: session.feedback,
    } as Record<string, string>)[key] ?? ''));
    const sheet = writeXlsx([
      ['When Completed ⇒ [Open Upload Form]'], ['Need Help? ⇒ [View Instructions Here]'], ['version 3.0'], [`Downloaded on ${new Date().toISOString()}`],
      ['SESSION TEMPLATE'], keys, labels, ['REQUIRED', 'REQUIRED', 'REQUIRED', 'REQUIRED', '', '', 'MM/DD/YYYY 12H', 'MM/DD/YYYY 12H'], ...rows,
    ]);

    await openAddSession(page);
    await page.locator('#add-session-import-file').setInputFiles({ name: `qa-import-${run}.xlsx`, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: sheet });
    await page.locator('#add-session-import-submit').click();
    await expect(page.getByText('There are 2 sessions ready to import.'), 'The import did not accept the two rows').toBeVisible({ timeout: 30_000 });
    await page.locator('#add-session-import-finish').click();

    // The import is queued; wait for the job to finish.
    const jobStatus = async () => {
      const jobs = (await (await page.request.post('/editor/schedule', { form: { what: 'getImportJobs' } })).json()).results ?? {};
      return (Object.values(jobs) as { filename: string; status: string }[]).find((job) => job.filename === `qa-import-${run}.xlsx`)?.status ?? 'not listed';
    };
    await expect.poll(jobStatus, { message: 'The import job never finished (on eph 2026-11-10 jobs stay Queued: the job queue isn\'t processing)', timeout: 150_000, intervals: [5_000, 10_000] }).not.toMatch(/queued|processing/i);

    for (const session of sessions) {
      await page.goto('/editor/schedule');
      const link = page.locator('a[href*="#edit"]', { hasText: session.title }).first();
      await expect(link, `"${session.title}" was not imported`).toBeVisible();
      const id = new URL((await link.getAttribute('href'))!, page.url()).searchParams.get('id')!;
      await page.goto(`/editor/schedule/?id=${id}#session-edit-tab`);
      const form = page.locator('#session-edit-tab');
      try {
        await expect(form.getByRole('switch', { name: 'Collect Feedback' }), `Collect Feedback should be ${session.feedback === 'Y' ? 'on' : 'off'} (ENG-2050)`).toBeChecked({ checked: session.feedback === 'Y' });
        await expect(form.getByRole('switch', { name: 'Secret session' }), `Secret should be ${session.secret === 'Y' ? 'on' : 'off'}`).toBeChecked({ checked: session.secret === 'Y' });
      } finally {
        await page.request.post('/editor/schedule', { form: { what: 'delete', data: id } });
      }
    }
  });
  // REG-105 / TC-F9-05 and ENG-2762 share the attendee's session page and the editor's Freeze session switch.
  const freezeHelpers = (page: Page, attendee: Page, id: string, title: string) => {
    // The session's own page: an add/remove button while it's open, a "frozen" marker without one while it's frozen.
    const helpers = {
      session: attendee.locator('.list-single__event .event'),
      add: attendee.getByRole('button', { name: 'Add to My Schedule' }),
      remove: attendee.getByRole('button', { name: 'Remove from My Schedule' }),
      openSession: () => attendee.goto(`/event/${id}`),
      setFrozen: async (frozen: boolean) => {
        await openEditSession(page, title);
        const freeze = page.locator('#edit-frozen-enable');
        if ((await freeze.isChecked()) !== frozen) await page.locator('#edit-frozen-enable + .slider').click();
        await expect(freeze).toBeChecked({ checked: frozen });
        // The editor also POSTs to /editor/schedule to load data; wait for the save itself, or the form is reopened
        // before the save lands and still shows the old value.
        const saved = page.waitForResponse((r) => r.request().method() === 'POST' && /\/editor\/schedule$/.test(r.url()) && (r.request().postData() ?? '').includes('saveSession'));
        await page.locator('#edit-savePublish').click();
        expect((await saved).ok(), 'Saving the session failed').toBeTruthy();
        await openEditSession(page, title);
        await expect(page.locator('#edit-frozen-enable'), `Freeze session did not save as ${frozen ? 'on' : 'off'}`).toBeChecked({ checked: frozen });
      },
      addToMySchedule: async () => {
        await helpers.openSession();
        await helpers.add.click();
        await expect(helpers.remove, 'The session was not added to My Schedule').toBeVisible();
      },
    };
    return helpers;
  };

  // REG-105 / TC-F9-05 (ENG-517, ENG-2262): an attendee adds a session; once it's frozen its page has no remove button;
  // once it's unfrozen they can remove it again. On production the unfreeze took about 5 minutes to reach attendees
  // (2026-10-19), so that step waits up to 8: the test is tagged @slow (npm run test:eph:quick leaves it out).
  test('REG-105 / TC-F9-05: freezing blocks schedule changes; unfreezing unlocks them (needs a paid plan)', { tag: '@slow' }, async ({ page, newPage }) => {
    requireAccount('ATTENDEE');
    test.setTimeout(720_000);
    const title = `QA F9 freeze ${runId()}`;
    const id = await createSession(page, title);
    const attendee = await newPage({ storageState: { cookies: [], origins: [] } });
    await logInToEph(attendee, 'EPH_ATTENDEE');
    const { session, add, remove, openSession, setFrozen, addToMySchedule } = freezeHelpers(page, attendee, id, title);

    await test.step('the attendee adds the session', addToMySchedule);

    await test.step('frozen: the session page has no remove button', async () => {
      await setFrozen(true);
      await openSession();
      await expect(session, 'The session does not show as frozen to the attendee').toHaveClass(/\bfrozen\b/);
      await expect(session, 'The frozen session is no longer in My Schedule').toHaveClass(/\bsub\b/);
      await expect(remove, 'The attendee can still remove a frozen session').toHaveCount(0);
    });

    await test.step('unfrozen: the attendee can remove it again', async () => {
      await setFrozen(false);
      await expect.poll(async () => {
        await openSession();
        return remove.count();
      }, { message: 'The session stayed frozen for the attendee 8 minutes after unfreezing', timeout: 480_000, intervals: [15_000, 30_000] }).toBe(1);
      await remove.click();
      await expect(add, 'The attendee could not remove the unfrozen session').toBeVisible();
    });
  });

  // ENG-2762 (fixed 2026-11-13; part of REG-105): a page the attendee opened before the freeze still shows the remove
  // button, and clicking it must not take the frozen session off My Schedule. It did on eph until the fix; now the
  // server answers "frozen" and the session stays.
  test('ENG-2762: a page opened before the freeze can\'t remove the frozen session', async ({ page, newPage }) => {
    requireAccount('ATTENDEE');
    test.setTimeout(240_000);
    const title = `QA F9 freeze old page ${runId()}`;
    const id = await createSession(page, title);
    const attendee = await newPage({ storageState: { cookies: [], origins: [] } });
    await logInToEph(attendee, 'EPH_ATTENDEE');
    const { session, remove, openSession, setFrozen, addToMySchedule } = freezeHelpers(page, attendee, id, title);

    await addToMySchedule();
    await setFrozen(true);
    // The attendee's page still has the button from before the freeze (it calls /event-set?del=<id>). Make sure the
    // request goes out, so a pass means the server refused it and not that the click did nothing.
    const removal = attendee.waitForResponse((r) => r.url().includes(`/event-set?del=${id}`));
    await remove.click();
    const answer = await removal;
    test.info().annotations.push({ type: 'removal of the frozen session from the old page', description: `${answer.status()} ${(await answer.text()).trim().slice(0, 80)}` });
    await openSession();
    await expect(session, 'A page opened before the freeze took the frozen session off My Schedule').toHaveClass(/\bsub\b/);
  });

  // REG-107
  // REG-107 (ENG-934, ENG-105): Reports -> Event Schedule (PDF) is /print with a "Download PDF" link; Reports ->
  // Attendee Schedules (PDF) lists attendees with a session and a "Download" link each. The PDFs' text is compressed,
  // so "contains data" is checked on the page each PDF is made from, plus a real, non-trivial PDF download.
  test('REG-107: event and attendee schedule PDFs contain data', async ({ page }) => {
    const pdfs = await ephMakesPdfs(page);
    const title = `QA F9 print ${runId()}`;
    await createSession(page, title);

    const expectPdf = async (link: ReturnType<Page['getByRole']>, what: string) => {
      const download = page.waitForEvent('download', { timeout: 20_000 });
      await link.click();
      const file = await (await download).path();
      const bytes = fs.readFileSync(file);
      expect(bytes.subarray(0, 5).toString(), `${what} did not download as a PDF`).toBe('%PDF-');
      expect(bytes.length, `${what} PDF looks empty`).toBeGreaterThan(5_000);
    };

    await test.step('event schedule', async () => {
      await page.goto('/print');
      await expect(page.getByText(title), 'The printable event schedule does not list the session').toBeVisible();
      if (pdfs) await expectPdf(page.getByRole('link', { name: /download pdf/i }), 'The event schedule');
    });
    await test.step('attendee schedules', async () => {
      await page.goto('/editor/exports/attendee-schedule-export');
      const download = page.getByRole('link', { name: 'Download', exact: true });
      await expect(download.first(), 'No attendee has a schedule to export').toBeVisible();
      if (pdfs) await expectPdf(download.first(), 'An attendee schedule');
    });
  });
  // REG-127
  // REG-127 (ENG-388, ENG-431): Settings -> Chats and Direct Messaging. The button asks for confirmation; a broken
  // save shows an alert "Failed to change chat status: parsererror". Turns chat on, then back off, so the event ends
  // as it started.
  test('REG-127: turning chat on and off saves without a parsererror', async ({ page }) => {
    ephGap(6, 'the chat toggle answers "parsererror" on eph, the same symptom this check guards against');
    const alerts: string[] = [];
    page.on('dialog', async (dialog) => {
      if (dialog.type() !== 'confirm') alerts.push(dialog.message());
      await dialog.accept();
    });
    const toggle = async (from: RegExp, to: RegExp) => {
      await page.goto('/editor/settings');
      const button = page.locator('#chatButton');
      await expect(button).toHaveText(from);
      const saved = page.waitForResponse((r) => r.request().method() === 'POST' && (r.request().postData() || '').includes('toggle_chat'));
      await button.click();
      await saved;
      // The result arrives either as an error alert or as the button flipping; wait for one of them.
      await expect.poll(async () => alerts.length > 0 || to.test(await button.innerText()), { timeout: 10_000 }).toBe(true);
      expect(alerts, 'Changing the chat status showed an error').toEqual([]);
      await page.reload();
      await expect(page.locator('#chatButton'), 'The chat status did not change').toHaveText(to);
    };
    await test.step('turn chat on', () => toggle(/activate chat/i, /deactivate chat/i));
    await test.step('turn chat off', () => toggle(/deactivate chat/i, /activate chat/i));
  });
  // REG-120 (ENG-685): adding a sponsor with a photo, the crop step's Accept button works and the photo is saved
  // (it shows when the sponsor is reopened). Removes the sponsor at the end.
  test('REG-120: sponsor photo Accept works and the photo saves', async ({ page }) => {
    const name = `QA sponsor ${runId()}`;
    await page.goto('/editor/sponsors');
    await page.getByRole('button', { name: 'Add New' }).click();
    await page.locator('input[name="sponsors-name"]').fill(name);
    await page.locator('a.newadd-photo:visible').first().click();
    const chooser = page.waitForEvent('filechooser');
    await page.locator('.avatar-dropzone:visible').first().click();
    const uploaded = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().endsWith('/editor/people'));
    await (await chooser).setFiles({ name: 'qa-sponsor.png', mimeType: 'image/png', buffer: solidPng(30, 100, 160) });
    const upload = await (await uploaded).text();
    const notice = upload.replace(/<[^>]+>/g, ' ').match(/Warning[^{]*/)?.[0];
    if (notice) test.info().annotations.push({ type: 'server notice on photo upload', description: notice.trim() });
    const accept = page.getByRole('button', { name: 'Accept' });
    await accept.click();
    await expect(accept, 'Accept did not close the crop step').toBeHidden();
    await page.locator('button.people-save:visible').click();

    await page.goto('/editor/sponsors');
    const link = page.locator('a[href*="#edit"]', { hasText: name }).first();
    await expect(link, 'The sponsor was not added').toBeVisible();
    const sponsorId = new URL((await link.getAttribute('href'))!, page.url()).searchParams.get('id')!;
    try {
      await page.goto(`/editor/sponsors?id=${sponsorId}#person-edit-tab`);
      // Profile photos are served from the avatars host under the person's id.
      const photo = page.locator(`#person-edit-tab img[src*="/${sponsorId}/avatar"]`).first();
      await expect(photo, 'The sponsor photo was not saved').toBeVisible();
      await expectImageLoads(page, (await photo.getAttribute('src'))!);
    } finally {
      // The editor's Remove link for a sponsor.
      await retryRequest(() => page.request.post('/editor/sponsors', { form: { what: 'delete', data: sponsorId } }));
    }
  });
  // ENG-87
  // ENG-87 (open): commas separate types in the database, so "Workshop, Advanced" becomes two types. The agreed fix
  // is to block commas in session types; until then this check is expected to fail.
  test('ENG-87: a session type with a comma is stored as one type (open data issue: expected to fail until fixed)', async ({ page }) => {
    openBug('ENG-87', 'commas separate session types in the database, so the type is split in two');
    const id = runId();
    const title = `QA F9 type comma ${id}`;
    const type = `QA Workshop, Advanced ${id}`;
    await openAddSession(page);
    await page.locator('#add-session-title').fill(title);
    await page.locator('#add-session-start-date').fill(await eventFirstDay(page));
    // A new type is created from the type dropdown's "+ Add new type" option, which opens a small name field.
    await page.locator('#add-event-type-selectized').click();
    await page.locator('#session-add-tab .selectize-dropdown:visible').getByText(/add new type/i).click();
    await page.locator('#add-session-newtype-name').fill(type);
    await page.locator('#add-session-newtype-save').click();
    const sent = await publishNewSession(page);
    expect(sent, 'The form did not send the type').toContain(type);

    await openEditSession(page, title);
    // The type field keeps the stored types as the select's chosen options (a split type shows as two).
    const types = () => page.locator('#edit-event-type').evaluate((e) => [...(e as HTMLSelectElement).selectedOptions].map((o) => o.text));
    await expect.poll(types, { message: 'The session type was split or changed' }).toEqual([type]);
  });
});

// Secret sessions are an Ultra feature: they run on the capacity event (EPH_CAPACITY_URL), which is on Ultra.
test.describe('F9 secret sessions (needs the eph capacity event, on Ultra)', () => {
  test.use(capacityEvent);

  // REG-104 (ENG-2166, ENG-1735, ENG-460, ENG-2117): a secret session doesn't appear in the public schedule for a
  // logged-in attendee who isn't enrolled, nor for a logged-out visitor; the admin sees it with its SECRET label. The
  // reminder emails stay manual (no email on eph).
  test('REG-104: a secret session is hidden from the public schedule; the admin sees its SECRET label', async ({ page, newPage, baseURL }) => {
    await requireSecretSessions(page);
    requireAccount('ATTENDEE');
    const title = `QA secret ${runId()}`;
    const id = await createSession(page, title, { secret: true });
    await page.goto(`/event/${id}`);
    await expect(page.getByText('SECRET', { exact: true }).first(), 'The admin should see the session marked SECRET').toBeVisible();
    await page.goto('/list/simple');
    await expect(page.getByText(title).first(), 'The admin should see the secret session in the schedule').toBeVisible();

    const attendee = await newPage({ baseURL, storageState: { cookies: [], origins: [] } });
    await logInToEph(attendee, 'EPH_ATTENDEE', baseURL);
    const visitor = await newPage({ baseURL, storageState: { cookies: [], origins: [] } });
    for (const [who, other] of [['A logged-in attendee who isn\'t enrolled', attendee], ['A logged-out visitor', visitor]] as const) {
      await other.goto('/list/simple');
      await expect(other.getByText(title), `${who} should not see the secret session in the schedule`).toHaveCount(0);
    }
  });

  // REG-211 / TC-F9-04 (ENG-536): Sessions -> Bulk Actions -> Enroll by People Tag enrolls the attendees with that tag in
  // a secret session: the tagged attendee sees it in the schedule, the speaker (not tagged) doesn't. Needs the People
  // Tag "QA enroll" (Settings -> People Tags). The tag is taken off the attendee after the test. The speaker PDF and
  // the reminder emails stay manual.
  test('REG-211 / TC-F9-04: Enroll by People Tag enrolls the tagged attendee in a secret session', async ({ page, newPage, baseURL }) => {
    test.slow();
    await requireSecretSessions(page);
    requireAccount('ATTENDEE');
    requireAccount('SPEAKER');
    const attendee = await joinedAs(newPage, baseURL!, 'EPH_ATTENDEE');
    const speaker = await joinedAs(newPage, baseURL!, 'EPH_SPEAKER');
    const title = `QA secret enroll ${runId()}`;
    const id = await createSession(page, title, { secret: true });
    const userId = (await attendeeId(page, requireEnv('EPH_ATTENDEE_USERNAME')))!;
    const tag = await setPeopleTag(page, userId, 'QA enroll', true);
    try {
      // The request Enroll by People Tag's Update button sends (after its "Are you sure" prompt).
      const enrolled = await page.request.post('/editor/schedule', { form: { what: 'enrollTaggedMulti', 'data[sessionIds]': id, 'data[assign][]': tag } });
      expect(enrolled.ok(), 'Enroll by People Tag failed').toBe(true);
      await attendee.goto('/list/simple');
      await expect(attendee.getByText(title).first(), 'The tagged attendee should see the secret session they were enrolled in').toBeVisible();
      await speaker.goto('/list/simple');
      await expect(speaker.getByText(title), 'An attendee without the tag should not see the secret session').toHaveCount(0);
    } finally {
      await setPeopleTag(page, userId, 'QA enroll', false);
    }
  });
});

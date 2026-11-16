import { test, expect, Page } from '@playwright/test';
import { editorJson, retryRequest } from '../helpers';

// Session helpers shared by the eph specs that create sessions. The add and edit forms share field ids, prefixed with
// "add-" or "edit-" (for example #add-session-title).

// Opens the editor's "Add New" session form.
export async function openAddSession(page: Page) {
  await page.goto('/editor/schedule');
  await page.getByRole('button', { name: 'Add New' }).click();
  await expect(page.locator('#add-session-title')).toBeVisible();
}

// The event's first and last days (YYYY-MM-DD), as Settings shows them. Sessions outside the event's dates don't show
// on the public site, and eph's data (the event's dates with it) can change when eph is rebuilt: on 2026-11-15
// demofriends ran on January 31, 2018 only. So the tests put their sessions on the first day instead of a fixed date.
// Read once per run.
let dates: { first: string; last: string } | undefined;
export async function eventDates(page: Page) {
  if (!dates) {
    const html = await (await page.request.get('/editor/settings')).text();
    const found = html.match(/(\w+ \d+, \d{4}) to (\w+ \d+, \d{4})/);
    expect(found, 'Could not read the event\'s dates in Settings').toBeTruthy();
    const day = (text: string) => {
      const [, month, date, year] = text.match(/(\w+) (\d+), (\d{4})/)!;
      return `${year}-${String(new Date(`${month} 1, 2000`).getMonth() + 1).padStart(2, '0')}-${date.padStart(2, '0')}`;
    };
    dates = { first: day(found![1]), last: day(found![2]) };
  }
  return dates;
}

export async function eventFirstDay(page: Page) {
  return (await eventDates(page)).first;
}

// The day after a YYYY-MM-DD day.
export function nextDay(day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Picks a time from one of the editor's timepicker dropdowns (24-hour, every 15 minutes, for example "11:00"),
// the way a planner does. Typing into the field races with the form's own default end time.
export async function pickTime(page: Page, selector: string, time: string) {
  await page.locator(selector).click();
  await page.locator('.ui-timepicker-wrapper:visible li').getByText(time, { exact: true }).click();
  await expect(page.locator(selector)).toHaveValue(time);
}

// Sessions created by the running test, by title. The save response carries each new session's id, so the tests
// never depend on the editor's list (it stops showing new sessions once the event has many), and the eph fixtures
// delete them after each test, so runs don't pile up sessions on the shared eph event.
const created = new Map<string, string>();
// Titles published by the running test whose save didn't return an id (a failed upload still creates the session).
const unconfirmed = new Set<string>();

// The id of a session the running test created (the public session page is /event/<id>).
export function sessionId(title: string) {
  const id = created.get(title);
  expect(id, `Session "${title}" was not created by this test`).toBeTruthy();
  return id!;
}

// Opens the edit form of a session this test created and returns its id. The public session page is /event/<id>.
export async function openEditSession(page: Page, title: string) {
  const id = created.get(title);
  expect(id, `Session "${title}" was not created by this test`).toBeTruthy();
  await page.goto(`/editor/schedule/?id=${id}#session-edit-tab`);
  await expect(page.locator('#edit-session-title')).toHaveValue(title);
  return id!;
}

// Clicks Publish in the add form, records the new session's id and returns the form data the editor sent.
export async function publishNewSession(page: Page) {
  const title = await page.locator('#add-session-title').inputValue();
  unconfirmed.add(title);
  // With a photo or file attached the browser doesn't expose the body (it carries the files), so a body-less POST to
  // /editor/schedule also counts as the save.
  const body = (r: { postDataBuffer(): Buffer | null }) => r.postDataBuffer()?.toString('latin1') ?? null;
  const saved = page.waitForResponse((r) => {
    const req = r.request();
    return req.method() === 'POST' && /\/editor\/schedule$/.test(r.url()) && (body(req) === null || body(req)!.includes('saveSession'));
  });
  await page.getByRole('button', { name: 'Publish' }).click();
  const response = await saved;
  // The editor parses the JSON after any PHP notice the server prints first; do the same, but report the notice.
  const text = await response.text();
  const notice = text.slice(0, Math.max(0, text.search(/\{\s*"/))).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (notice) test.info().annotations.push({ type: 'server notice on save', description: notice });
  const result = JSON.parse(text.slice(text.search(/\{\s*"/)));
  expect(result.status, `Publishing "${title}" failed: ${JSON.stringify(result.actionresult ?? result)}`).toBe('OK');
  created.set(title, result.result);
  unconfirmed.delete(title);
  return body(response.request()) ?? '';
}

// Deletes a session the way the editor's Delete link does.
export async function deleteSession(page: Page, id: string) {
  const response = await retryRequest(() => page.request.post('/editor/schedule', { form: { what: 'delete', data: id } }));
  expect(response.ok(), `Could not delete session ${id}`).toBeTruthy();
}

// The description editors (Froala) of the add and edit forms.
export const addDescription = (page: Page) => page.locator('#session-add-tab .fr-element').first();
export const editDescription = (page: Page) => page.locator('#session-edit-tab .fr-element').first();

// Deletes every session the running test created. The eph fixtures (fixtures.ts) call it after each test.
export async function deleteCreatedSessions(page: Page) {
  const ids = [...created.values()];
  if (unconfirmed.size) {
    await page.goto('/editor/schedule');
    for (const title of unconfirmed) {
      const href = await page.getByRole('link', { name: title, exact: true }).first().getAttribute('href', { timeout: 5_000 }).catch(() => null);
      const id = href && new URL(href, page.url()).searchParams.get('id');
      if (id) ids.push(id);
    }
  }
  for (const id of ids) await deleteSession(page, id);
  created.clear();
  unconfirmed.clear();
}

// Creates and publishes a session on the event's first day and returns its id. It sends the request the editor's
// Publish button sends (what=saveSession), so a test that only needs a session to exist doesn't spend its time in the
// form; the checks of the form itself (REG-208, REG-209, REG-210, ENG-2244) use openAddSession and publishNewSession.
// The description is HTML, as the editor stores it.
export async function createSession(page: Page, title: string, { start = '10:00', end = '10:30', description = '' } = {}) {
  const day = await eventFirstDay(page);
  unconfirmed.add(title);
  const response = await retryRequest(() => page.request.post('/editor/schedule', {
    multipart: {
      what: 'saveSession', 'data[name]': title, 'data[description]': description, 'data[seats]': '0',
      'data[event_start]': `${day} ${start}:00`, 'data[event_end]': `${day} ${end}:00`,
      'data[active]': 'Y', 'data[pinned]': 'N', 'data[frozen]': 'N', 'data[private]': 'N', 'data[moderators]': 'false',
    },
  }));
  const result = await editorJson(response, `Creating "${title}"`);
  expect(result.status, `Creating "${title}" failed: ${JSON.stringify(result.actionresult ?? result)}`).toBe('OK');
  created.set(title, result.result);
  unconfirmed.delete(title);
  return result.result as string;
}

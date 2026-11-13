import { test, expect, Page } from '@playwright/test';

// Session helpers shared by the eph specs that create sessions. The add and edit forms share field ids, prefixed with
// "add-" or "edit-" (for example #add-session-title).

// Opens the editor's "Add New" session form.
export async function openAddSession(page: Page) {
  await page.goto('/editor/schedule');
  await page.getByRole('button', { name: 'Add New' }).click();
  await expect(page.locator('#add-session-title')).toBeVisible();
}

// Picks a time from one of the editor's timepicker dropdowns (24-hour, every 15 minutes, for example "11:00"),
// the way a planner does. Typing into the field races with the form's own default end time.
export async function pickTime(page: Page, selector: string, time: string) {
  await page.locator(selector).click();
  await page.locator('.ui-timepicker-wrapper:visible li').getByText(time, { exact: true }).click();
  await expect(page.locator(selector)).toHaveValue(time);
}

// Sessions created by the running test, by title. The save response carries each new session's id, so the tests
// never depend on the editor's list (it stops showing new sessions once the event has many), and afterEach deletes
// them, so runs don't pile up sessions on the shared eph event.
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
  const notice = text.slice(0, Math.max(0, text.indexOf('{'))).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (notice) test.info().annotations.push({ type: 'server notice on save', description: notice });
  const result = JSON.parse(text.slice(text.indexOf('{')));
  expect(result.status, `Publishing "${title}" failed: ${JSON.stringify(result.actionresult ?? result)}`).toBe('OK');
  created.set(title, result.result);
  unconfirmed.delete(title);
  return body(response.request()) ?? '';
}

// Deletes a session the way the editor's Delete link does.
export async function deleteSession(page: Page, id: string) {
  const response = await page.request.post('/editor/schedule', { form: { what: 'delete', data: id } });
  expect(response.ok(), `Could not delete session ${id}`).toBeTruthy();
}

// The description editors (Froala) of the add and edit forms.
export const addDescription = (page: Page) => page.locator('#session-add-tab .fr-element').first();
export const editDescription = (page: Page) => page.locator('#session-edit-tab .fr-element').first();

// Deletes every session the running test created. Call it from afterEach in each spec that creates sessions.
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

// Creates and publishes a plain session on the event's first day and returns its id.
export async function createSession(page: Page, title: string) {
  await openAddSession(page);
  await page.locator('#add-session-title').fill(title);
  await page.locator('#add-session-start-date').fill('2026-01-31');
  await publishNewSession(page);
  return created.get(title)!;
}

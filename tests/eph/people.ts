import { test, expect, Page } from '@playwright/test';
import * as zlib from 'zlib';
import { runId } from '../helpers';

// Attendee helpers shared by the eph specs that add people. afterEach should call removeAddedAttendees.

const added: string[] = [];

// Adds an attendee from Attendees -> Add New with "Add" or "Add + Send Invite" and returns their name, id and email.
export async function addAttendee(page: Page, button: 'Add' | 'Add + Send Invite' = 'Add') {
  const name = `QA ${button === 'Add' ? 'add' : 'invite'} ${runId()}${added.length}`;
  const email = `${name.replace(/\W+/g, '-').toLowerCase()}@example.com`;
  await page.goto('/editor/attendees');
  await page.getByRole('button', { name: 'Add New' }).click();
  await page.locator('input[name="attendees-name"]').fill(name);
  await page.locator('input[name="attendees-email"]').fill(email);
  await page.getByRole('button', { name: button, exact: true }).click();
  // The add finishes in the background; reload the list until the attendee shows up.
  const row = page.getByRole('row').filter({ hasText: name });
  await expect.poll(async () => {
    await page.goto('/editor/attendees');
    return row.count();
  }, { message: `"${button}" did not add the attendee`, timeout: 30_000 }).toBe(1);
  const id = (await row.locator('input.row_checkbox').getAttribute('value'))!;
  added.push(id);
  return { name, id, email };
}

// Removes the attendees the running test added, the way the editor's Remove button does.
export async function removeAddedAttendees(page: Page) {
  for (const id of added.splice(0)) {
    const response = await page.request.post('/editor/attendees', { form: { what: 'deleteConfirmed', 'data[confirm]': 'Y', 'data[id]': id } });
    expect(response.ok(), `Could not remove attendee ${id}`).toBeTruthy();
  }
}

// Returns the display name of a speaker account, giving it one first if it has none. On demofriends the seed speaker
// (demofriendsspeaker) had no name, and a nameless speaker breaks the session form's Attach People list for every
// session ("Cannot read properties of null (reading 'toLowerCase')" while the editor sorts people by name).
export async function ensureSpeakerName(page: Page, username: string) {
  const response = await page.request.post('/editor/schedule?compact=y', { form: { what: 'actionGetRoleMembers' } });
  const speakers = Object.values((await response.json()).results?.speakers ?? {}) as { id: string; username: string; name: string | null }[];
  const speaker = speakers.find((person) => person.username === username);
  expect(speaker, `${username} is not a speaker on this event`).toBeTruthy();
  if (speaker!.name) return speaker!.name;
  const name = 'Demo Speaker';
  await page.goto(`/editor/speakers?id=${speaker!.id}#person-edit-tab`);
  const tab = page.locator('#person-edit-tab');
  await tab.locator('input[name="name"]').fill(name);
  const saved = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/editor/speakers'));
  await tab.getByRole('button', { name: 'Save Profile' }).click();
  expect((await (await saved).json()).status, `Could not name the speaker ${username}`).toBe('OK');
  test.info().annotations.push({ type: 'eph data', description: `${username} had no name; set it to "${name}"` });
  return name;
}

// A small solid-color PNG, so a test can upload images that differ from each other.
export function solidPng(red: number, green: number, blue: number, size = 64) {
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: size }, () => [red, green, blue]).flat())]);
  const pixels = zlib.deflateSync(Buffer.concat(Array.from({ length: size }, () => row)));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', pixels), chunk('IEND', Buffer.alloc(0))]);
}

// Sets the profile photo of an attendee who has none yet, from the editor (photo area, crop step's Accept, Save
// Profile). The photo area is a Dropzone.js zone (it lives in #edit-person-photo); clicking it doesn't open a file
// chooser here, so the test fills Dropzone's hidden file input.
export async function setAttendeePhoto(page: Page, id: string, png: Buffer) {
  await page.goto(`/editor/attendees?id=${id}#person-edit-tab`);
  await expect(page.locator('#edit-person-photo .avatar-dropzone')).toBeVisible({ timeout: 15_000 });
  // Dropzone keeps its instance on the element as .dropzone once it's set up, and replaces its input after each upload.
  const marker = `attendee-photo-${id}-${Date.now()}`;
  await expect.poll(() => page.evaluate((marker) => {
    const ready = [...document.querySelectorAll('#edit-person-photo .avatar-dropzone')].find((el) => (el as any).dropzone && (el as HTMLElement).offsetParent);
    ready && (ready as any).dropzone.hiddenFileInput.setAttribute('data-qa', marker);
    return !!ready;
  }, marker), { message: 'The photo area never became ready (does the attendee already have a photo?)', timeout: 20_000 }).toBe(true);
  await page.locator(`input[data-qa="${marker}"]`).setInputFiles({ name: `qa-${id}.png`, mimeType: 'image/png', buffer: png });
  const accept = page.getByRole('button', { name: 'Accept' });
  await accept.click();
  await expect(accept).toBeHidden();
  const saved = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/editor/attendees'));
  await page.locator('#person-edit-tab').getByRole('button', { name: 'Save Profile' }).click();
  await saved;
}

// The bytes of an attendee's current profile photo, as the editor shows it (profile photos live on the avatars host,
// under the person's id).
export async function attendeePhoto(page: Page, id: string) {
  await page.goto(`/editor/attendees?id=${id}#person-edit-tab`);
  const img = page.locator(`#person-edit-tab img[src*="/${id}/avatar"]`).first();
  await expect(img, `Attendee ${id} has no profile photo`).toBeVisible();
  const src = (await img.getAttribute('src'))!;
  return { src, bytes: await expectImageLoads(page, src) };
}

// Fetches an image the editor points to and fails unless it really loads. On eph, profile photos point to the
// production avatars host with the eph person's id: it answers 403, or, when a production person happens to have the
// same id, someone else's photo. So on eph these checks fail, and a pass there doesn't prove much.
export async function expectImageLoads(page: Page, src: string) {
  const response = await page.request.get(new URL(src, page.url()).toString());
  test.info().annotations.push({ type: 'image', description: `${response.status()} ${src}` });
  expect(response.ok() && /^image\//.test(response.headers()['content-type'] ?? ''), `The photo doesn't load: HTTP ${response.status()} ${response.headers()['content-type']} from ${src}`).toBe(true);
  return response.body();
}

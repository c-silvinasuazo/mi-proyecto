import { test, expect } from '@playwright/test';
import { requireEph, runId } from '../helpers';
import { requireEventCreationAllowed, stepsNotRecordedYet } from './preconditions';

// F2 events. Cases still marked fixme are placeholders until they're recorded (see README: Recording a flow).
test.describe('F2 events', () => {
  test.beforeEach(() => requireEph());

  // TC-F2-08 (ENG-446): Dashboard -> My Events -> Create New Event (organization, name, URL) -> Create opens the new
  // event's editor, logged in, with no redirect to Contact Us. Opt-in: each run creates an event on eph that can't be
  // deleted. The /signup half of the title (TC-F2-01) stays manual: /signup has a captcha on eph.
  test('TC-F2-01 / TC-F2-08: creates an event from /signup and from the Dashboard; its editor opens', async ({ page, baseURL }) => {
    requireEventCreationAllowed();
    const dashboard = new URL(baseURL!).origin.replace(/\/\/[^.]+\./, '//dashboard.');
    const url = `qaf2${runId()}`;
    await page.goto(`${dashboard}/my-events`);
    await page.getByRole('button', { name: 'Create New Event' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Event' });
    const newOrg = dialog.getByRole('textbox', { name: 'Organization name' });
    if (await newOrg.isVisible()) await newOrg.fill(`QA F2 Org ${url}`);
    await dialog.getByRole('textbox', { name: 'Event name' }).fill(`QA F2 event ${url}`);
    const urlBox = dialog.getByRole('textbox', { name: 'Event URL' });
    await urlBox.clear();
    await urlBox.pressSequentially(url, { delay: 30 });
    await urlBox.blur();
    const create = dialog.getByRole('button', { name: 'Create New Event' });
    await expect(create).toBeEnabled({ timeout: 15_000 });
    await create.click();
    // The new event's subdomain is built from what was typed (on eph it came out as "qaf2event<url>"), so check that it
    // contains the unique part and that its editor opened.
    await expect(page, 'Creating the event did not open its editor').toHaveURL(new RegExp(`//[^/]*${url}[^/]*\\.[^/]+/editor`), { timeout: 60_000 });
    await expect(page, 'Creating the event redirected to Contact Us').not.toHaveURL(/contact/i);
    await expect(page, 'The new event asked to log in').not.toHaveURL(/login/);
  });

  // TC-F2-04: in the Dashboard's Create New Event, a taken URL (an existing event) and a reserved one ("admin") show a
  // warning and keep Create disabled; a free URL enables it. Nothing is created.
  test('TC-F2-04: a taken or reserved URL disables "Create event"', async ({ page, baseURL }) => {
    const dashboard = new URL(baseURL!).origin.replace(/\/\/[^.]+\./, '//dashboard.');
    await page.goto(`${dashboard}/my-events`);
    await page.getByRole('button', { name: 'Create New Event' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Event' });
    const create = dialog.getByRole('button', { name: 'Create New Event' });
    const url = dialog.getByRole('textbox', { name: 'Event URL' });
    // Without an organization the dialog asks for a new one's name; once the admin has one, it's a dropdown instead.
    const newOrg = dialog.getByRole('textbox', { name: 'Organization name' });
    if (await newOrg.isVisible()) await newOrg.fill(`QA F2 Org ${runId()}`);

    // The URL is checked as it's typed (after a short pause), so type it rather than paste it.
    const typeUrl = async (value: string) => {
      await url.clear();
      await url.pressSequentially(value, { delay: 30 });
      await url.blur();
    };
    await typeUrl(`qaf2free${runId()}`);
    await expect(create, 'A free URL should enable Create').toBeEnabled({ timeout: 15_000 });

    const existing = new URL(baseURL!).hostname.split('.')[0];
    for (const taken of [existing, 'admin']) {
      await typeUrl(taken);
      await expect(dialog.getByRole('status').or(dialog.getByText(/not available|already taken/i)).first(), `No warning for the URL "${taken}"`).toContainText(/not available|taken/i);
      await expect(create, `Create is enabled for the URL "${taken}"`).toBeDisabled();
    }
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  // REG-014 / ENG-271: duplicating creates a new event on eph each run, so it's opt-in (see TC-F2-01).
  test('REG-014 / ENG-271: duplicating keeps registration off Eventbrite and shows current Settings labels', async () => {
    requireEventCreationAllowed();
    stepsNotRecordedYet();
  });
});

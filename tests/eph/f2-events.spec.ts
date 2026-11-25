import { test, expect } from './fixtures';
import { runId } from '../helpers';
import { requireEventCreationAllowed } from './preconditions';

// F2 events. Cases still marked fixme are placeholders until they're recorded (see README: Recording a flow).
test.describe('F2 events', () => {
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

  // REG-014 / TC-F2-03 (ENG-2022, ENG-271, ENG-2240): duplicating the payments event (which sells with Sched Ticketing,
  // the case ENG-2022 was reported for) with every option checked gives a copy that isn't switched to Eventbrite, keeps
  // the registration form and shows the current Settings sections. It sends the request the Dashboard's Duplicate
  // Event dialog sends. Each run creates an event on eph that can't be deleted, so it's opt-in (see TC-F2-01).
  test('REG-014 / ENG-271: duplicating keeps registration off Eventbrite and shows current Settings labels', async ({ page, baseURL }) => {
    requireEventCreationAllowed();
    test.skip(!process.env.EPH_PAYMENTS_URL, 'Duplicates the payments event (EPH_PAYMENTS_URL), which uses Sched Ticketing');
    const source = new URL(process.env.EPH_PAYMENTS_URL!).hostname.split('.')[0];
    const main = new URL(baseURL!).origin.replace(/\/\/[^.]+\./, '//');
    await page.goto('/editor');
    // The Dashboard calls the main site's API with the session's token as Authorization.
    const token = JSON.parse(decodeURIComponent((await page.context().cookies(main)).find((c) => c.name === 'token')!.value));
    // Duplicating copies the whole event and takes longer than a click's time.
    const api = (path: string, data?: object) => (data ? page.request.post(`${main}/api/${path}`, { headers: { authorization: token }, data, timeout: 90_000 }) : page.request.get(`${main}/api/${path}`, { headers: { authorization: token } }));
    // The organization that owns the source event.
    const orgs = (await (await api('org/list')).json()).organizations as { id: string }[];
    let orgid: string | undefined;
    for (const org of orgs) {
      const confs = JSON.stringify(await (await api(`org/conf?orgid=${org.id}&format=json`)).json());
      if (confs.includes(`"${source}"`)) orgid = org.id;
    }
    expect(orgid, `No organization of the admin owns ${source}`).toBeTruthy();
    const options = ['sessions', 'venues', 'moderators', 'custom pages', 'admins', 'speakers', 'artists', 'sponsors', 'exhibitors', 'registration form', 'session feedback form', 'event feedback form', 'badges', 'appearance', 'content', 'speaker tools', 'attendance', 'privacy'];
    const confid = `qadup${runId()}`;
    const created = await api('org/create-conf', { orgid, deptid: orgid, name: `QA duplicate ${runId()}`, confid, source_conf: { confid: source, options } });
    expect(created.status(), `Duplicating ${source} failed: ${(await created.text()).slice(0, 200)}`).toBe(201);

    const copy = `https://${confid}.${new URL(main).host}`;
    await page.goto(`${copy}/editor`);
    expect(await page.content(), 'The copy should not be switched to Eventbrite registration (ENG-2022)').toContain('"privacy_eventbrite":"false"');
    await page.goto(`${copy}/editor/registration`);
    await expect(page.getByRole('button', { name: 'Customize Form' }), 'The copy should keep the registration form (ENG-2240)').toBeVisible();
    await page.goto(`${copy}/editor/settings`);
    for (const section of ['Session Visibility', 'Waitlist Settings']) {
      await expect(page.getByText(section).first(), `The copy's Settings should show "${section}" (ENG-271)`).toBeVisible();
    }
  });
});

import { test, expect, Page } from '@playwright/test';
import { logInToEph, requireEph, runId } from '../helpers';
import { addAttendee, attendeePhoto, ensureSpeakerName, removeAddedAttendees, setAttendeePhoto, solidPng } from './people';
import { requireAccount, requireEventFeedback, requireEventRunningToday, requirePdHours, requireSponsorLevelEditing, stepsNotRecordedYet } from './preconditions';
import { deleteCreatedSessions, openAddSession, publishNewSession, sessionId } from './sessions';

type SpeakerTools = { 'Edit session details': boolean; 'Edit session description': boolean };
const speakerToolSwitch = (page: Page, name: keyof SpeakerTools) => page.locator('#speaker-tools').getByRole('switch', { name, exact: true });

// Settings -> Speaker Tools: the two session editing options, by the names the planner sees.
async function speakerTools(page: Page): Promise<SpeakerTools> {
  await page.goto('/editor/settings');
  return {
    'Edit session details': await speakerToolSwitch(page, 'Edit session details').isChecked(),
    'Edit session description': await speakerToolSwitch(page, 'Edit session description').isChecked(),
  };
}

async function setSpeakerTools(page: Page, options: SpeakerTools) {
  await page.goto('/editor/settings');
  for (const [name, on] of Object.entries(options) as [keyof SpeakerTools, boolean][]) {
    const box = speakerToolSwitch(page, name);
    if ((await box.isChecked()) !== on) await box.evaluate((el) => (el as HTMLInputElement).click());
  }
  await page.locator('#frm-general-submit').click();
  await page.waitForLoadState('networkidle').catch(() => {});
  expect(await speakerTools(page), 'Speaker Tools did not save').toEqual(options);
}

// feedback, profiles, sponsors and PD. Cases still marked fixme are placeholders until they're recorded (see README: Recording a flow).
test.describe('feedback, profiles, sponsors and PD', () => {
  test.beforeEach(() => requireEph());
  test.afterEach(async ({ page }) => {
    await removeAddedAttendees(page);
    await deleteCreatedSessions(page);
  });

  // REG-118
  test('REG-118: session feedback timestamps use the event time zone', async ({ page }) => {
    await requireEventFeedback(page);
    stepsNotRecordedYet();
  });
  // REG-221
  test('REG-221: event feedback export shows a readable "saved at"', async ({ page }) => {
    await requireEventFeedback(page);
    stepsNotRecordedYet();
  });
  // ENG-2588
  test('ENG-2588: event feedback isn\'t shown as received before submitting', async ({ page }) => {
    await requireEventFeedback(page);
    stepsNotRecordedYet();
  });
  // ENG-2592
  test('ENG-2592: the Provide Feedback button is horizontal on the web', async ({ page }) => {
    await requireEventFeedback(page);
    stepsNotRecordedYet();
  });
  // REG-222
  // REG-222 (ENG-2087): two attendees get different photos and each keeps their own. The second half of the case
  // (ENG-2133: updating one attendee's photo shows the new one and doesn't change the other) stays manual for now: in
  // the eph editor, after "Delete image" the photo area doesn't offer an upload again, even after saving and reopening.
  test('REG-222: two attendees keep their own photos; updating one doesn\'t change the other', async ({ page }) => {
    const first = await addAttendee(page);
    const second = await addAttendee(page);
    await setAttendeePhoto(page, first.id, solidPng(220, 30, 30));
    await setAttendeePhoto(page, second.id, solidPng(30, 30, 220));
    const [firstPhoto, secondPhoto] = [await attendeePhoto(page, first.id), await attendeePhoto(page, second.id)];
    expect(firstPhoto.bytes.equals(secondPhoto.bytes), 'Both attendees show the same photo').toBe(false);
    expect((await attendeePhoto(page, first.id)).bytes.equals(firstPhoto.bytes), 'The first attendee\'s photo changed').toBe(true);
  });
  // REG-223
  test('REG-223: a sponsor level can be created and deleted (needs a paid plan)', async ({ page }) => {
    await requireSponsorLevelEditing(page);
    stepsNotRecordedYet();
  });
  // REG-124 / ENG-2068 / ENG-1214
  test('REG-124 / ENG-2068 / ENG-1214: PD setup and approval work; the PD badge shows (needs the pdhours tag)', async ({ page }) => {
    await requirePdHours(page);
    stepsNotRecordedYet();
  });
  // ENG-1543 (closed 2026-11-04, working as designed): once PD Hours is set up, every session with a start and end time
  // earns credit for its duration (1.00 credit per hour by default) unless the planner overrides it or marks the
  // session ineligible; TBA sessions get none. After PD setup: a timed session's credit equals its duration, a TBA
  // session has none, and a session marked ineligible has none.
  test('ENG-1543: after PD setup, a timed session earns credit for its duration; TBA and ineligible sessions earn none', async ({ page }) => {
    await requirePdHours(page);
    stepsNotRecordedYet();
  });
  // ENG-2641
  test('ENG-2641: session check-in stays open until 10 minutes after the end, then closes', async ({ page }) => {
    await requireEventRunningToday(page);
    stepsNotRecordedYet();
  });
  // ENG-2217: Settings -> Speaker Tools has "Edit session details" and "Edit session description", and the request says
  // their names are swapped. With one of them on, a speaker attached to a session gets one tool on the session's
  // speaker page (/event/<id>/edit): "Edit Description" (the description editor only) or "Edit Session" (title, video
  // stream, button link and photo). Turns on one option at a time and checks that the option named for the description
  // gives "Edit Description" and the one named for the details gives "Edit Session". ENG-2217 was closed on 2026-11-13
  // with the names switched, and this passes on eph since then (a regression check now); on eph 2026-11-12, before the
  // fix, each option gave the other tool. Both options are put back.
  test('ENG-2217: with only one Speaker Tools option on, a speaker can edit only the matching fields', async ({ page, browser }) => {
    requireAccount('SPEAKER');
    test.setTimeout(240_000);
    const speaker = await ensureSpeakerName(page, process.env.EPH_SPEAKER_USERNAME!);
    const title = `QA ENG-2217 ${runId()}`;
    await openAddSession(page);
    await page.locator('#add-session-title').fill(title);
    await page.locator('#add-session-start-date').fill('2026-01-31');
    await page.locator('#session-add-tab .select-wrapper--people .selectize-input').click();
    await page.keyboard.type(speaker);
    await page.locator('.selectize-dropdown:visible .option', { hasText: speaker }).first().click();
    await expect(page.locator('#add-session-peoplelist-speakers')).toContainText(speaker);
    await publishNewSession(page);
    const id = sessionId(title);

    const before = await speakerTools(page);
    const speakerContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const sp = await speakerContext.newPage();
    try {
      await logInToEph(sp, 'EPH_SPEAKER');
      // The speaker page's tools are tabs (li.tab-link): Your Attendees, Edit Profile, Add Presentation, then the editing tool.
      const tool = (name: string) => sp.locator('li.tab-link', { hasText: name });
      const toolsShown = async () => {
        await sp.goto(`/event/${id}/edit`);
        await expect(tool('Your Attendees'), 'The speaker tools page did not open for the speaker').toBeVisible();
        return (await sp.locator('li.tab-link').allInnerTexts()).map((t) => t.trim()).filter((t) => /^Edit (Description|Session)$/.test(t));
      };

      await test.step('only "Edit session description" on: the speaker can edit the description only', async () => {
        await setSpeakerTools(page, { 'Edit session details': false, 'Edit session description': true });
        const shown = await toolsShown();
        test.info().annotations.push({ type: 'speaker tools with "Edit session description" on', description: shown.join(', ') });
        expect.soft(shown, 'The option named "Edit session description" should give the description editor').toEqual(['Edit Description']);
      });

      await test.step('only "Edit session details" on: the speaker can edit the title, video stream, button link and photo', async () => {
        await setSpeakerTools(page, { 'Edit session details': true, 'Edit session description': false });
        const shown = await toolsShown();
        test.info().annotations.push({ type: 'speaker tools with "Edit session details" on', description: shown.join(', ') });
        expect.soft(shown, 'The option named "Edit session details" should give the session details form').toEqual(['Edit Session']);
      });

      await test.step('each tool opens its own fields', async () => {
        // Whatever the option is called, "Edit Description" opens only the description editor and "Edit Session" only
        // the details. The current state (details on) shows one of them; check whichever it is, then the other.
        for (const options of [{ 'Edit session details': true, 'Edit session description': false }, { 'Edit session details': false, 'Edit session description': true }]) {
          await setSpeakerTools(page, options);
          const [shown] = await toolsShown();
          await tool(shown).click();
          const titleField = sp.locator('input[name="title"]');
          const descriptionEditor = sp.locator('.fr-element');
          if (shown === 'Edit Session') {
            await expect(titleField, '"Edit Session" should open the title field').toBeVisible();
            for (const name of ['video_stream', 'rsvp_url']) await expect(sp.locator(`input[name="${name}"]`)).toBeVisible();
            await expect(descriptionEditor, '"Edit Session" should not open the description').toBeHidden();
          } else {
            await expect(descriptionEditor, '"Edit Description" should open the description editor').toBeVisible();
            await expect(titleField, '"Edit Description" should not open the title').toBeHidden();
          }
        }
      });
    } finally {
      await speakerContext.close();
      await setSpeakerTools(page, before);
    }
  });
});

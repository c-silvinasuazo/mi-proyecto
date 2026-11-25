import { expect, Page } from '@playwright/test';

// A session's page on the event site (/event/<id>) and the logged-in visitor's My Schedule. The star-like toggle next
// to the title (span.ev-save) is the real control; "Click here to add" is just text.
export class SessionPage {
  constructor(readonly page: Page) {}

  async goto(id: string) {
    await this.page.goto(`/event/${id}`);
  }

  get toggle() {
    return this.page.getByRole('button', { name: /my schedule/i });
  }

  private get toggleText() {
    return this.page.locator('#add-remove-text');
  }

  async addToMySchedule() {
    await this.clickToggle('add');
    await expect(this.toggleText, 'The session was not added to My Schedule').not.toHaveText(/^add to My Schedule$/);
  }

  async removeFromMySchedule() {
    await this.clickToggle('del');
    await expect(this.toggleText, 'The session was not removed from My Schedule').toHaveText(/^add to My Schedule$/);
  }

  // The toggle calls /event-set?add=<id> (or ?del=) and then reloads the page. The label changes before the reload, so
  // wait for the request and the reload: a navigation started meanwhile (going to My Schedule) would cancel the reload
  // and fail with ERR_ABORTED. Removing a session with limited capacity asks first ("You may not be able to get back in
  // if this is full"): confirm it.
  private async clickToggle(action: 'add' | 'del') {
    const saved = this.page.waitForResponse((r) => r.url().includes(`/event-set?${action}=`));
    const reload = this.page.waitForEvent('framenavigated', { predicate: (frame) => frame === this.page.mainFrame(), timeout: 10_000 }).catch(() => null);
    await this.toggle.click();
    if (action === 'del') {
      const confirm = this.page.getByRole('alertdialog', { name: /Remove this from your schedule/ }).getByRole('button', { name: 'Remove' });
      const asked = await Promise.race([confirm.waitFor({ timeout: 10_000 }).then(() => true, () => false), saved.then(() => false)]);
      if (asked) await confirm.click();
    }
    expect((await saved).ok(), `The My Schedule request (${action}) failed`).toBe(true);
    if (await reload) await this.page.waitForLoadState('load');
  }

  // The visitor's My Schedule page, and a session's title in it.
  async openMySchedule() {
    await this.page.goto('/my-schedule');
  }

  mySchedulesEntry(title: string) {
    return this.page.getByText(title);
  }
}

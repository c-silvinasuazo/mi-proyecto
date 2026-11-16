import { expect, Locator, Page } from '@playwright/test';
import { logInToEph, requireEnv } from '../../helpers';

export type CheckinAccount = 'EPH' | 'EPH_ATTENDEE';

// The web Check-In App (/checkin), as check-in staff use it on a phone (Sched Count is iOS only) and as the editor's
// admin uses it on a desktop. It has its own login: logging in as the admin ends the editor session, so a test calls
// editorSession.ended() first (fixtures.ts). eph allows only a few logins in a row ("Too many attempts at log in. Try
// again in 10 minutes"), so each test logs in as few times as it can.
export class CheckinApp {
  constructor(readonly page: Page) {}

  // Logs in to the app. demofriends is a private event, so the page needs a session on the event to get past its
  // password wall: the admin's page starts from the saved editor session, and another account logs in to the event
  // first. Resolves with the app's first request after logging in (its list of sessions), which tells whether the app
  // let the account in.
  async logIn(account: CheckinAccount) {
    if (account !== 'EPH') await logInToEph(this.page, account);
    await this.page.goto('/checkin');
    await this.page.getByRole('textbox', { name: 'Email or Username' }).fill(requireEnv(`${account}_USERNAME`));
    await this.passwordField.fill(requireEnv(`${account}_PASSWORD`));
    const sessions = this.page.waitForResponse((r) => r.url().includes('/api/v2.0/checkin/sessions'));
    await this.page.getByRole('button', { name: 'Log in' }).click();
    return sessions;
  }

  get passwordField() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  // Past sessions (the eph event's dates are in the past) are behind "Show All Sessions".
  get showAllSessions() {
    return this.page.getByText(/show all sessions/i);
  }

  // Waits until the app shows its list of sessions.
  async waitForSessions() {
    await expect(this.passwordField, 'The Check-In App did not log in').toBeHidden({ timeout: 20_000 });
    await expect(this.showAllSessions.or(this.page.locator('ons-list[modifier="session"]')).first()).toBeVisible({ timeout: 20_000 });
  }

  // Opens the app again from scratch (a reload), so what it shows comes from the server, not from the screen.
  async reopen() {
    await this.page.reload();
    await this.waitForSessions();
  }

  // Opens a session's list of attendees.
  async openSession(title: string) {
    if (await this.showAllSessions.isVisible()) await this.showAllSessions.click();
    await this.page.getByText(title).first().click();
  }

  // The session's heading with its count, for example "(1/1) QA session".
  sessionCount(title: string, checkedIn: number, attendees: number) {
    return this.page.getByText(`(${checkedIn}/${attendees}) ${title}`);
  }

  // The check-in circles in an open session's list (label.sched-checkbox; the real checkbox behind each is hidden, and
  // tapping elsewhere on a row opens the attendee's details instead).
  get circles() {
    return this.page.locator('label.sched-checkbox');
  }

  // Menu -> Name Search Event Check-In, then searches. The app asks for 3+ characters of a first or last name.
  async nameSearch(text: string) {
    await this.page.locator('[ng-click*="menu.toggle"]').first().click();
    await this.page.getByText('Name Search Event Check-In').click();
    await this.page.locator('input[type="search"]:visible').fill(text);
  }

  // An attendee's row in Name Search.
  searchResult(name: string) {
    return this.page.locator('#name-search-list .person', { hasText: name });
  }

  // The hidden checkbox that holds a row's check-in state.
  checkbox(row: Locator) {
    return row.locator('input[type="checkbox"]');
  }

  // Taps a row's circle and resolves with the check-in request it sends.
  async tapCircle(row: Locator) {
    const saved = this.page.waitForResponse((r) => r.url().includes('/api/v2.0/checkin/add'));
    await row.locator('label.sched-checkbox').click();
    return saved;
  }
}

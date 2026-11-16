import { expect, Page, Response } from '@playwright/test';
import { retryRequest } from '../../helpers';

// The eph event's CFP app (cfp.<env>.eph.sched.co), as the organizer opens it from the editor's Call For Papers page.
// The app keeps the organizer's API token in localStorage; the tests use it to create their own forms and archive them
// afterwards (forms can be archived, not deleted). The eph fixtures archive every form a test created.
export class CfpOrganizer {
  private readonly forms: number[] = [];

  private constructor(readonly page: Page, private readonly token: string, readonly confId: string) {}

  // Opens the CFP portal from the editor in a new tab and waits until it has signed the organizer in.
  static async open(editor: Page) {
    await editor.goto('/editor/callforpapers');
    const tab = editor.context().waitForEvent('page');
    await editor.getByRole('link', { name: 'Call For Papers (CFP) portal' }).click();
    const page = await tab;
    // The sign-in step (/organizer/auth/<token>) can take a while on eph.
    await expect(page, 'The CFP portal stayed on the sign-in step').not.toHaveURL(/\/organizer\/auth\//, { timeout: 90_000 });
    await expect(page).toHaveURL(/\/organizer\/[^/]+\//, { timeout: 30_000 });
    const readToken = () => page.evaluate(() => localStorage.getItem('organizer_auth_token'));
    await expect.poll(readToken, { message: 'The CFP portal did not sign the organizer in', timeout: 30_000 }).toBeTruthy();
    const token = (await readToken())!;
    const confId = page.url().match(/\/organizer\/([^/]+)\//)![1];
    return new CfpOrganizer(page, token, confId);
  }

  get origin() {
    return new URL(this.page.url()).origin;
  }

  // A request to the organizer API, as the app sends it.
  async api(method: 'GET' | 'POST' | 'PATCH', path: string, data?: object) {
    const response = await retryRequest(() => this.page.request.fetch(this.origin + path, {
      method, data, headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' },
    }));
    expect(response.ok(), `CFP ${method} ${path} answered ${response.status()}`).toBe(true);
    return response.json();
  }

  // Creates a form (published, like the "Create new form" button does), optionally with dates (YYYY-MM-DD), and returns
  // its id and public link.
  async createForm(name: string, dates: { start?: string; end?: string } = {}) {
    const { form_id: id } = await this.api('POST', '/api/organizer/forms/create', { conf_id: this.confId });
    this.forms.push(id);
    await this.api('POST', '/api/organizer/forms/save', { id, name });
    await this.setDates(id, dates);
    const { data } = await this.api('GET', `/api/organizer/forms/list?conf_id=${this.confId}&archived=false`);
    const form = (data as { id: number; token: string }[]).find((f) => f.id === id);
    expect(form, `Form ${id} is not in the list of active forms`).toBeTruthy();
    return { id, url: `${this.origin}/speaker/${form!.token}` };
  }

  // Sets a form's application start and end dates, the way the Form details step saves them.
  async setDates(id: number, { start, end }: { start?: string; end?: string }) {
    if (start) await this.api('POST', '/api/organizer/forms/save', { id, start_at: start });
    if (end) await this.api('POST', '/api/organizer/forms/save', { id, end_at: end });
  }

  // The applications sent to the event's forms.
  async applications() {
    const { data } = await this.api('GET', `/api/organizer/forms/submission/list?conf_id=${this.confId}&page=1&per_page=100`);
    return data as Record<string, unknown>[];
  }

  // Archives every form this organizer created.
  async archiveForms() {
    for (const id of this.forms.splice(0)) await this.api('PATCH', '/api/organizer/forms/archive', { id: String(id) });
  }
}

export type CfpSpeaker = { name: string; email: string; company: string; position: string; about: string };

// A CFP form's public page, as an applicant sees it.
export class CfpForm {
  constructor(readonly page: Page, readonly url: string) {}

  async open() {
    await this.page.goto(this.url);
    await expect(this.page.getByText('Application start'), 'The CFP form did not load').toBeVisible({ timeout: 20_000 });
  }

  get submit() {
    return this.page.getByRole('button', { name: 'Submit', exact: true });
  }

  get closedNotice() {
    return this.page.getByText('Submissions are currently closed');
  }

  private get modal() {
    return this.page.locator('.n-modal, [role="dialog"]').last();
  }

  // Submit -> "Log in" -> email and password. Resolves with the login response.
  async logIn(email: string, password: string): Promise<Response> {
    await this.submit.click();
    // "Log in" in the first modal is a plain div (it can't be reached with the keyboard; noted in ENG-2091's review).
    await this.modal.getByText('Log in', { exact: true }).click();
    await this.modal.getByRole('textbox').first().fill(email);
    await this.modal.locator('input[type="password"]').fill(password);
    const response = this.page.waitForResponse((r) => r.url().includes('/api/auth/email/login'));
    await this.modal.getByRole('button', { name: /^log in$/i }).click();
    return response;
  }

  // Submit -> "Sign up with Email" -> email and password twice. Resolves with the registration response; no email
  // verification is asked at this point, so the applicant is signed in right away.
  async signUp(email: string, password: string): Promise<Response> {
    await this.submit.click();
    await this.modal.getByText('Sign up with Email', { exact: true }).click();
    await this.modal.getByRole('textbox').first().fill(email);
    for (const box of await this.modal.locator('input[type="password"]').all()) await box.fill(password);
    const response = this.page.waitForResponse((r) => r.url().includes('/api/auth/email/registration'));
    await this.modal.getByRole('button', { name: 'Create', exact: true }).click();
    return response;
  }

  // Fills the default form (speaker form, then session form) and sends it. Resolves with the submit response.
  // Each speaker block has, in order, the text fields Name, Email, Company, Position, LinkedIn and Instagram, and an
  // About editor; the labels aren't linked to the fields, so they're found by position (see TEST-IDS.md).
  async apply(speakers: CfpSpeaker[], session: { title: string; description: string }): Promise<Response> {
    await this.submit.click();
    await expect(this.page).toHaveURL(/\/form\/speaker$/);
    for (let n = 2; n <= speakers.length; n++) await this.page.getByRole('button', { name: `Add Speaker ${n}` }).first().click();
    const fields = this.page.locator('input[type="text"]:visible');
    const abouts = this.page.locator('[contenteditable="true"]:visible');
    for (const [i, speaker] of speakers.entries()) {
      const [name, email, company, position] = [0, 1, 2, 3].map((k) => fields.nth(i * 6 + k));
      await name.fill(speaker.name);
      await email.fill(speaker.email);
      await company.fill(speaker.company);
      await position.fill(speaker.position);
      await abouts.nth(i).click();
      await this.page.keyboard.type(speaker.about);
    }
    await this.page.getByRole('button', { name: 'Next step' }).click();
    await expect(this.page).toHaveURL(/\/form\/session$/);
    await this.page.locator('input[type="text"]:visible').first().fill(session.title);
    await this.page.locator('[contenteditable="true"]:visible').first().click();
    await this.page.keyboard.type(session.description);
    const response = this.page.waitForResponse((r) => r.url().includes('/api/speaker/forms/submit'));
    await this.page.getByRole('button', { name: 'Finish and send' }).click();
    return response;
  }
}

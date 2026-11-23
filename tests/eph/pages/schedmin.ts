import { test, expect, Locator, Page } from '@playwright/test';

// The group ENG-2884 adds to Schedmin's "Set Sales Tax Stripe IDs" form, for currencies with no tax of their own: a
// tax rate ID and a merchant tax ID, the two inputs after this label. Their names come from the page (decision D3).
const VAT_GROUP_LABEL = /^Manual tax/;

// Schedmin (staff admin) for the eph event: admin.<env>.eph.sched.co, behind HTTP basic auth. The event page is
// /package-single.php?conf=<event id>, and its sales tax form saves every tax field at once, so the tests always save
// through the form (which shows the saved values) and never post only the fields they change.
export function schedminUrl(baseURL: string): string {
  return new URL(baseURL).origin.replace(/\/\/[^.]+\./, '//admin.');
}

export function requireSchedmin() {
  const ok = !!process.env.EPH_SCHEDMIN_USERNAME && !!process.env.EPH_SCHEDMIN_PASSWORD;
  test.skip(!ok, 'Needs the eph Schedmin login (HTTP basic auth): set EPH_SCHEDMIN_USERNAME and EPH_SCHEDMIN_PASSWORD in .env');
}

export class SalesTaxForm {
  readonly form: Locator;

  constructor(readonly page: Page, readonly confId: string) {
    this.form = page.locator('form[action="/conf/setpaymentsalestax.php"]');
  }

  field(name: string) {
    return this.form.locator(`input[name="${name}"]`);
  }

  async open() {
    await this.page.goto(`/package-single.php?conf=${this.confId}`);
    await expect(this.form, `Schedmin has no "Set Sales Tax Stripe IDs" form for ${this.confId}`).toBeVisible();
  }

  // The names of the ENG-2884 rate and merchant tax ID inputs. Skips while the environment runs a build without
  // ENG-2884 (the form has no "Manual tax" group).
  async vatFields(): Promise<{ rate: string; merchant: string }> {
    await this.open();
    const label = this.form.locator('label', { hasText: VAT_GROUP_LABEL });
    test.skip((await label.count()) === 0, 'ENG-2884 isn\'t on this eph: Schedmin\'s sales tax form has no "Manual tax" group');
    const inputs = label.locator('xpath=following-sibling::input[@type="text"]');
    return { rate: (await inputs.nth(0).getAttribute('name'))!, merchant: (await inputs.nth(1).getAttribute('name'))! };
  }

  // Every tax field on the form: saving rewrites all of them, so a test reads them all first and puts them back.
  async fieldNames(): Promise<string[]> {
    await this.open();
    return this.form.locator('input[type="text"]').evaluateAll((inputs) => inputs.map((i) => (i as HTMLInputElement).name));
  }

  async values(names: string[]): Promise<Record<string, string>> {
    await this.open();
    const values: Record<string, string> = {};
    for (const name of names) values[name] = await this.field(name).inputValue();
    return values;
  }

  // Fills the given fields, leaves the others as saved, and saves. Returns Schedmin's answer ({ result, message }).
  async save(values: Record<string, string>): Promise<{ result: string; message?: string }> {
    await this.open();
    for (const [name, value] of Object.entries(values)) await this.field(name).fill(value);
    // The form asks "Change sales tax settings for <event>?" and then opens the JSON answer as a page.
    this.page.once('dialog', (dialog) => dialog.accept());
    const answer = this.page.waitForResponse((r) => r.url().includes('/conf/setpaymentsalestax.php') && r.request().method() === 'POST');
    await this.form.locator('input[type="submit"]').click();
    const text = await (await answer).text();
    return JSON.parse(text.slice(text.search(/\{\s*"/)));
  }
}

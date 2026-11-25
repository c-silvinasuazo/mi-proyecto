import { expect, Page } from '@playwright/test';

// The event site's ticket picker ("Reserve Tickets") and the Stripe Checkout page it sends the buyer to. The tests read
// the Stripe page and stop there, without paying: it already shows every line and the tax, and an unpaid session
// expires on its own.
export class TicketCheckout {
  constructor(readonly page: Page) {}

  // Opens the picker. On eph the payment webhook isn't set up, so the buyer's last order stays "in progress" and the
  // picker first shows "Incomplete Order": going back to the event and opening it again shows the tickets. Right after
  // an unpaid checkout the event page itself opens on that modal, which first waits a while for the payment before it
  // offers "Back to event". A click on Reserve Tickets before the page's scripts are ready does nothing, so a picker that
  // doesn't open is tried again too.
  async open() {
    await this.page.goto('/');
    const reserve = this.page.getByRole('button', { name: 'Reserve Tickets' }).first();
    const back = this.page.getByRole('button', { name: 'Back to event' });
    const pending = this.page.locator('#pending-fulfillment-modal');
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await pending.isVisible()) await pending.getByRole('button', { name: 'Back to event' }).click({ timeout: 60_000 });
      else if (await back.isVisible()) await back.click();
      await reserve.click();
      const shown = await Promise.race([
        this.page.locator('.ticket').first().waitFor({ timeout: 10_000 }).then(() => 'tickets'),
        back.waitFor({ timeout: 10_000 }).then(() => 'incomplete'),
      ]).catch(() => 'nothing');
      if (shown === 'tickets') return;
    }
    throw new Error('The ticket picker did not open, or kept showing "Incomplete Order"');
  }

  async add(ticket: string, quantity = 1) {
    const row = this.page.locator('.ticket').filter({ has: this.page.locator('.ticket__title', { hasText: ticket }) });
    for (let i = 0; i < quantity; i++) await row.locator('.increment-button').click();
    await expect(this.page.locator('.sc-summary__ticket', { hasText: ticket })).toBeVisible();
  }

  // The note under the cart's total ("VAT will be added to the total at checkout.", or nothing).
  get note() {
    return this.page.locator('.sc-summary__note');
  }

  // Places the order and reads the Stripe Checkout summary: each label's amount in the event's currency (Subtotal,
  // Fee, the tax line such as "VAT (8.1%)", Total due, and the tickets). With no tax Stripe shows no Subtotal or
  // Total due lines, only the big total. The page is in English because the test browser is.
  async stripeSummary(): Promise<Record<string, number>> {
    await this.page.getByRole('button', { name: 'Place Order' }).click();
    await this.page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
    await this.page.getByText('Sched service fee').or(this.page.locator('text=/^QA (Full|Day) Pass$/')).first().waitFor({ timeout: 30_000 });
    // The summary's lines come in one by one; the footer comes after them.
    await this.page.getByText('Powered by').first().waitFor();
    const lines = (await this.page.locator('body').innerText()).split('\n').map((line) => line.trim()).filter(Boolean);
    const amounts: Record<string, number> = {};
    for (let i = 0; i < lines.length; i++) {
      const amount = lines[i].match(/^(?:CHF\s?|€|£|NZ\$|A\$|CA\$|\$)([\d,]+\.\d{2})$/);
      if (!amount) continue;
      // The fee has a subtitle ("Sched service fee") between its label and amount.
      const label = lines[i - 1] === 'Sched service fee' ? lines[i - 2] : lines[i - 1];
      if (!(label in amounts)) amounts[label] = Number(amount[1].replace(/,/g, ''));
    }
    return amounts;
  }
}

// The tax line of a Stripe summary ("VAT (8.1%)") and its percentage, or undefined when the order isn't taxed.
export function taxLine(summary: Record<string, number>): { label: string; percent: number } | undefined {
  for (const label of Object.keys(summary)) {
    const percent = label.match(/\((\d+(?:\.\d+)?)%\)$/);
    if (percent) return { label, percent: Number(percent[1]) };
  }
  return undefined;
}

// The payments setting "Event planner absorbs the ticket processing fee". Returns the value it had.
export async function setFeeAbsorbed(page: Page, absorbed: boolean): Promise<boolean> {
  await page.goto('/editor/registration/payments');
  const box = page.locator('input[name="fee[absorb_fee]"]');
  const before = await box.isChecked();
  if (before !== absorbed) {
    await box.evaluate((el) => (el as HTMLInputElement).click());
    const saved = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/editor/registration/payments'));
    await page.locator('#feesettings button[type="submit"]').click();
    await saved;
    await page.goto('/editor/registration/payments');
    await expect(box, 'The fee setting did not save').toBeChecked({ checked: absorbed });
  }
  return before;
}

// The payments setting "Ticket fee currency" (the event's currency), as a code such as "chf". Returns the code it had.
// The field is a selectize dropdown: the native select only holds the chosen option, so the new one is picked from
// the dropdown's list ("Swiss Franc (CHF)").
export async function setCurrency(page: Page, code: string): Promise<string> {
  await page.goto('/editor/registration/payments');
  const select = page.locator('select[name="fee[currency]"]');
  const before = await select.inputValue();
  if (before !== code) {
    await select.locator('xpath=following-sibling::div[contains(@class,"selectize-control")]').locator('.selectize-input').click();
    await page.locator('.selectize-dropdown:visible .option', { hasText: `(${code.toUpperCase()})` }).click();
    const saved = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/editor/registration/payments'));
    await page.locator('#feesettings button[name="savefee"]').click();
    await saved;
    await page.goto('/editor/registration/payments');
    await expect(select, 'The currency did not save').toHaveValue(code);
  }
  return before;
}

import { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { paymentsEvent, requireTicketPayments, stepsNotRecordedYet } from './preconditions';
import { TicketCheckout } from './pages/ticket-checkout';
import { runId } from '../helpers';

// F4 ticket payments, on eph's payments event (EPH_PAYMENTS_URL, with Stripe connected in test mode). Each case skips
// with what the event is missing, then fails with "steps not recorded yet" so it gets recorded (see README: Recording
// a flow). Payments are always tested on eph, never on dev2 or production.
test.use(paymentsEvent);

// The payments event's tickets (see tests/eph/preconditions.ts, paymentsEvent).
const FULL_PASS = 'QA Full Pass';
const DAY_PASS = 'QA Day Pass';

// The coupon editor (Registration -> Coupons). The ticket list is a selectize dropdown: the tickets are picked from it,
// and read back from the native select it keeps in sync.
class Coupons {
  constructor(readonly page: Page) {}

  row(name: string) {
    return this.page.locator('#ticketlist tr').filter({ has: this.page.locator('td.couponname', { hasText: name }) });
  }

  // The edit panel's form, opened from the coupon's row.
  async edit(name: string) {
    await this.page.goto('/editor/registration/coupons');
    await this.row(name).locator('td.couponname a').click();
    return this.page.locator('form:visible').filter({ has: this.page.locator('[name=what][value=updateCoupon], [name=what][value=putCoupon]') }).last();
  }

  // The tickets the coupon applies to, as its edit panel lists them.
  async tickets(name: string) {
    const form = await this.edit(name);
    await expect(form.locator('[name=name]'), 'The coupon\'s edit panel did not load').toHaveValue(name);
    return form.locator('[name=ticketIDs]').evaluate((select) => [...(select as HTMLSelectElement).selectedOptions].map((option) => option.textContent!.trim()));
  }

  // Saves the open form and waits for the editor's answer.
  async save(form: ReturnType<Page['locator']>) {
    const saved = this.page.waitForResponse((r) => r.request().method() === 'POST' && /what=(put|update)Coupon/.test(r.request().postData() ?? ''));
    await form.locator('button[type=submit]:visible').first().click();
    expect((await saved).ok(), 'The coupon did not save').toBe(true);
  }

  async create(name: string, code: string, percent: number, tickets: string[]) {
    await this.page.goto('/editor/registration/coupons');
    await this.page.locator('button:visible', { hasText: /Add (New|Coupon)/ }).first().click();
    const form = this.page.locator('form#couponadd');
    await form.locator('[name=name]').fill(name);
    await form.locator('[name=code]').fill(code);
    await form.locator('[name=amount]').fill(String(percent));
    for (const ticket of tickets) {
      await form.locator('.selectize-control.multi .selectize-input').click();
      await this.page.locator('.selectize-dropdown:visible .option', { hasText: ticket }).click();
    }
    await this.save(form);
  }

  // Deletes the coupon, the way its Delete Coupon menu item does.
  async remove(name: string) {
    await this.page.goto('/editor/registration/coupons');
    const id = await this.row(name).locator('td.couponname a').getAttribute('rev').catch(() => null);
    if (id) await this.page.request.post('/editor/registration/coupons?dashpost=y', { form: { what: 'delete', data: id } });
  }
}

// Sets a ticket's description (its message on the ticket picker) in the editor's ticket panel.
async function setDescription(page: Page, ticket: string, text: string) {
  await page.goto('/editor/registration/tickets');
  await page.locator('#ticketlist td.ticketname a', { hasText: ticket }).click();
  await page.locator('textarea[name=description]:visible').first().fill(text);
  const saved = page.waitForResponse((r) => r.request().method() === 'POST' && (r.request().postData() ?? '').startsWith('what=putTicket'));
  await page.getByRole('button', { name: 'Save Ticket' }).locator('visible=true').first().click();
  expect((await saved).ok(), 'The ticket did not save').toBe(true);
}

// Sets a ticket's sales start, days from today at 9:00 (or none), in the editor's ticket panel, and returns the
// ticket's status in the ticket list ("On Sale", "Not On Sale").
async function setSalesStart(page: Page, ticket: string, daysFromToday: number | null) {
  await page.goto('/editor/registration/tickets');
  await page.locator('#ticketlist td.ticketname a', { hasText: ticket }).click();
  const date = page.locator('[name=salesStartDate]:visible').first();
  const time = page.locator('[name=salesStartTime]:visible').first();
  // A jQuery UI datepicker: setting the date through it keeps its format (yy-mm-dd).
  await date.evaluate((input, days) => (window as any).jQuery(input).datepicker('setDate', days), daysFromToday);
  await time.fill(daysFromToday === null ? '' : '9:00am');
  const saved = page.waitForResponse((r) => r.request().method() === 'POST' && (r.request().postData() ?? '').startsWith('what=putTicket'));
  await page.getByRole('button', { name: 'Save Ticket' }).locator('visible=true').first().click();
  await saved;
  await page.goto('/editor/registration/tickets');
  return page.locator('#ticketlist tr').filter({ has: page.locator('td.ticketname', { hasText: ticket }) }).locator('td.ticketstatus .label').innerText();
}

// An amount as the pages write it ("CHF 100.00", "100,00 CHF", "€1,234.56"): its currency code, if written, and the
// number. The decimal separator is whichever of "." or "," comes before the last two digits.
function money(text: string): { code?: string; amount: number } {
  const number = text.match(/\d[\d.,]*\d/)?.[0] ?? '';
  const decimal = /[.,]\d{2}$/.test(number) ? number.at(-3) : undefined;
  const digits = number.replace(decimal === ',' ? /\./g : /,/g, '').replace(',', '.');
  return { code: text.match(/\b[A-Z]{3}\b/)?.[0], amount: Number(digits) };
}

test.describe('F4 ticket payments (needs the eph payments event)', () => {
  // REG-001 / TC-F4-01
  test('REG-001 / TC-F4-01: buying a paid ticket completes; email names the ticket', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-002 / REG-003 / TC-F4-02
  test('REG-002 / REG-003 / TC-F4-02: Manage Tickets opens; a guest can transfer a ticket', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-017 / TC-F4-08 / ENG-2281
  test('REG-017 / TC-F4-08 / ENG-2281: guest checkout gives no access to an email\'s tickets before payment', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-09
  test('TC-F4-09: Manage Tickets link type depends on the buyer\'s email (token or login)', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-004 (ENG-100): a sales start in the future is saved, the ticket shows "Not On Sale" in the editor and isn't
  // offered on the public site; with no start date it's on sale again. Sold out (TC-F4-05, ENG-589) needs a completed
  // purchase, which needs the payment webhook eph doesn't have (ENG-2832): still to record.
  test('REG-004: ticket sales dates are saved and respected (TC-F4-05 sold out still to record)', async ({ page }) => {
    await requireTicketPayments(page);
    const checkout = new TicketCheckout(page);
    try {
      expect(await setSalesStart(page, DAY_PASS, 1), 'A ticket whose sales start tomorrow should be "Not On Sale"').toBe('Not On Sale');
      await page.goto('/editor/registration/tickets');
      await page.locator('#ticketlist td.ticketname a', { hasText: DAY_PASS }).click();
      await expect(page.locator('[name=salesStartDate]:visible').first(), 'The sales start date should be saved').not.toHaveValue('');
      await checkout.open();
      await expect(page.locator('.ticket__title', { hasText: FULL_PASS }), 'The ticket on sale should still be offered').toBeVisible();
      await expect(page.locator('.ticket__title', { hasText: DAY_PASS }), 'A ticket not on sale yet should not be offered').toHaveCount(0);
    } finally {
      expect(await setSalesStart(page, DAY_PASS, null), 'With no sales start the ticket should be on sale again').toBe('On Sale');
    }
  });

  // REG-005 (ENG-1005, ENG-1420): a four-line ticket message (the editor allows 255 characters) shows in full under
  // Reserve Tickets: not cut off, and not covering the Place Order button. The ticket's message is empty again after.
  test('REG-005: long ticket messages show in full', async ({ page }) => {
    await requireTicketPayments(page);
    const message = [
      'Line one of the QA ticket message.',
      'Line two, a bit longer, to see the text wrap inside the ticket card.',
      'Line three: sessions, workshops and the evening party are included.',
      'Line four ends here: END-OF-MESSAGE',
    ].join('\n');
    try {
      await setDescription(page, DAY_PASS, message);
      await new TicketCheckout(page).open();
      // The picker shows the lines as one paragraph.
      const shown = page.locator('.ticket').filter({ has: page.locator('.ticket__title', { hasText: DAY_PASS }) }).getByText(/^Line one[\s\S]*END-OF-MESSAGE$/);
      await expect(shown, 'The whole message should show on the ticket').toBeVisible();
      expect(await shown.evaluate((e) => e.scrollHeight <= e.clientHeight + 1), 'The message should not be cut off').toBe(true);
      const [text, button] = [await shown.boundingBox(), await page.getByRole('button', { name: 'Place Order' }).boundingBox()];
      expect(text!.y + text!.height <= button!.y || text!.y >= button!.y + button!.height, 'The message should not cover Place Order').toBe(true);
    } finally {
      await setDescription(page, DAY_PASS, '');
    }
  });

  // REG-006 / TC-F4-06
  test('REG-006 / TC-F4-06: an invoice buyer shows under Guest Buyers with the ticket', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-202 / TC-F4-03 (ENG-266): a 20% coupon for the Full Pass only keeps that ticket after its end date is edited,
  // and in the ticket picker it takes 20% off the Full Pass and nothing off the Day Pass. Paying with it stays manual.
  test('REG-202 / TC-F4-03: editing a coupon keeps its tickets; discount is right', async ({ page }) => {
    test.slow();
    await requireTicketPayments(page);
    const coupons = new Coupons(page);
    const name = `QA coupon ${runId()}`;
    const code = `QA${runId()}`;
    try {
      await coupons.create(name, code, 20, [FULL_PASS]);
      expect(await coupons.tickets(name), 'The new coupon should apply to the Full Pass only').toEqual([FULL_PASS]);

      const form = await coupons.edit(name);
      // A jQuery UI datepicker (yy-mm-dd): a month from today.
      await form.locator('[name=couponEndDate]').evaluate((input) => (window as any).jQuery(input).datepicker('setDate', '+1m'));
      await form.locator('[name=couponEndTime]').fill('9:00pm');
      await coupons.save(form);
      const edited = await coupons.edit(name);
      await expect(edited.locator('[name=couponEndDate]'), 'The new end date should be saved').not.toHaveValue('');
      expect(await coupons.tickets(name), 'Editing the coupon should keep its ticket (ENG-266)').toEqual([FULL_PASS]);
      await page.goto('/editor/registration/tickets');
      const price = money(await page.locator('#ticketlist tr').filter({ has: page.locator('td.ticketname', { hasText: FULL_PASS }) }).locator('td.ticketprice h2').innerText());

      // In the ticket picker the code reprices the tickets it applies to (and empties the cart, so it goes in first).
      const checkout = new TicketCheckout(page);
      await checkout.open();
      const listed = (ticket: string) => page.locator('.ticket').filter({ has: page.locator('.ticket__title', { hasText: ticket }) });
      const before = { full: money(await listed(FULL_PASS).locator('.ticket__price').first().innerText()).amount, day: money(await listed(DAY_PASS).locator('.ticket__price').first().innerText()).amount };
      await page.getByPlaceholder('ENTER CODE').fill(code);
      await page.getByRole('button', { name: 'Apply' }).click();
      await expect(page.getByText(`${code} applied.`), 'The picker should confirm the code').toBeVisible();
      const fullFee = money(await listed(FULL_PASS).locator('.ticket__fee').innerText()).amount;
      // The repriced ticket shows the new price first, then the old one struck through.
      const fullAfter = money(await listed(FULL_PASS).locator('.ticket__price').first().innerText()).amount;
      expect(fullAfter - fullFee, 'The Full Pass should cost 20% less before the fee').toBeCloseTo(price.amount * 0.8, 2);
      expect(fullAfter, 'The Full Pass price with fee should go down').toBeLessThan(before.full);
      await expect(listed(DAY_PASS).locator('.ticket__price').first(), 'The Day Pass is not in the coupon: its price stays').toHaveText(new RegExp(before.day.toFixed(2).replace('.', '[.,]')));

      await checkout.add(FULL_PASS);
      await checkout.add(DAY_PASS);
      const cart = page.locator('.sc-summary');
      const total = money(await cart.locator('.sc-summary__total-price').innerText()).amount;
      expect(total, 'The cart total should be the discounted Full Pass plus the Day Pass').toBeCloseTo(fullAfter + before.day, 2);
    } finally {
      await coupons.remove(name);
    }
  });

  // REG-204 / SCH-16 / TC-F4-04: the ticket's price, fee and currency are the same in the editor's ticket list, the
  // ticket picker, the cart and the Stripe payment page. The order email stays manual (no email on eph).
  test('REG-204 / SCH-16 / TC-F4-04: price and currency match in the editor, checkout and Stripe', async ({ page }) => {
    await requireTicketPayments(page);
    await page.goto('/editor/registration/payments');
    const code = (await page.locator('select[name="fee[currency]"]').inputValue()).toUpperCase();

    await page.goto('/editor/registration/tickets');
    const prices = page.locator('#ticketlist tr').filter({ has: page.locator('td.ticketname', { hasText: FULL_PASS }) }).locator('td.ticketprice');
    const price = money(await prices.locator('h2').innerText());
    const withFee = money(await prices.locator('span').innerText());
    expect(price.code, 'The editor should show the ticket in the event\'s currency').toBe(code);
    expect(withFee.code, 'The editor\'s "Price + Fee" should be in the event\'s currency').toBe(code);
    const fee = Math.round((withFee.amount - price.amount) * 100) / 100;

    const checkout = new TicketCheckout(page);
    await checkout.open();
    const ticket = page.locator('.ticket').filter({ has: page.locator('.ticket__title', { hasText: FULL_PASS }) });
    const listed = money(await ticket.locator('.ticket__price').innerText());
    expect(listed, 'The ticket picker should show the editor\'s "Price + Fee"').toEqual(withFee);
    expect(money(await ticket.locator('.ticket__fee').innerText()), 'The ticket picker should show the same fee').toEqual({ code, amount: fee });

    await checkout.add(FULL_PASS);
    const cart = page.locator('.sc-summary');
    expect(money(await cart.locator('.sc-summary__ticket-price').innerText()), 'The cart should show the editor\'s price').toEqual(price);
    expect(money(await cart.locator('.sc-summary__fees-price').innerText()), 'The cart should show the same fee').toEqual({ code, amount: fee });
    expect(money(await cart.locator('.sc-summary__total-price').innerText()), 'The cart total should be price plus fee').toEqual(withFee);

    const stripe = await checkout.stripeSummary();
    expect(stripe[FULL_PASS], 'Stripe should charge the editor\'s price for the ticket').toBe(price.amount);
    expect(stripe.Fee, 'Stripe should charge the same fee').toBe(fee);
    await expect(page.getByText(`${code} ${price.amount.toFixed(2)}`).first(), `Stripe should charge in ${code}`).toBeVisible();
  });

  // REG-203 / REG-205
  test('REG-203 / REG-205: deleted tickets are hidden; the purchased ticket appears in the profile', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-07
  test('TC-F4-07: a declined test card shows a clear error and creates no order', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });
});

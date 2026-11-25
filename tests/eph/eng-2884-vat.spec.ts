import { BrowserContextOptions, Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { runId } from '../helpers';
import { paymentsEvent, requireTicketPayments, stepsNotRecordedYet } from './preconditions';
import { SalesTaxForm, requireSchedmin, schedminUrl } from './pages/schedmin';
import { TicketCheckout, setCurrency, setFeeAbsorbed, taxLine } from './pages/ticket-checkout';

// The payments event's paid tickets (CHF 100 and CHF 50) and its VAT rate: the Swiss case, 8.1% exclusive, set up on
// the master eph on 2026-11-25 (ENG-2884 applies to every currency without a tax of its own; the Munich case, 19% on
// EUR, was checked by hand on pr-1906). The rate is the one saved in Schedmin for the event.
const FULL_PASS = 'QA Full Pass';
const DAY_PASS = 'QA Day Pass';
const VAT_PERCENT = 8.1;
const TOTAL = 'Total due';

// The tax line shows the event's rate, its amount is that rate of the subtotal, and the total is subtotal plus tax,
// each within a cent. Returns the tax amount.
function expectVat(summary: Record<string, number>): number {
  const tax = taxLine(summary);
  expect(tax, 'Stripe should show the VAT as its own line').toBeDefined();
  expect(tax!.percent, `The VAT line should show the event's rate (${VAT_PERCENT}%)`).toBe(VAT_PERCENT);
  const vat = summary[tax!.label];
  expect(Math.abs(vat - (summary.Subtotal * VAT_PERCENT) / 100), `VAT should be ${VAT_PERCENT}% of ${summary.Subtotal}`).toBeLessThanOrEqual(0.01);
  expect(Math.abs(summary[TOTAL] - (summary.Subtotal + vat)), 'The total should be subtotal plus VAT').toBeLessThanOrEqual(0.01);
  return vat;
}

// Schedmin's sales tax form for the event at baseURL, in a page of its own (HTTP basic auth, no event session).
async function openSalesTaxForm(newPage: (options?: BrowserContextOptions) => Promise<Page>, baseURL: string) {
  requireSchedmin();
  const page = await newPage({
    baseURL: schedminUrl(baseURL),
    httpCredentials: { username: process.env.EPH_SCHEDMIN_USERNAME!, password: process.env.EPH_SCHEDMIN_PASSWORD! },
    storageState: { cookies: [], origins: [] },
  });
  return new SalesTaxForm(page, new URL(baseURL).hostname.split('.')[0]);
}

// ENG-2884: VAT for events whose currency has no tax of its own (German VAT on EUR events, Munich), set per event in
// Schedmin with a Stripe tax rate ID (txr_…) and the organizer's merchant tax ID (txi_…). Cases TC-F4-12 to TC-F4-24.
// The Schedmin cases run once the PR is on eph and the Schedmin login is set; the checkout cases run on the payments
// event (EPH_PAYMENTS_URL), like the rest of F4, and fail with "steps not recorded yet" once it can sell tickets.

test.describe('ENG-2884 Schedmin VAT IDs', () => {
  // The payments event's eph: the one running ENG-2884, and the event whose IDs the checkout cases use.
  test.use(paymentsEvent);
  let taxForm: SalesTaxForm;
  // The new group's input names, and every tax field with its value before the test (put back after).
  let rate: string;
  let merchant: string;
  let fields: string[];
  let before: Record<string, string> | undefined;

  test.beforeEach(async ({ newPage, baseURL }) => {
    taxForm = await openSalesTaxForm(newPage, baseURL!);
    ({ rate, merchant } = await taxForm.vatFields());
    fields = await taxForm.fieldNames();
    before = await taxForm.values(fields);
  });

  test.afterEach(async () => {
    // The eph event is shared: leave its taxes as they were, even if the test failed.
    if (before) expect((await taxForm.save(before)).result, 'Could not put the sales tax IDs back').toBe('OK');
    before = undefined;
  });

  // TC-F4-12: staff save and clear both IDs; the other taxes' IDs don't change.
  test('TC-F4-12 / ENG-2884: Schedmin saves and clears the VAT rate and merchant tax IDs', async () => {
    const ids = { [rate]: `txr_QA${runId()}`, [merchant]: `txi_QA${runId()}` };
    expect(await taxForm.save(ids), 'Saving the VAT IDs failed').toMatchObject({ result: 'OK' });
    const saved = await taxForm.values(fields);
    expect(saved, 'The VAT IDs were not saved').toMatchObject(ids);
    const others = fields.filter((name) => !(name in ids));
    for (const name of others) expect(saved[name], `Saving the VAT IDs changed ${name}`).toBe(before![name]);

    expect(await taxForm.save({ [rate]: '', [merchant]: '' }), 'Clearing the VAT IDs failed').toMatchObject({ result: 'OK' });
    expect(await taxForm.values([rate, merchant]), 'The VAT IDs were not cleared').toEqual({ [rate]: '', [merchant]: '' });
  });

  // TC-F4-21 (pending decision D7): a rate ID must start with txr_ and a merchant tax ID with txi_. Swapping them is
  // the likely support mistake. If D7 decides against the check, remove this test.
  test('TC-F4-21 / ENG-2884: Schedmin rejects a rate ID without txr_ and a tax ID without txi_, and says why', async () => {
    const cases = [
      { field: rate, value: `txi_QA${runId()}`, prefix: 'txr_' },
      { field: merchant, value: `txr_QA${runId()}`, prefix: 'txi_' },
    ];
    for (const { field, value, prefix } of cases) {
      const answer = await taxForm.save({ [field]: value });
      expect(answer.result, `Schedmin saved "${value}" in ${field}`).not.toBe('OK');
      expect(answer.message ?? '', `The error for ${field} should say it must start with ${prefix}`).toContain(prefix);
      expect((await taxForm.values([field]))[field], `The rejected value was saved in ${field}`).toBe(before![field]);
    }
  });
});

// The checkout cases. Each one's steps are in cases/flows/F4-ticket-payments/TC-F4-<n>-*.md.
test.describe('ENG-2884 VAT at checkout (needs the eph payments event)', () => {
  test.use(paymentsEvent);

  // TC-F4-13 (M4, M5): with both IDs the order is taxed; with only the rate ID there's no notice and no VAT. The
  // currency half (CAD, GBP, AUD or USD with both IDs) needs a second event and is still manual.
  test('TC-F4-13 / ENG-2884: VAT applies only with both IDs and a currency other than CAD, GBP, AUD or USD', async ({ page, newPage, baseURL }) => {
    // Two Stripe checkouts and two Schedmin saves: on eph that takes longer than one test's time.
    test.slow();
    await requireTicketPayments(page);
    const taxForm = await openSalesTaxForm(newPage, baseURL!);
    const { rate, merchant } = await taxForm.vatFields();
    const saved = await taxForm.values([rate, merchant]);
    test.skip(!saved[rate] || !saved[merchant], 'The payments event needs both VAT IDs saved in Schedmin (see TC-F4-15 notes)');

    const checkout = new TicketCheckout(page);
    await checkout.open();
    await checkout.add(FULL_PASS);
    const taxed = await checkout.stripeSummary();
    const vat = expectVat(taxed);

    try {
      expect((await taxForm.save({ [merchant]: '' })).result, 'Could not clear the merchant tax ID').toBe('OK');
      await checkout.open();
      await checkout.add(FULL_PASS);
      await expect(checkout.note, 'With only the rate ID the cart should not mention VAT').not.toContainText(/VAT|Tax will be added/);
      const untaxed = await checkout.stripeSummary();
      expect(taxLine(untaxed), 'With only the rate ID Stripe should show no VAT').toBeUndefined();
      // Untaxed, Stripe shows only the ticket and fee lines: their sum is what was taxed before.
      expect(untaxed[FULL_PASS] + untaxed.Fee, 'With only the rate ID the order should cost the subtotal').toBeCloseTo(taxed[TOTAL] - vat, 2);
    } finally {
      expect((await taxForm.save({ [merchant]: saved[merchant] })).result, 'Could not put the merchant tax ID back').toBe('OK');
    }
  });

  // TC-F4-14: CHF says "VAT" (EUR was checked by hand on pr-1906); NZD, another currency without a tax of its own, says
  // "Tax" and is charged the same rate. Leaves the currency as it was.
  test('TC-F4-14 / ENG-2884: the ticket picker says "VAT will be added" for EUR/CHF and "Tax will be added" otherwise', async ({ page }) => {
    test.slow();
    await requireTicketPayments(page);
    const checkout = new TicketCheckout(page);
    await checkout.open();
    await checkout.add(FULL_PASS);
    await expect(checkout.note, 'The cart of a CHF event with both VAT IDs should say VAT will be added').toContainText('VAT will be added to the total at checkout.');

    const before = await setCurrency(page, 'nzd');
    try {
      await checkout.open();
      await checkout.add(FULL_PASS);
      await expect(checkout.note, 'The cart of an NZD event with both IDs should say Tax will be added').toContainText('Tax will be added to the total at checkout.');
      expectVat(await checkout.stripeSummary());
    } finally {
      await setCurrency(page, before);
    }
  });

  // TC-F4-15 (M1, M2), on the Stripe payment page without paying. Paying with 4242 and the receipt (checked by hand on
  // 2026-11-24 for EUR and 2026-11-25 for CHF: same lines) and the human look at the hosted page stay manual.
  test('TC-F4-15 / ENG-2884: card checkout shows the event\'s VAT as its own line; total is net plus VAT within 1 cent', async ({ page }) => {
    await requireTicketPayments(page);
    const checkout = new TicketCheckout(page);
    await checkout.open();
    await checkout.add(FULL_PASS);
    const summary = await checkout.stripeSummary();
    expectVat(summary);
  });

  // TC-F4-16: a passed-on fee is taxed with the tickets; with the fee absorbed there's no fee line and only the tickets
  // are taxed. Leaves the fee setting as it was.
  test('TC-F4-16 / ENG-2884: with the fee absorbed only tickets are taxed; a passed-on fee is taxed too', async ({ page }) => {
    // Two Stripe checkouts and three saves of the payments settings: on eph that takes longer than one test's time.
    test.slow();
    await requireTicketPayments(page);
    const checkout = new TicketCheckout(page);
    const before = await setFeeAbsorbed(page, false);
    try {
      await checkout.open();
      await checkout.add(FULL_PASS);
      const passedOn = await checkout.stripeSummary();
      expect(passedOn.Fee, 'With the fee passed on, Stripe should show a fee line').toBeGreaterThan(0);
      expect(passedOn.Subtotal, 'The fee should be part of the taxed subtotal').toBeCloseTo(passedOn[FULL_PASS] + passedOn.Fee, 2);
      expectVat(passedOn);

      await setFeeAbsorbed(page, true);
      await checkout.open();
      await checkout.add(FULL_PASS);
      await checkout.add(DAY_PASS);
      const absorbed = await checkout.stripeSummary();
      expect(absorbed.Fee, 'With the fee absorbed, Stripe should show no fee line').toBeUndefined();
      expect(absorbed.Subtotal, 'With the fee absorbed, only the tickets should be taxed').toBeCloseTo(absorbed[FULL_PASS] + absorbed[DAY_PASS], 2);
      expectVat(absorbed);
    } finally {
      await setFeeAbsorbed(page, before);
    }
  });

  // TC-F4-17 (M8): with the new IDs saved, an event in each of the four currencies that have a tax of their own ignores
  // them. The event has none of those taxes set up, so its own tax is none: no notice and no tax line. Leaves the
  // currency as it was.
  test('TC-F4-17 / ENG-2884: CAD/GBP/AUD/USD events with the new IDs filled charge only their own tax', async ({ page }) => {
    test.slow();
    await requireTicketPayments(page);
    const checkout = new TicketCheckout(page);
    const before = await setCurrency(page, 'cad');
    try {
      for (const code of ['cad', 'gbp', 'aud', 'usd']) {
        await setCurrency(page, code);
        await checkout.open();
        await checkout.add(FULL_PASS);
        await expect(checkout.note, `The cart of a ${code.toUpperCase()} event should not mention VAT or tax`).not.toContainText(/VAT|Tax will be added/);
        expect(taxLine(await checkout.stripeSummary()), `A ${code.toUpperCase()} event should not get the new rate`).toBeUndefined();
      }
    } finally {
      await setCurrency(page, before);
    }
  });

  // TC-F4-18
  test('TC-F4-18 / ENG-2884: two events with different rates each charge their own rate', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-19
  test('TC-F4-19 / ENG-2884: orders created before the IDs were saved keep their amount', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-20 (M14)
  test('TC-F4-20 / ENG-2884: CA GST, UK VAT, AU GST and US state tax behave as before', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-23 (M11). The expected result isn't defined in the ticket yet.
  test('TC-F4-23 / ENG-2884: checkout with a wrong or archived rate ID doesn\'t charge a wrong amount', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-24: in the ticket's scope, without an acceptance criterion yet.
  test('TC-F4-24 / ENG-2884: an invoice shows the VAT line and the organizer\'s VAT number', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-22 (M10)
  // eslint-disable-next-line playwright/expect-expect -- listed so the report shows the case and why it's manual
  test('TC-F4-22 / ENG-2884: new PHP with the old payment binary shows the notice and charges no VAT', async () => {
    test.skip(true, 'Manual: needs eph deployed with the new PHP and the old payment binary (v2.9.1)');
  });
});

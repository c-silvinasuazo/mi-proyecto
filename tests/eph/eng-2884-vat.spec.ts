import { test, expect } from './fixtures';
import { runId } from '../helpers';
import { paymentsEvent, requireTicketPayments, stepsNotRecordedYet } from './preconditions';
import { SalesTaxForm, requireSchedmin, schedminUrl } from './pages/schedmin';

// ENG-2884: VAT for events whose currency has no tax of its own (German VAT on EUR events, Munich), set per event in
// Schedmin with a Stripe tax rate ID (txr_…) and the organizer's merchant tax ID (txi_…). Cases TC-F4-12 to TC-F4-24.
// The Schedmin cases run once the PR is on eph and the Schedmin login is set; the checkout cases run on the payments
// event (EPH_PAYMENTS_URL), like the rest of F4, and fail with "steps not recorded yet" once it can sell tickets.

test.describe('ENG-2884 Schedmin VAT IDs', () => {
  let taxForm: SalesTaxForm;
  // The new group's input names, and every tax field with its value before the test (put back after).
  let rate: string;
  let merchant: string;
  let fields: string[];
  let before: Record<string, string> | undefined;

  test.beforeEach(async ({ newPage, baseURL }) => {
    requireSchedmin();
    const page = await newPage({
      baseURL: schedminUrl(baseURL!),
      httpCredentials: { username: process.env.EPH_SCHEDMIN_USERNAME!, password: process.env.EPH_SCHEDMIN_PASSWORD! },
      storageState: { cookies: [], origins: [] },
    });
    taxForm = new SalesTaxForm(page, new URL(baseURL!).hostname.split('.')[0]);
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

  // TC-F4-13 (M4, M5)
  test('TC-F4-13 / ENG-2884: VAT applies only with both IDs and a currency other than CAD, GBP, AUD or USD', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-14
  test('TC-F4-14 / ENG-2884: the ticket picker says "VAT will be added" for EUR/CHF and "Tax will be added" otherwise', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-15 (M1, M2). The human check of the hosted payment page stays manual.
  test('TC-F4-15 / ENG-2884: card checkout shows 19% VAT as its own line; total is net plus VAT within 1 cent', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-16
  test('TC-F4-16 / ENG-2884: with the fee absorbed only tickets are taxed; a passed-on fee is taxed too', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // TC-F4-17 (M8)
  test('TC-F4-17 / ENG-2884: CAD/GBP/AUD/USD events with the new IDs filled charge only their own tax', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
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

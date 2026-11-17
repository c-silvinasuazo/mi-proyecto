import { test } from './fixtures';
import { requireTicketPayments, stepsNotRecordedYet } from './preconditions';

// F4 ticket payments, on eph. They need registration with paid tickets and Stripe in test mode, which eph doesn't have
// yet (requested in ENG-2832): each case skips with that reason until it does, then fails with "steps not recorded yet"
// so it gets recorded (see README: Recording a flow). Payments are always tested on eph, never on dev2 or production.
test.describe('F4 ticket payments (needs Stripe test mode on eph)', () => {
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

  // REG-004 / TC-F4-05
  test('REG-004 / TC-F4-05: ticket sales dates are saved and respected; sold out only when true (ENG-589)', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-005
  test('REG-005: long ticket messages show in full', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-006 / TC-F4-06
  test('REG-006 / TC-F4-06: an invoice buyer shows under Guest Buyers with the ticket', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-202 / TC-F4-03
  test('REG-202 / TC-F4-03: editing a coupon keeps its tickets; discount is right', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
  });

  // REG-204 / SCH-16 / TC-F4-04
  test('REG-204 / SCH-16 / TC-F4-04: price and currency match in the editor, checkout and Stripe', async ({ page }) => {
    await requireTicketPayments(page);
    stepsNotRecordedYet();
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

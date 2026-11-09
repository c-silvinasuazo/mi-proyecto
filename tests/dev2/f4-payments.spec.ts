import { test } from '@playwright/test';
import { requireTarget } from '../helpers';

// F4 payments on dev2 (Stripe test mode; writes to the production database). Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F4 payments on dev2 (Stripe test mode; writes to the production database)', () => {
  test.beforeEach(() => requireTarget('DEV2_BASE_URL'));

  // REG-001 / TC-F4-01
  test.fixme('REG-001 / TC-F4-01: buying a paid ticket completes; email names the ticket', async () => {});
  // REG-002 / REG-003 / TC-F4-02
  test.fixme('REG-002 / REG-003 / TC-F4-02: Manage Tickets opens; a guest can transfer a ticket', async () => {});
  // REG-017 / TC-F4-08 / ENG-2281
  test.fixme('REG-017 / TC-F4-08 / ENG-2281: guest checkout gives no access to an email\'s tickets before payment', async () => {});
  // TC-F4-09
  test.fixme('TC-F4-09: Manage Tickets link type depends on the buyer\'s email (token or login)', async () => {});
  // REG-004 / TC-F4-05
  test.fixme('REG-004 / TC-F4-05: ticket sales dates are saved and respected; sold out only when true (ENG-589)', async () => {});
  // REG-005
  test.fixme('REG-005: long ticket messages show in full', async () => {});
  // REG-006 / TC-F4-06
  test.fixme('REG-006 / TC-F4-06: an invoice buyer shows under Guest Buyers with the ticket', async () => {});
  // REG-202 / TC-F4-03
  test.fixme('REG-202 / TC-F4-03: editing a coupon keeps its tickets; discount is right', async () => {});
  // REG-204 / SCH-16 / TC-F4-04
  test.fixme('REG-204 / SCH-16 / TC-F4-04: price and currency match in the editor, checkout and Stripe', async () => {});
  // REG-203 / REG-205
  test.fixme('REG-203 / REG-205: deleted tickets are hidden; the purchased ticket appears in the profile', async () => {});
  // TC-F4-07
  test.fixme('TC-F4-07: a declined test card shows a clear error and creates no order', async () => {});
});

import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// F6 registration (needs a paid plan). Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F6 registration (needs a paid plan)', () => {
  test.beforeEach(() => requireEph());

  // REG-101 / TC-F6-01
  test.fixme('REG-101 / TC-F6-01: registration form shows login and signup to logged-out users; required and conditional questions work', async () => {});
  // REG-206
  test.fixme('REG-206: custom form fields show, save and appear in the Registrants export', async () => {});
  // REG-207 / ENG-2169
  test.fixme('REG-207 / ENG-2169: a completed registrant is not counted as incomplete', async () => {});
  // REG-125 / TC-F6-04
  test.fixme('REG-125 / TC-F6-04: capacity: a session with no sign-ups is not full; the third attendee goes to the waitlist', async () => {});
  // TC-F6-05
  test.fixme('TC-F6-05: freeing a spot moves the first waitlisted attendee in', async () => {});
});

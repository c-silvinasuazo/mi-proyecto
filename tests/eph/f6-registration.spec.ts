import { test } from '@playwright/test';
import { requireEph } from '../helpers';
import { requireRegistration, stepsNotRecordedYet } from './preconditions';

// F6 registration (needs a paid plan). Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F6 registration (needs a paid plan)', () => {
  test.beforeEach(() => requireEph());

  // REG-101 / TC-F6-01
  test('REG-101 / TC-F6-01: registration form shows login and signup to logged-out users; required and conditional questions work', async ({ page }) => {
    await requireRegistration(page);
    stepsNotRecordedYet();
  });
  // REG-206
  test('REG-206: custom form fields show, save and appear in the Registrants export', async ({ page }) => {
    await requireRegistration(page);
    stepsNotRecordedYet();
  });
  // REG-207 / ENG-2169
  test('REG-207 / ENG-2169: a completed registrant is not counted as incomplete', async ({ page }) => {
    await requireRegistration(page);
    stepsNotRecordedYet();
  });
  // REG-125 / TC-F6-04
  test('REG-125 / TC-F6-04: capacity: a session with no sign-ups is not full; the third attendee goes to the waitlist', async ({ page }) => {
    await requireRegistration(page);
    stepsNotRecordedYet();
  });
  // TC-F6-05
  test('TC-F6-05: freeing a spot moves the first waitlisted attendee in', async ({ page }) => {
    await requireRegistration(page);
    stepsNotRecordedYet();
  });
});

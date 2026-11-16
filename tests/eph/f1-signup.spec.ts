import { test } from './fixtures';
import { requireSignupWithoutCaptcha, stepsNotRecordedYet } from './preconditions';

// F1 signup. /signup on eph has a captcha that keeps "Continue" disabled until it's solved (even for a valid email),
// so every case here needs it. They skip (with that reason) until eph uses test captcha keys or turns the captcha off;
// the tests never try to get past it.
test.describe('F1 signup', () => {
  // REG-012 / TC-F1-01 (blocked by the captcha)
  test('REG-012 / TC-F1-01: planner signup creates a valid username, profile link and event', async ({ browser, baseURL }) => {
    await requireSignupWithoutCaptcha(browser, baseURL!);
    stepsNotRecordedYet();
  });
  // REG-013 / TC-F1-02 (blocked by the captcha)
  test('REG-013 / TC-F1-02: signup detects the user type (attending lands on /directory, no event)', async ({ browser, baseURL }) => {
    await requireSignupWithoutCaptcha(browser, baseURL!);
    stepsNotRecordedYet();
  });
  // TC-F1-04 / TC-F1-05 (blocked by the captcha)
  test('TC-F1-04 / TC-F1-05: invalid and existing emails are rejected with a clear message', async ({ browser, baseURL }) => {
    await requireSignupWithoutCaptcha(browser, baseURL!);
    stepsNotRecordedYet();
  });
});

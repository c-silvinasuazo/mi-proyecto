import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// F1 signup. Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F1 signup', () => {
  test.beforeEach(() => requireEph());

  // REG-012 / TC-F1-01
  test.fixme('REG-012 / TC-F1-01: planner signup creates a valid username, profile link and event', async () => {});
  // REG-013 / TC-F1-02
  test.fixme('REG-013 / TC-F1-02: signup detects the user type (attending lands on /directory, no event)', async () => {});
  // TC-F1-04 / TC-F1-05
  test.fixme('TC-F1-04 / TC-F1-05: invalid and existing emails are rejected with a clear message', async () => {});
});

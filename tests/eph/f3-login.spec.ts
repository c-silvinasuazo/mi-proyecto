import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// F3 login (write). Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F3 login (write)', () => {
  test.beforeEach(() => requireEph());

  // TC-F3-02
  test.fixme('TC-F3-02: password reset link sets a new password (email may not be delivered on eph)', async () => {});
  // TC-F3-08
  test.fixme('TC-F3-08: editor -> Dashboard -> back without logging in again; logout ends both', async () => {});
});

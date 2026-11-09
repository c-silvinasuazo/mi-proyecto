import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// F8 check-in, QR and badges. Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F8 check-in, QR and badges', () => {
  test.beforeEach(() => requireEph());

  // REG-113 / ENG-544 / ENG-545 / ENG-546
  test.fixme('REG-113 / ENG-544 / ENG-545 / ENG-546: QR export has only the selected published sessions, 3 per page', async () => {});
  // TC-F8-05
  test.fixme('TC-F8-05: /checkin records a session check-in', async () => {});
  // REG-117
  test.fixme('REG-117: badge background image and name format apply', async () => {});
  // ENG-241
  test.fixme('ENG-241: badge preview shows special characters in the event name (open bug: expected to fail until fixed)', async () => {});
});

import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// F2 events. Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F2 events', () => {
  test.beforeEach(() => requireEph());

  // TC-F2-01 / TC-F2-08
  test.fixme('TC-F2-01 / TC-F2-08: creates an event from /signup and from the Dashboard; its editor opens', async () => {});
  // TC-F2-04
  test.fixme('TC-F2-04: a taken or reserved URL disables "Create event"', async () => {});
  // REG-014 / ENG-271
  test.fixme('REG-014 / ENG-271: duplicating keeps registration off Eventbrite and shows current Settings labels', async () => {});
});

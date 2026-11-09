import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// F10 Control Panel. Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F10 Control Panel', () => {
  test.beforeEach(() => requireEph());

  // TC-F10-01
  test.fixme('TC-F10-01: name, dates and time zone changes show on the public site', async () => {});
  // TC-F10-02
  test.fixme('TC-F10-02: "Add" and "Add + Send Invite" add the attendee', async () => {});
  // TC-F10-04
  test.fixme('TC-F10-04: importing the attendee spreadsheet adds or updates without duplicates', async () => {});
  // TC-F10-06
  test.fixme('TC-F10-06: Reports -> Directory -> Attendees downloads every row', async () => {});
  // REG-112
  test.fixme('REG-112: a CFP portal can be added to an event', async () => {});
});

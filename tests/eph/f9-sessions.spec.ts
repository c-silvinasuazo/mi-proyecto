import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// F9 session editor. Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F9 session editor', () => {
  test.beforeEach(() => requireEph());

  // REG-208 / TC-F9-01
  test.fixme('REG-208 / TC-F9-01: a multi-day session keeps its dates after save and reopen', async () => {});
  // REG-209
  test.fixme('REG-209: description formatting (bold, italic, lists, centered, link) persists in the editor and on the public page', async () => {});
  // REG-210
  test.fixme('REG-210: session image saves; a PDF downloads as .pdf from the public page', async () => {});
  // ENG-2244
  test.fixme('ENG-2244: the session description character limit is enforced', async () => {});
  // REG-106 / TC-F9-03
  test.fixme('REG-106 / TC-F9-03: session import completes; secret and feedback flags respected (ENG-2050)', async () => {});
  // REG-105 / TC-F9-05
  test.fixme('REG-105 / TC-F9-05: freezing blocks schedule changes; unfreezing unlocks them (needs a paid plan)', async () => {});
  // REG-104 / REG-211 / TC-F9-04
  test.fixme('REG-104 / REG-211 / TC-F9-04: private session hidden from non-invited attendees; Enroll by People Tag works (needs Ultra)', async () => {});
  // REG-107
  test.fixme('REG-107: event and attendee schedule PDFs contain data', async () => {});
  // REG-127
  test.fixme('REG-127: turning chat on and off saves without a parsererror', async () => {});
  // REG-120
  test.fixme('REG-120: sponsor photo Accept works and the photo saves', async () => {});
  // ENG-87
  test.fixme('ENG-87: a session type with a comma is stored as one type (open data issue: expected to fail until fixed)', async () => {});
});

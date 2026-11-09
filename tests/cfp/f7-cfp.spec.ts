import { test } from '@playwright/test';
import { requireTarget } from '../helpers';

// F7 CFP (production CFP on a qaeng event until eph supports the CFP). Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('F7 CFP (production CFP on a qaeng event until eph supports the CFP)', () => {
  test.beforeEach(() => requireTarget('CFP_ENABLED'));

  // TC-F7-01 / REG-109 / REG-215 / ENG-1328
  test.fixme('TC-F7-01 / REG-109 / REG-215 / ENG-1328: submit a proposal with a file, co-speaker and conditional answers; one confirmation', async () => {});
  // TC-F7-02
  test.fixme('TC-F7-02: a CFP is closed before it opens and after it closes', async () => {});
  // REG-212 / TC-F7-06
  test.fixme('REG-212 / TC-F7-06: the export includes conditional answers (needs a paid plan)', async () => {});
  // REG-213 / TC-F7-03
  test.fixme('REG-213 / TC-F7-03: a reviewer rates an application; the organizer sees the rating', async () => {});
  // TC-F7-04 / REG-111
  test.fixme('TC-F7-04 / REG-111: an unrelated CFP account is denied the organizer pages (security: verify fixes, don\'t exploit)', async () => {});
  // REG-108 / TC-F7-05 / ENG-1565
  test.fixme('REG-108 / TC-F7-05 / ENG-1565: Sync with Sched with only Sync Applicants syncs speakers and creates no sessions', async () => {});
  // REG-214
  test.fixme('REG-214: two proposals from one applicant sync with that speaker attached, no duplicate speaker', async () => {});
  // REG-216
  test.fixme('REG-216: Messages: recipient search, scroll and removal work', async () => {});
  // ENG-2091
  test.fixme('ENG-2091: logging in from a CFP form returns to the form (open bug: expected to fail until fixed)', async () => {});
  // ENG-2267 / ENG-450
  test.fixme('ENG-2267 / ENG-450: the CFP form and info page fit on an iPhone screen (run with the mobile-safari project)', async () => {});
});

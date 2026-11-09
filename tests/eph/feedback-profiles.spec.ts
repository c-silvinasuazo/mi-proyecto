import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// feedback, profiles, sponsors and PD. Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('feedback, profiles, sponsors and PD', () => {
  test.beforeEach(() => requireEph());

  // REG-118
  test.fixme('REG-118: session feedback timestamps use the event time zone', async () => {});
  // REG-221
  test.fixme('REG-221: event feedback export shows a readable "saved at"', async () => {});
  // ENG-2588
  test.fixme('ENG-2588: event feedback isn\'t shown as received before submitting', async () => {});
  // ENG-2592
  test.fixme('ENG-2592: the Provide Feedback button is horizontal on the web', async () => {});
  // REG-222
  test.fixme('REG-222: two attendees keep their own photos; updating one doesn\'t change the other', async () => {});
  // REG-223
  test.fixme('REG-223: a sponsor level can be created and deleted (needs a paid plan)', async () => {});
  // REG-124 / ENG-2068 / ENG-1214
  test.fixme('REG-124 / ENG-2068 / ENG-1214: PD setup and approval work; the PD badge shows (needs the pdhours tag)', async () => {});
  // ENG-1543
  test.fixme('ENG-1543: sessions don\'t get PD credit enabled without configuring it (open bug: expected to fail until fixed)', async () => {});
  // ENG-2641
  test.fixme('ENG-2641: session check-in stays open until 10 minutes after the end, then closes', async () => {});
  // ENG-2217
  test.fixme('ENG-2217: with only one Speaker Tools option on, a speaker can edit only the matching fields', async () => {});
});

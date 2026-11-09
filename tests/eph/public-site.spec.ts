import { test } from '@playwright/test';
import { requireEph } from '../helpers';

// public site. Each case is a placeholder until it's recorded (see README: Recording a flow).
test.describe('public site', () => {
  test.beforeEach(() => requireEph());

  // REG-103
  test.fixme('REG-103: schedule, session page, date filter and search load; the date filter doesn\'t redirect', async () => {});
  // REG-102
  test.fixme('REG-102: an attendee adds and removes a session in My Schedule; its print view isn\'t blank', async () => {});
  // REG-220
  test.fixme('REG-220: the embed loads, scrolls and stays centered (run with the webkit project for Safari)', async () => {});
  // ENG-1568
  test.fixme('ENG-1568: /print/all shows descriptions (expected behavior for pasted formatting pending a Product decision)', async () => {});
  // REG-129
  test.fixme('REG-129: chatbot and banners don\'t cover editor menus or buttons', async () => {});
});

import { test, expect, Page } from '@playwright/test';

// Organizer pages hold applicants' data and session details, so traces and screenshots are off.
// Uses the run's saved Sched session (tests/setup), so it doesn't log in again.
test.use({ trace: 'off', screenshot: 'off' });

// URL for failure messages without tokens: long path segments are hidden.
function where(p: Page) {
  const u = new URL(p.url());
  const path = u.pathname.split('/').map((s) => (s.length > 20 ? '…' : s)).join('/');
  return `${u.origin}${path}`;
}

// Editor -> Call For Papers -> CFP Portal; waits for the CFP sign-in handoff (/auth/...) to finish.
async function openCfpPortal(page: Page): Promise<Page> {
  const event = process.env.CFP_EVENT || 'qaengreminders';
  await page.goto(`https://${event}.sched.com/editor/callforpapers`);
  const link = page
    .getByRole('link', { name: /CFP\)?\s*Portal/i })
    .or(page.getByRole('button', { name: /CFP\)?\s*Portal/i }))
    .first();
  await expect(link, `No "CFP Portal" link on ${where(page)}`).toBeVisible();
  const [popup] = await Promise.all([
    page.context().waitForEvent('page', { timeout: 8_000 }).catch(() => null),
    link.click(),
  ]);
  const cfp = popup ?? page;
  await cfp.waitForURL((u) => u.hostname === 'cfp.sched.com' && !u.pathname.includes('/auth/'), { timeout: 30_000 })
    .catch(() => { throw new Error(`The CFP portal didn't finish opening. Landed on: ${where(cfp)}`); });
  await cfp.waitForLoadState('domcontentloaded');
  return cfp;
}

test.describe('CFP organizer (production, read-only)', () => {
  // TC-F7-01 (organizer side): the organizer reaches the CFP portal from the editor and sees the QA form.
  test('organizer opens the CFP portal from the editor', async ({ page }) => {
    const cfp = await openCfpPortal(page);
    await expect(cfp.getByText(/qa F7 form|qa CFP prod/i).first(), `QA form not listed. Landed on: ${where(cfp)}`).toBeVisible({ timeout: 15_000 });
  });

  // TC-F7-06: on Free Trial, "Download all" asks to upgrade instead of exporting.
  test('Download all on Free Trial asks to upgrade', async ({ page }) => {
    const cfp = await openCfpPortal(page);

    const applications = cfp.getByRole('link', { name: /applications/i }).or(cfp.getByRole('button', { name: /applications/i })).first();
    await expect(applications, `No "Applications" in the portal. Landed on: ${where(cfp)}`).toBeVisible({ timeout: 15_000 });
    await applications.click();

    const downloadAll = cfp.getByRole('button', { name: /download all/i }).or(cfp.getByRole('link', { name: /download all/i })).first();
    await expect(downloadAll, `No "Download all" on Applications. Landed on: ${where(cfp)}`).toBeVisible({ timeout: 15_000 });

    const download = cfp.waitForEvent('download', { timeout: 5_000 }).catch(() => null);
    await downloadAll.click();
    expect(await download, 'An export downloaded on a Free Trial event').toBeNull();
    await expect(
      cfp.getByText(/upgrade|choose a plan|paid plan|unlock/i).first(),
      `No upgrade prompt after "Download all". Landed on: ${where(cfp)}`
    ).toBeVisible({ timeout: 10_000 });
  });
});

---
id: TC-F10-04
title: Import attendees
flow: F10 — Control Panel
type: Positive
env: Local
bugs: []
last_run: passed
automation: 🟡 placeholder — `tests/eph/f10-control-panel.spec.ts`
---

# TC-F10-04 — Import attendees

## Steps

Import from the spreadsheet

## Expected result

Adds or updates without duplicates

## Automation

🟡 placeholder — `tests/eph/f10-control-panel.spec.ts`

## Last run

✅ 2026-10-20 (production, qaengreminders, organizer account): Add New → Attendees → Import with a 2-row sheet. The existing attendee is updated (Company) without a duplicate and keeps their sessions and People Tag; the new one is added as Inactive. No invite is sent: bulk email invitations need to be enabled by the Account Manager. Note: the header still says "Attendees (2)" with 3 listed (possibly counts active only). On 2026-10-19, an organizer on Free Trial couldn't download the spreadsheet from Reports (expected per Marko, 2026-10-21: Free Trial will be even more limited with the next package version)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

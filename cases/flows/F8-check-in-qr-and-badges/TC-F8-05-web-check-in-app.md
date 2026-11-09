---
id: TC-F8-05
title: Web check-in app
flow: F8 — Check-in, QR and badges
type: Positive
env: Production
bugs: []
last_run: passed
automation: 🟡 placeholder — `tests/eph/f8-checkin.spec.ts`
---

# TC-F8-05 — Web check-in app

## Steps

Log in as an admin at /checkin; check an attendee into a session they have on their schedule

## Expected result

The check-in is recorded and shows in the session's Check-in tab

## Automation

🟡 placeholder — `tests/eph/f8-checkin.spec.ts`

## Last run

✅ 2026-10-22 (qaengreminders): /checkin opens the Check-In App after login; with past sessions it shows "No upcoming sessions found" and "Show All Sessions". Checking an attendee into "qa public" records it. Note: no success message after a session check-in. Event-level check-in and QR scanning not run

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

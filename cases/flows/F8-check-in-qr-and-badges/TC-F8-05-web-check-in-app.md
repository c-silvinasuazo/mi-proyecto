---
id: TC-F8-05
title: Web check-in app
flow: F8 — Check-in, QR and badges
type: Positive
env: Production
bugs: []
last_run: passed
automation: ✅ automated — `tests/eph/f8-checkin.spec.ts` and, at Android phone size, `tests/eph/checkin-android.spec.ts` (eph)
---

# TC-F8-05 — Web check-in app

## Steps

Log in as an admin at /checkin; check an attendee into a session they have on their schedule

## Expected result

The check-in is recorded and shows in the session's Check-in tab

## Automation

✅ automated — `tests/eph/f8-checkin.spec.ts` (eph). At Android phone size (Sched Count is iOS only), `tests/eph/checkin-android.spec.ts` also covers the role check, Name Search event check-in, and undoing event and session check-ins.

## Last run

✅ 2026-10-22 (qaengreminders): /checkin opens the Check-In App after login; with past sessions it shows "No upcoming sessions found" and "Show All Sessions". Checking an attendee into "qa public" records it. Note: no success message after a session check-in. Event-level check-in and QR scanning not run

❌ 2026-11-12 (eph, Pixel 7 size, automated): session check-in and its undo are saved; Name Search checks an attendee in and the editor lists it. A new issue, filed as ENG-2784: a Name Search with first and last name ("QA add 2611…") finds nobody, because the app encodes the space twice and the server answers "No results"; Also confirms ENG-183: undoing an event check-in unticks it on screen but sends nothing, so the attendee stays checked in (also seen on qaengreminders in production). An attendee without a role can't log in, but the app shows no message

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

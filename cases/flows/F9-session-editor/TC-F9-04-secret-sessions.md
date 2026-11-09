---
id: TC-F9-04
title: Secret sessions
flow: F9 — Session editor
type: Negative
env: Production for emails
bugs: [ENG-2117, ENG-2166]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f9-sessions.spec.ts`
---

# TC-F9-04 — Secret sessions

## Steps

Invited vs non-invited attendee; reminders; speaker PDF

## Expected result

Only invited attendees and the speaker see it (ENG-2166, ENG-2117)

## Automation

🟡 placeholder — `tests/eph/f9-sessions.spec.ts`

## Last run

✅ 2026-10-20 (9.4, production, qaengreminders on Ultra, organizer account): before enrolling, attendee A doesn't see the private session. After assigning a People Tag (Testag1) from A's profile and Sessions → Bulk Actions → Enroll by People Tag, the session shows 1 enrolled, A's agenda shows 2 sessions and A sees it. Attendee B (not enrolled) and a logged-out visitor don't. People Tags and session tags are different (Bulk Actions → Tag is for sessions). Speaker PDF: ✅ 2026-10-23 (Ultra): a speaker is assigned to an existing session by importing the session spreadsheet with the Speakers column (there's no field in Edit). With the speaker on the private session, Reports → Speaker schedules generates their PDF including it. Reminder on 2026-10-21 (5:17): attendee A got "Your Schedule For Wednesday" including the private session; attendees without a schedule got "Schedule For Wednesday" ("Here's what's happening today. These aren't on your personal schedule") without it. Note (2026-10-22): with the event on Boost (private sessions are an Ultra feature), a non-enrolled logged-in attendee sees the private session in the public schedule; switching the event to Ultra hides it again for the same attendee. Asked Marko whether private sessions are meant to become public when the plan drops below Ultra. Sofia Storer (2026-10-27): secret sessions are Ultra-only; below Ultra there should be an upgrade path, not a setting that doesn't work → bug ENG-2583, rejected by Marko (2026-10-27): an event only drops from Ultra to Boost with CS involvement (very rare), Boost already shows an upgrade path for secret sessions, and the upcoming plan reorg removes all plans below Ultra. Not a bug. Gabriel Mago (2026-10-27): secret sessions depend on a feature flag that CS turns on per event in Schedmin; some Boost events have it enabled. From 2026-10-20 (qareminders): B (no schedule) didn't get the private session in the reminder, so ENG-2166 is not reproduced. Notes: the reminder was sent although the event was on Free Trial; the session shows as "TBA @" with no time; the copy says "custom schedule" for an attendee with no schedule

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

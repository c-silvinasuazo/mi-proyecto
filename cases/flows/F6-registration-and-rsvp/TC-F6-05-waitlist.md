---
id: TC-F6-05
title: Waitlist
flow: F6 — Registration and RSVP
type: Positive
env: Production
bugs: [ENG-2165]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f6-registration.spec.ts`
---

# TC-F6-05 — Waitlist

## Steps

Free a spot; then turn the waitlist off

## Expected result

The first person is added and emailed within the hour (notifier at minute 17); no list when off (ENG-2165)

## Automation

🟡 placeholder — `tests/eph/f6-registration.spec.ts`

## Last run

✅ 2026-10-21 (production, qaengreminders), validated by QA: when a spot frees up, the waitlisted attendee moves into the session (Attendees 2 of 2, Waitlist 0); the Hotmail attendee used for the waitlist was later removed by hand, so it doesn't show in the session today. Earlier note: in the editor it shows after reloading the page, without waiting for minute 17. Turning the waitlist off: ✅ 2026-10-21 (Boost): with the waitlist disabled (setting saved) and the session full, a non-enrolled attendee can't join or get on a list. A first attempt didn't save the setting, so the waitlist stayed on and that attendee was waitlisted, as expected. The confirmation email to the attendee who moved in never arrived (the event went back to Free Trial shortly after; to ask)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

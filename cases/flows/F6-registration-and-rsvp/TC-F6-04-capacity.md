---
id: TC-F6-04
title: Capacity
flow: F6 — Registration and RSVP
type: Positive
env: Production
bugs: [ENG-1071]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f6-registration.spec.ts`
---

# TC-F6-04 — Capacity

## Steps

Two attendees join a capacity-2 session; a third tries

## Expected result

Real capacity; the third goes to the waitlist (ENG-1071)

## Automation

🟡 placeholder — `tests/eph/f6-registration.spec.ts`

## Last run

✅ 2026-10-21 (production, qaengreminders on Boost): session "qa capacity" with capacity 2. Two attendees join (Attendees 2 of 2); the third gets "The session you've added to your schedule was already full. You've been added to its waitlist." and a WAITLISTED badge (Waitlist 1). Note: the Sessions list shows "3 of 2" in red, adding the waitlist to the count (display only)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

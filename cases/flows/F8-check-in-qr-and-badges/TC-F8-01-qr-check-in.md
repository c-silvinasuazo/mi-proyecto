---
id: TC-F8-01
title: QR check-in
flow: F8 — Check-in, QR and badges
type: Positive
env: App (Sched Count, iOS only)
bugs: [ENG-154, ENG-459]
last_run: blocked
automation: not mapped yet
---

# TC-F8-01 — QR check-in

## Steps

Scan a ticket QR

## Expected result

Check-in recorded; full ticket details (ENG-154, ENG-459)

## Automation

not mapped yet

## Last run

⛔ Blocked (2026-10-23, iOS): Sched Count only shows its login screen and needs an account with the Admin or Check-In Manager role to reach the scanner. Retest 2026-10-26 with the organizer account (+30): scanning an attendee's badge QR (from Badges) only makes the phone vibrate and records no check-in; the organizer's own badge QR does the same. Asking Bill whether Sched Count only reads ticket QR codes (the event has no tickets) or needs a QR setting (ENG-550). Bill is no longer available; to ask someone else. Owner for Sched Count and iOS: Diego (Bill, 2026-10-27). Gabriel Mago (2026-10-27): the exported badge QR is the right one; the QR on the attendee's profile and on the badge are used both for networking and check-in (works for him on Android and the web check-in app); he tests on qaguestcheckouttest2026. Next: scan the same QR with the web check-in app to compare with Sched Count on iOS. ✅ 2026-10-27 (qaengreminders): the exported badge QR checks the attendee in with both the web check-in app (camera icon, top right) and Sched Count on iOS (confirms the check-in and vibrates). The earlier failure wasn't reproduced; possibly the event's plan at the time

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

---
id: REG-114
title: The check-in camera scans QR codes
level: Core
area: F8
priority: High
base_case: TC-F8-01
bugs: [ENG-154]
last_run: passed
automation: 👤 manual — Sched Count app and camera
---

# REG-114 — The check-in camera scans QR codes

## What to verify

The check-in camera scans QR codes

Steps: follow the base case (TC-F8-01).

Prevents the return of: ENG-154

## Automation

👤 manual — Sched Count app and camera

## Last run

✅ 2026-10-27 (qaengreminders): the exported badge QR checks the attendee in with the web check-in app (camera icon, iPhone Safari) and with Sched Count on iOS (confirms and vibrates). The 2026-10-26 failure wasn't reproduced; the cause wasn't identified (possibly the event's plan at the time)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

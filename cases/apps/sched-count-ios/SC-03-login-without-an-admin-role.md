---
id: SC-03
title: Login without an admin role
flow: Sched Count regression (iOS)
bugs: []
last_run: see builds
automation: 👤 manual — Sched Count app and camera
---

# SC-03 — Login without an admin role

## Steps

Log in with an attendee account

## Expected result

Rejected with a clear message

## Automation

👤 manual — Sched Count app and camera

## Results by build

| Build | Result |
| --- | --- |
| β 1.8.3 (2094), 2026-10-29 | ⚠️ Logs in, but the event tab stays empty and nothing can be done |
| 1.8.3 (2095), 2026-10-29 | ⚠️ Same |

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

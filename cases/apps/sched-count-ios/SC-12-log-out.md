---
id: SC-12
title: Log out
flow: Sched Count regression (iOS)
bugs: [ENG-2690]
last_run: see builds
automation: 👤 manual — Sched Count app and camera
---

# SC-12 — Log out

## Steps

Log out

## Expected result

Back to the login screen

## Automation

👤 manual — Sched Count app and camera

## Results by build

| Build | Result |
| --- | --- |
| β 1.8.3 (2094), 2026-10-29 | ✅ |
| 1.8.3 (2095), 2026-10-29 | ✅ |
| β 1.8.3 (2108), 2026-11-10 | ❌ Log out is blocked by "sync in progress" and stays blocked after waiting with a good connection and force-quitting the app; reinstalling to get back to the login screen (loses the pending check-ins) → ENG-2690 |

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

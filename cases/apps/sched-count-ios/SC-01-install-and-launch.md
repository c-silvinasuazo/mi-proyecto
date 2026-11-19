---
id: SC-01
title: Install and launch
flow: Sched Count regression (iOS)
bugs: []
last_run: see builds
automation: 👤 manual — Sched Count app and camera
---

# SC-01 — Install and launch

## Steps

Install from TestFlight and open

## Expected result

Opens without closing; icon and launch screen look right

## Automation

👤 manual — Sched Count app and camera

## Results by build

| Build | Result |
| --- | --- |
| β 1.8.3 (2094), 2026-10-29 | ✅ |
| 1.8.3 (2095), 2026-10-29 | ✅ |
| 1.6.3 (1688, App Store), iOS 27.2 simulator, 2026-11-13 | ❌ closes as soon as it opens (UIKit: the app doesn't adopt the scene life cycle required on iOS 27; the β moved to the Xcode 27 tool chain in ENG-754) |

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

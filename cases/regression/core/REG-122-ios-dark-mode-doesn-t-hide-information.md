---
id: REG-122
title: iOS dark mode doesn't hide information
level: Core
area: Mobile
priority: High
bugs: [ENG-1272]
last_run: passed
automation: ✅ automated — `mobile/sched-app-dark/APP-15-dark-mode.yaml` (APP-15, Maestro, iOS and Android; screenshots for the visual check)
---

# REG-122 — iOS dark mode doesn't hide information

## What to verify

iOS dark mode doesn't hide information

Prevents the return of: ENG-1272

## Automation

✅ automated — `mobile/sched-app-dark/APP-15-dark-mode.yaml` (APP-15, Maestro, iOS and Android; screenshots for the visual check)

## Last run

✅ 2026-11-17 (automated, APP-15): iOS (Sched Dev 2.16.2 simulator) stays in light mode, as on Oct 28, and everything shows; Android 1.63.1 turns dark and everything reads well

✅ 2026-10-28 (iOS, Sched 2.16 from the App Store): with the iPhone in dark mode, the app stays in light mode and all information is visible (schedule, session description, attendees, profile)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

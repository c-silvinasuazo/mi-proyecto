---
id: REG-225
title: The speaker list in the apps keeps the same order as on the web
level: Extended
area: Apps
bugs: [ENG-2172]
last_run: passed
automation: ✅ automated — `mobile/sched-app/REG-225-speaker-order.yaml` (Maestro, iOS and Android; the expected order is set in mobile/run.sh)
---

# REG-225 — The speaker list in the apps keeps the same order as on the web

## What to verify

The speaker list in the apps keeps the same order as on the web

Prevents the return of: ENG-2172

## Automation

✅ automated — `mobile/sched-app/REG-225-speaker-order.yaml` (Maestro, iOS and Android; the expected order is set in mobile/run.sh)

## Last run

✅ 2026-11-18 (automated, qa reminders 2): the 4 speakers show in the web's order on iOS (Sched Dev 2.16.2) and Android (1.63.1): the featured one first (qa F7 propuesta 2), then QaSpeaker, qa sp 2217 and qa speaker 2228 by last name. The speaker list only showed in the app after the event's directory was set to show speakers

✅ 2026-10-23: verified by development (Diego: iOS branded v2.15.1 and Android global 1.63.0, all 39 speakers in the web's order) and confirmed by support (Joshua) on iOS and Android. Not run by QA

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

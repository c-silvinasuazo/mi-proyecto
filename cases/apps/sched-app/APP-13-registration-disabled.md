---
id: APP-13
title: Registration disabled
flow: Sched app regression (iOS and Android)
bugs: [ENG-547]
last_run: see builds
automation: ✅ automated — `mobile/sched-app/APP-13-registration-disabled.yaml` (Maestro, iOS and Android)
---

# APP-13 — Registration disabled

## Steps

Open an event without registration

## Expected result

Goes straight to the schedule (REG-126, ENG-547)

## Automation

✅ automated — `mobile/sched-app/APP-13-registration-disabled.yaml` (Maestro, iOS and Android)

## Results by build

| Build | Result |
| --- | --- |
| iOS test build: Sched Dev 2.16.0 (7712) | Not run |
| iOS App Store 2.16 | Not run |
| Android Google Play 1.63.0 | ✅ 2026-10-22 |
| iOS simulator build: Sched Dev 2.16.2 (7698) | ✅ 2026-11-13 (automated, qa reminders 2) |
| Android 1.63.1 (APK from Diego) | ✅ 2026-11-13 (automated, qa reminders 2) |

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

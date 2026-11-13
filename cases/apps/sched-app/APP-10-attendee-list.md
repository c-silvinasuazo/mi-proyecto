---
id: APP-10
title: Attendee list
flow: Sched app regression (iOS and Android)
bugs: [ENG-2213]
last_run: see builds
automation: ✅ automated — `mobile/sched-app/APP-10-attendee-list.yaml` (Maestro, iOS and Android: Directory -> Attendees on iOS, Info -> Attendees on Android; ENG-2591)
---

# APP-10 — Attendee list

## Steps

Open Attendees as an attendee

## Expected result

The list isn't blank (ENG-2213)

## Automation

✅ automated — `mobile/sched-app/APP-10-attendee-list.yaml` (Maestro, iOS and Android: Directory -> Attendees on iOS, Info -> Attendees on Android; ENG-2591)

## Results by build

| Build | Result |
| --- | --- |
| iOS test build: Sched Dev 2.16.0 (7712) | ✅ 2026-10-27 |
| iOS App Store 2.16 | ✅ 2026-10-27 |
| Android Google Play 1.63.0 | Not run |
| iOS simulator build: Sched Dev 2.16.2 (7698) | ✅ 2026-11-13 (automated) |
| Android 1.63.1 (APK from Diego) | ✅ 2026-11-13 (automated: Info -> Attendees; the app has no Directory tab, ENG-2591) |

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

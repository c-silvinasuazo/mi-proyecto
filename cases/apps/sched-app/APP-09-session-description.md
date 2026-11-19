---
id: APP-09
title: Session description
flow: Sched app regression (iOS and Android)
bugs: []
last_run: see builds
automation: ✅ automated — `mobile/sched-app/APP-09-session-description.yaml` (Maestro, iOS and Android; checks the title, time, speaker and description of qa publico)
---

# APP-09 — Session description

## Steps

Open a session that has a description

## Expected result

The description shows (TC-F9-02)

## Automation

✅ automated — `mobile/sched-app/APP-09-session-description.yaml` (Maestro, iOS and Android; checks the title, time, speaker and description of qa publico)

## Results by build

| Build | Result |
| --- | --- |
| iOS test build: Sched Dev 2.16.0 (7712) | ✅ 2026-10-27 |
| iOS App Store 2.16 | Not run |
| Android Google Play 1.63.0 | ✅ 2026-10-23 |
| iOS simulator build: Sched Dev 2.16.2 (7698) | 🟡 2026-11-13 (automated): title, time and speaker show; not checked for a description, because no session in qa reminders 2 has one |
| Android 1.63.1 (APK from Diego) | 🟡 2026-11-13 (automated): title, time and speaker show; not checked for a description, because no session in qa reminders 2 has one |
| iOS simulator build: Sched Dev 2.16.2 (7698) | ✅ 2026-11-17 (automated): the description added to qa publico shows |
| Android 1.63.1 (APK from Diego) | ✅ 2026-11-17 (automated): the description added to qa publico shows |

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

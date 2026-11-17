---
id: APP-15
title: Dark mode (iOS)
flow: Sched app regression (iOS and Android)
bugs: []
last_run: see builds
automation: ✅ automated — `mobile/sched-app-dark/APP-15-dark-mode.yaml` (Maestro, `npm run test:ios:dark`; run.sh turns dark mode on and back off; checks the schedule, a session and the attendee list show their content, with screenshots for the visual check)
---

# APP-15 — Dark mode (iOS)

## Steps

Turn on dark mode and browse

## Expected result

Nothing is hidden (REG-122)

## Automation

✅ automated — `mobile/sched-app-dark/APP-15-dark-mode.yaml` (Maestro, `npm run test:ios:dark`; run.sh turns dark mode on and back off; checks the schedule, a session and the attendee list show their content, with screenshots for the visual check)

## Results by build

| Build | Result |
| --- | --- |
| iOS test build: Sched Dev 2.16.0 (7712) | Not run |
| iOS App Store 2.16 | ✅ 2026-10-28 |
| Android Google Play 1.63.0 | N/A |
| iOS simulator build: Sched Dev 2.16.2 (7698) | ✅ 2026-11-17 (automated, qa reminders 2). Note: this build stays light with the simulator in dark mode (Settings turns dark, the app doesn't), so nothing is hidden, but dark mode isn't really exercised. To ask Diego whether the app opts out of dark mode on purpose |

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

---
id: REG-126
title: With registration disabled, the app doesn't redirect to registration
level: Core
area: F6
priority: Reopened
base_case: TC-F6-03
bugs: [ENG-547, ENG-652, ENG-734]
last_run: passed
automation: ✅ automated — `mobile/sched-app/APP-13-registration-disabled.yaml` (APP-13, Maestro, iOS and Android; the web half of TC-F6-03 isn't automated)
---

# REG-126 — With registration disabled, the app doesn't redirect to registration

## What to verify

With registration disabled, the app doesn't redirect to registration

Steps: follow the base case (TC-F6-03).

Prevents the return of: ENG-547, ENG-652, ENG-734

## Automation

✅ automated — `mobile/sched-app/APP-13-registration-disabled.yaml` (APP-13, Maestro, iOS and Android; the web half of TC-F6-03 isn't automated)

## Last run

✅ 2026-11-17 (automated, APP-13): qa reminders 2, which has no registration, opens straight to its schedule on iOS and Android

✅ 2026-10-22 (Android 1.63.0, without event password)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

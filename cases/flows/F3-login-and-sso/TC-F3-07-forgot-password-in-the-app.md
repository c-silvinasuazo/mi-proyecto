---
id: TC-F3-07
title: Forgot password in the app
flow: F3 — Login and SSO
type: Edge
env: App
bugs: [ENG-606, ENG-894]
last_run: passed
automation: not mapped yet
---

# TC-F3-07 — Forgot password in the app

## Steps

Private event in the app

## Expected result

The option exists and works (ENG-606, ENG-894)

## Automation

not mapped yet

## Last run

✅ 2026-10-22 (Android, Samsung, Sched app 1.63.0 from Google Play): "Forgot password" shows on the login of a public event (qaengreminders) and of a private, invite-only event (billmtttest42) on Android. ENG-894 (missing on private events) and ENG-606 (401 deleted_client at login) are iOS bugs, so they're still to check on an iPhone. Requested three times: one reset email per request; the link sets a new password and the app logs in with it. ✅ iOS (2026-10-23, current App Store version): the Forgot Password option shows on the login screen of a private event (CCAR 2026), so ENG-894 is not reproduced (commented on the ticket)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

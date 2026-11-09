---
id: TC-F3-06
title: SSO in the apps
flow: F3 — Login and SSO
type: Positive
env: App
bugs: [ENG-656, ENG-2042]
last_run: partial
automation: not mapped yet
---

# TC-F3-06 — SSO in the apps

## Steps

Google, Microsoft and Apple in a private event

## Expected result

Right event; no crash or 401 (ENG-2042, ENG-656)

## Automation

not mapped yet

## Last run

⚠️ 2026-10-22 (Android, Samsung, Sched app 1.63.0): Google and Microsoft logins work and return to the event (Microsoft first showed "Sign in is blocked" from Microsoft's own security on the new device; it worked on a later retry). iOS (2026-10-23, current App Store version): Google SSO login works with no 401 deleted_client error (ENG-606 not reproduced; Bill suggests closing it as a Firebase config issue). Logging in with an email that isn't on a private event's attendee list shows "This event is private / restricted" and signs out, which is expected. SSO on iOS validated OK by QA

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

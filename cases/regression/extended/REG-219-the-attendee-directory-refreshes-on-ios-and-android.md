---
id: REG-219
title: The attendee directory refreshes on iOS and Android
level: Extended
area: Mobile
bugs: [ENG-1065, ENG-1066]
last_run: partial
automation: 👤 manual — Native apps (Sched)
---

# REG-219 — The attendee directory refreshes on iOS and Android

## What to verify

The attendee directory refreshes on iOS and Android

Prevents the return of: ENG-1065, ENG-1066

## Automation

👤 manual — Native apps (Sched)

## Last run

⚠️ 2026-11-03 (iOS, Sched 2.16.2 test build 7726, during ENG-2228): an attendee profile edited on the web didn't update in the app with pull-to-refresh or by leaving the event; it showed only after closing and reopening the app. Android not run

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

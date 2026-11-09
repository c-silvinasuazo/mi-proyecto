---
id: TC-F6-03
title: Registration disabled
flow: F6 — Registration and RSVP
type: Negative
env: Local + App
bugs: [ENG-547]
last_run: passed
automation: not mapped yet
---

# TC-F6-03 — Registration disabled

## Steps

Open the event on web and Android

## Expected result

No redirect to the form (ENG-547)

## Automation

not mapped yet

## Last run

✅ 2026-10-22 (Android, Samsung, Sched app 1.63.0): on an event that never had registration (qaengf6app, Boost, created by an organizer account), logging in with Google in the app goes straight to the Schedule screen, with no registration page or endless loading. Not tested with an event password (the ENG-547 report had one)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

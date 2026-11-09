---
id: TC-F3-05
title: Microsoft SSO (web)
flow: F3 — Login and SSO
type: Positive
env: Production
bugs: [ENG-2069]
last_run: passed
automation: 👤 manual — Third-party login; doesn't work on eph
---

# TC-F3-05 — Microsoft SSO (web)

## Steps

Login with Microsoft

## Expected result

No endless loading (ENG-2069)

## Automation

👤 manual — Third-party login; doesn't work on eph

## Last run

✅ 2026-10-16 (3.9): new personal Microsoft account; login completes without endless loading; lands on /directory, logged in. Avatar shows the default placeholder, not a photo (to confirm whether the Microsoft account has one)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

---
id: TC-F3-04
title: Google SSO (web)
flow: F3 — Login and SSO
type: Positive
env: Production
bugs: [ENG-936]
last_run: passed
automation: 👤 manual — Third-party login; doesn't work on eph
---

# TC-F3-04 — Google SSO (web)

## Steps

Login with Google

## Expected result

Session OK, right avatar (ENG-936)

## Automation

👤 manual — Third-party login; doesn't work on eph

## Last run

✅ 2026-10-16 (3.8): new Gmail account; no endless loading; lands on /directory, logged in; avatar shows the Google photo. A superadmin account is blocked with "yer a superadmin, no sso for you!" on a blank page (/connect/google-sso; intended?). Chrome reuses the Google session across incognito windows: use a Guest profile or another browser to switch accounts

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

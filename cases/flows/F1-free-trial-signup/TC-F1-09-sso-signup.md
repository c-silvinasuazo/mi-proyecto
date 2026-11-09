---
id: TC-F1-09
title: SSO signup
flow: F1 — Free trial signup
type: Positive
env: Production
bugs: []
last_run: passed
automation: 👤 manual — Third-party login; doesn't work on eph
---

# TC-F1-09 — SSO signup

## Steps

Signup with Google and Microsoft

## Expected result

Same destinations as email signup

## Automation

👤 manual — Third-party login; doesn't work on eph

## Last run

✅ 2026-10-16 (production, Google): logging in with a new Gmail account created the Sched account and landed on /directory, logged in (same destination as the Attending email signup). ✅ Microsoft too (2026-10-16, 3.9)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

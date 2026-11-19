---
id: TC-F3-03
title: Invalid credentials
flow: F3 — Login and SSO
type: Negative
env: Local
bugs: []
last_run: passed
automation: ✅ automated — `tests/readonly/eng-2250-failed-login-keeps-plus.spec.ts`
---

# TC-F3-03 — Invalid credentials

## Steps

Wrong password; non-existent user

## Expected result

Generic error that doesn't reveal whether the user exists (proposed)

## Automation

✅ automated — `tests/readonly/eng-2250-failed-login-keeps-plus.spec.ts`

## Last run

✅ 2026-10-12 (3.3, 3.4). Bug: the "+" is removed from the email field after a failed login (local, dev2 and production; ENG-2250). ✅ ENG-2250 verified on production 2026-10-26: the "+" stays after a failed login

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

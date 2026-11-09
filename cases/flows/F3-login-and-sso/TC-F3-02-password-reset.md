---
id: TC-F3-02
title: Password reset
flow: F3 — Login and SSO
type: Positive
env: Local + production
bugs: [ENG-419]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f3-login.spec.ts`
---

# TC-F3-02 — Password reset

## Steps

Forgot password → email → link → new password → login

## Expected result

Works; /password-reset and /password-reset/ behave the same (ENG-419)

## Automation

🟡 placeholder — `tests/eph/f3-login.spec.ts`

## Last run

✅ 2026-10-13 (3.5 dev2, 3.6 local). Emails aren't delivered locally. The reset email shows the link text twice

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

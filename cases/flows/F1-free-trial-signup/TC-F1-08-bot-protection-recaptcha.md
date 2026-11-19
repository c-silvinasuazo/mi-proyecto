---
id: TC-F1-08
title: Bot protection (reCAPTCHA)
flow: F1 — Free trial signup
type: Negative
env: Production
bugs: []
last_run: not run
automation: not mapped yet
---

# TC-F1-08 — Bot protection (reCAPTCHA)

## Steps

Try to submit the signup form without completing the reCAPTCHA (or with it failing)

## Expected result

Signup is rejected; no account is created

## Automation

not mapped yet

## Last run

Not run. Adapted from a honeypot case to reCAPTCHA, which the form uses (Tony, 2026-10-26). Expected behavior to confirm with Marko if unclear

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

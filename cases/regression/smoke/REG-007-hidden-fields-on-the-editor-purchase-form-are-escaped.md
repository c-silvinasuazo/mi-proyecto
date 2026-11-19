---
id: REG-007
title: Hidden fields on the editor purchase form are escaped
level: Smoke
area: F4
priority: High
base_case: TC-F4-01
bugs: [ENG-2180]
last_run: passed
automation: ✅ automated — `tests/readonly/reg-007-hidden-field-escaped.spec.ts`
---

# REG-007 — Hidden fields on the editor purchase form are escaped

## What to verify

Hidden fields on the editor purchase form are escaped

Steps: follow the base case (TC-F4-01).

Prevents the return of: ENG-2180

## Automation

✅ automated — `tests/readonly/reg-007-hidden-field-escaped.spec.ts`

## Last run

✅ 2026-10-27 (production, qaengf6app, organizer account): with sub_code=qatest%22%3E%3Cb%3Ex in /editor/signup, the page source shows the hidden purchasecode value escaped (&quot;&gt;&lt;b&gt;). Commented on ENG-2180

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

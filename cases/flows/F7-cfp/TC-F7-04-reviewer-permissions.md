---
id: TC-F7-04
title: Reviewer permissions
flow: F7 — CFP
type: Negative
env: cfp-staging (isolated)
bugs: [ENG-1483, ENG-2220, ENG-2221]
last_run: passed
automation: 🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`
---

# TC-F7-04 — Reviewer permissions

## Steps

Unrelated CFP account

## Expected result

Access denied (ENG-1483, ENG-2220, ENG-2221)

## Automation

🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`

## Last run

✅ 2026-10-20 (cfp-staging): logged in as an applicant (CFP account +33), the organizer's form editor URL (/organizer/qaengreminders/forms/1724) and another applicant's application URL (from the organizer's Applications) are both denied. Changing the submission ID from the applicant's own view couldn't be tested: after login, the applicant only sees the form to submit again, with no view of their own applications. Reviewer-account check (2026-10-21): a reviewer who joined through the group link can't open the organizer's form editor either

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

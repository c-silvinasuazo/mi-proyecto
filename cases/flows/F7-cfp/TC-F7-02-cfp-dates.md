---
id: TC-F7-02
title: CFP dates
flow: F7 — CFP
type: Negative
env: cfp-staging
bugs: [ENG-27]
last_run: passed
automation: ✅ automated — `tests/cfp-readonly/tc-f7-02-cfp-dates.spec.ts`
---

# TC-F7-02 — CFP dates

## Steps

Submit to a future and a closed CFP

## Expected result

Blocked before opening and after closing (ENG-27)

## Automation

✅ automated — `tests/cfp-readonly/tc-f7-02-cfp-dates.spec.ts`

## Last run

✅ 2026-10-20 (cfp-staging, two duplicates of "qa F7 form"): a form opening tomorrow (10/21–10/30) and a form that closed yesterday (10/15–10/19) both show their dates and "Submissions are currently closed" with no apply button. Notes: the not-yet-open form also says "currently closed" instead of when it opens; the duplicated forms kept the original title. Exact closing time (ENG-1374): verified by support (Gabriel Mago, 2026-10-21 to 10-23) with screenshots at several times until after the closing time; closed by Marko. Not re-run by QA

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

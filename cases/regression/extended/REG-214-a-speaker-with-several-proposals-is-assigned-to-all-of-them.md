---
id: REG-214
title: A speaker with several proposals is assigned to all of them
level: Extended
area: CFP
bugs: [ENG-228, ENG-335]
last_run: passed
automation: ✅ automated — `tests/eph/f7-cfp.spec.ts` (eph; opt-in with EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and applications)
---

# REG-214 — A speaker with several proposals is assigned to all of them

## What to verify

A speaker with several proposals is assigned to all of them

Prevents the return of: ENG-335, ENG-228

## Automation

✅ automated — `tests/eph/f7-cfp.spec.ts` (eph; opt-in with EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and applications)

## Last run

✅ 2026-11-16 (automated, pr-309 eph; also with an exploration script on the QA eph): two proposals from one applicant, full sync: both sessions have the speaker, the speaker is in the event once. Note: three earlier runs on pr-309 (around 19:05) left both sessions without the speaker; not reproduced in the next four runs, so not reported

✅ 2026-11-03 (production CFP → qaengreminders): one CFP account submitted two proposals; after Sync with Sched (Sync Applicants, Sync Sessions and Attach Applicants to Sessions on, role Speaker), both sessions were created with that speaker attached, and the speaker appears only once in Speakers

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

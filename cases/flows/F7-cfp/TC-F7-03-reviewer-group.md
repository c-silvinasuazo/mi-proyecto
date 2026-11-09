---
id: TC-F7-03
title: Reviewer group
flow: F7 — CFP
type: Positive
env: cfp-staging
bugs: [ENG-237]
last_run: passed
automation: 🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`
---

# TC-F7-03 — Reviewer group

## Steps

Assign and rate

## Expected result

Correct averages; file fields visible (ENG-237)

## Automation

🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`

## Last run

✅ 2026-10-21 (cfp-staging): a reviewer joins through the reviewer group link (new CFP account, Safari), sees the application with its uploaded file, and rates it; the organizer sees that rating in Reviewer Groups. Notes: the Applications card still shows "(1)" (only the organizer's own rating); a second reviewer couldn't sign up from Chrome (the link asks for a Sched login with no sign-up or Google option). Validated by QA. Gabriel Mago (2026-10-21): the CFP doesn't send reviewer invites; the organizer shares the group link, and access can't be revoked once someone has it (related: ENG-2220)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

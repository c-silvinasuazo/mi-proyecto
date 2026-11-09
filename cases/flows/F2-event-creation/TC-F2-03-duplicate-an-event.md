---
id: TC-F2-03
title: Duplicate an event
flow: F2 — Event creation
type: Positive
env: Local
bugs: [ENG-84, ENG-271, ENG-2022]
last_run: failed
automation: not mapped yet
---

# TC-F2-03 — Duplicate an event

## Steps

Dashboard → Workspace → Events → Duplicate, all options checked

## Expected result

Copy keeps featured roles, registration form and type; no Eventbrite (ENG-84, ENG-2022, ENG-271)

## Automation

not mapped yet

## Last run

❌ 2026-10-14 (2.5): registration form not copied → ENG-2240. ENG-84 OK, ENG-2022 not reproduced, ENG-271 inconclusive. 2026-11-04 (production, qaengreminders duplicated into qaeng2233 with all options): ENG-2022 inconclusive (Eventbrite stays off, as on the original, but the original doesn't use Sched Ticketing, the reported case); ENG-2240 reproduced (the copy's Registration Form has none of the original's questions). Note: on Free Trial and Boost the editor now shows only "Registration Form", not the full Registration section seen on 2026-10-21

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

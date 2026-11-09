---
id: REG-108
title: CFP → Sched sync keeps titles, descriptions and the TBA date
level: Core
area: F7
priority: High
base_case: TC-F7-05
bugs: [ENG-33, ENG-2072]
last_run: passed
automation: 🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`
---

# REG-108 — CFP → Sched sync keeps titles, descriptions and the TBA date

## What to verify

CFP → Sched sync keeps titles, descriptions and the TBA date

Steps: follow the base case (TC-F7-05).

Prevents the return of: ENG-2072, ENG-33

## Automation

🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`

## Last run

✅ 2026-10-21 (cfp-staging): title, description and speaker OK. New sessions get today's date, not TBA (expected per ENG-2072); re-sync of an existing session not checked

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

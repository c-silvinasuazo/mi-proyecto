---
id: REG-105
title: Unfreezing sessions unlocks the list
level: Core
area: F9
priority: High
base_case: TC-F9-05
bugs: [ENG-517]
last_run: passed
automation: ✅ automated — `tests/eph/f9-sessions.spec.ts` (eph)
---

# REG-105 — Unfreezing sessions unlocks the list

## What to verify

Unfreezing sessions unlocks the list

Steps: follow the base case (TC-F9-05).

Prevents the return of: ENG-517

## Automation

✅ automated — `tests/eph/f9-sessions.spec.ts` (eph)

## Last run

✅ 2026-11-13 (eph, automated): ENG-2762 fixed; a removal from a page opened before the freeze now gets "frozen" and the session stays on the attendee's My Schedule.

✅ 2026-10-19 (production). Unfreeze takes a few minutes to reach attendees

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

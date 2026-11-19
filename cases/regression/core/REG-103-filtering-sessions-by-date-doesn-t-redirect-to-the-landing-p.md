---
id: REG-103
title: Filtering sessions by date doesn't redirect to the landing page
level: Core
area: F6
priority: High
bugs: [ENG-1816]
last_run: passed
automation: ✅ automated — `tests/eph/areas.spec.ts`
---

# REG-103 — Filtering sessions by date doesn't redirect to the landing page

## What to verify

Filtering sessions by date doesn't redirect to the landing page

Prevents the return of: ENG-1816

## Automation

✅ automated — `tests/eph/areas.spec.ts`

## Last run

✅ 2026-10-27 (production, qaengf6app on Boost): Filter By Date stays on the schedule and shows that day's session. Note: a session dated outside the event's dates doesn't show in the public schedule ("No schedule listed yet")

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

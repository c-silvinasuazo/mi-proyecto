---
id: TC-F6-02
title: Incomplete registration
flow: F6 — Registration and RSVP
type: Edge
env: Production
bugs: [ENG-1713, ENG-2169]
last_run: passed
automation: not mapped yet
---

# TC-F6-02 — Incomplete registration

## Steps

Leave the form midway, then finish

## Expected result

Counted as incomplete only until finished (ENG-1713, ENG-2169)

## Automation

not mapped yet

## Last run

✅ 2026-10-21/22 (production): a completed registrant shows in Registrants and not in Incomplete Registrations (ENG-2169 not reproduced; see TC-F6-01). A partially filled form couldn't be produced: creating a Sched account alone doesn't start a registration

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

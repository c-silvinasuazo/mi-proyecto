---
id: TC-F8-03
title: Session QR export
flow: F8 — Check-in, QR and badges
type: Positive
env: Local
bugs: [ENG-544, ENG-545, ENG-546, ENG-774]
last_run: passed
automation: not mapped yet
---

# TC-F8-03 — Session QR export

## Steps

Bulk Actions → Export Self Check-in QR Codes with some sessions selected

## Expected result

Only selected sessions; consistent layout and orientation (ENG-544, ENG-545, ENG-546, ENG-774)

## Automation

not mapped yet

## Last run

✅ 2026-10-14 locally (2 of 4 sessions). ✅ 2026-10-21 production (qaengreminders): exporting 1 of 2 sessions shows only that session; exporting both shows both. Notes: the QR alternates sides between sessions (right, then left; intended?) and the divider lines extend past the right edge of the page

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

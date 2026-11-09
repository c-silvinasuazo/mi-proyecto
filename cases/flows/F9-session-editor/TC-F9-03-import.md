---
id: TC-F9-03
title: Import
flow: F9 — Session editor
type: Positive
env: Local
bugs: [ENG-181, ENG-2050]
last_run: partial
automation: 🟡 placeholder — `tests/eph/f9-sessions.spec.ts`
---

# TC-F9-03 — Import

## Steps

Spreadsheet with secret = Y and feedback = Y

## Expected result

Completes; flags respected (ENG-181, ENG-2050; ✅ ENG-2050 verified fixed on 2026-10-27: Collect y/n = Y turns feedback on, N leaves it off. New rows need a unique ID in column A)

## Automation

🟡 placeholder — `tests/eph/f9-sessions.spec.ts`

## Last run

⚠️ 2026-10-19 (9.3). Local: the downloaded spreadsheet is empty (0 bytes) and the import isn't processed (local environment limitation). Production (qaeng2241): the import completes and both sessions appear (ENG-181 OK); empty Venue is set to "TBA". The secret session is hidden from the public schedule, but the editor doesn't show it as secret (to confirm). Feedback = Y not applied: ENG-2050 reproduced (known issue)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

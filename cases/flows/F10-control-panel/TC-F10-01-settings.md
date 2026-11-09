---
id: TC-F10-01
title: Settings
flow: F10 — Control Panel
type: Positive
env: Local
bugs: []
last_run: passed
automation: 🟡 placeholder — `tests/eph/f10-control-panel.spec.ts`
---

# TC-F10-01 — Settings

## Steps

Change name, dates, time zone and privacy

## Expected result

Saved; shown on the public site and in the header

## Automation

🟡 placeholder — `tests/eph/f10-control-panel.spec.ts`

## Last run

✅ 2026-10-19 (local, qaf2test12026): name changed to "QA F2 Test 1 edit" shows in the public header; time zone Pacific → Eastern shows EDT/EST by date (DST ends Nov 1) and sessions keep their clock times; event dates match the date filter. Special characters show OK in the header (seen in the ENG-241 test)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

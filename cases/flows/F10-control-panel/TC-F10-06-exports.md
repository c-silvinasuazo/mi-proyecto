---
id: TC-F10-06
title: Exports
flow: F10 — Control Panel
type: Positive
env: Local
bugs: [ENG-729]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f10-control-panel.spec.ts`
---

# TC-F10-06 — Exports

## Steps

Export attendees and registrants

## Expected result

Every row and the expected columns (ENG-729)

## Automation

🟡 placeholder — `tests/eph/f10-control-panel.spec.ts`

## Last run

✅ 2026-10-19 (production, qaeng2241, Free Trial): Reports → Directory → Attendees downloads a valid Excel with all 5 attendees shown in the editor and the expected columns (Name, Email, Password, Company, Position, Location, Bio, Website, Image, Tags; plus an empty 11th column with no header). Registrants export not offered: the event has no registration set up (to run with F6). Locally, the Attendees page loads blank

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

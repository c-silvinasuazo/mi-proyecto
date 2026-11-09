---
id: REG-124
title: "PD Hours: enabling doesn't fail, the rollup shows hours, the badge appears in the tooltip"
level: Core
area: PD
priority: High
bugs: [ENG-1214, ENG-2058, ENG-2068]
last_run: blocked
automation: 🟡 placeholder — `tests/eph/feedback-profiles.spec.ts`
---

# REG-124 — PD Hours: enabling doesn't fail, the rollup shows hours, the badge appears in the tooltip

## What to verify

PD Hours: enabling doesn't fail, the rollup shows hours, the badge appears in the tooltip

Prevents the return of: ENG-2068, ENG-2058, ENG-1214

## Automation

🟡 placeholder — `tests/eph/feedback-profiles.spec.ts`

## Last run

⛔ Blocked (2026-10-28): PD Hours isn't enabled on the QA test event (qaengreminders on Ultra; no Professional Development / CE Compliance menu, and /editor/ce-compliance doesn't open). Asked Marko to enable it (Professional Development tag in Schedmin and, per the April QA doc, the FEATURE_PD_HOURS_V2 gate). Update 2026-10-29: Saša enabled PD on qaengreminders (feature tag in Schedmin). Run 2026-10-29: ✅ PD Tracking set up with Session-Level Credit (cap 8 hrs) and approved with no "Failed to create prerequisite" error; 2 attendees finalized (ENG-2068 OK). ✅ The PD Hours badge shows in the session tooltip and detail view on the public site (ENG-1214 OK). Note: the 1.00 PD credit on qa public and qa private was enabled automatically when PD Hours was set up, not configured by QA (reproduces ENG-1543, commented 2026-10-30). ⛔ Org rollup (ENG-2058) not testable: the test org (test inc0) has no Professional Development menu in the Dashboard (only Events and Settings), so the org-level rollup needs to be enabled for a QA org. Checks to run once enabled: Activate hours without "Failed to create prerequisite" (ENG-2068); after finalizing the event report, the org PD rollup shows hours, attendees and the event (ENG-2058); the PD Hours badge shows in the session tooltip and detail view (ENG-1214)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

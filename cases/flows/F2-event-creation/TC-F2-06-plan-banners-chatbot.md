---
id: TC-F2-06
title: Plan, banners, chatbot
flow: F2 — Event creation
type: Edge
env: Local + production
bugs: [ENG-1556, ENG-1997]
last_run: partial
automation: not mapped yet
---

# TC-F2-06 — Plan, banners, chatbot

## Steps

Review the new event's Dashboard and sections

## Expected result

Plan correct; nothing covers menus (ENG-1556, ENG-1997)

## Automation

not mapped yet

## Last run

⚠️ 2026-10-14 (2.6): plan and banners OK; the chatbot doesn't load locally, check on production. 2026-10-16 (production): the chatbot loads on sched.com/directory and doesn't cover the menu or search; still to check inside the Dashboard and editor. ✅ 2026-10-16 (production, editor of qaeng2241): the chatbot loads and doesn't cover the menu, banner or main buttons; its popup overlaps the right edge of the onboarding card and can be closed. Also loads on dashboard.sched.com (seen 2026-10-19)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

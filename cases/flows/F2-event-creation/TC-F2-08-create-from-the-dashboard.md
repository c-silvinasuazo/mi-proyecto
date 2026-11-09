---
id: TC-F2-08
title: Create from the Dashboard
flow: F2 — Event creation
type: Positive
env: Production
bugs: [ENG-446]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f2-events.spec.ts`
---

# TC-F2-08 — Create from the Dashboard

## Steps

dashboard.sched.com → My Events → Create New Event → organization, name, URL → Create

## Expected result

Event created in the selected org; opens the event editor, logged in; no redirect to Contact Us (ENG-446)

## Automation

🟡 placeholder — `tests/eph/f2-events.spec.ts`

## Last run

✅ 2026-10-16 (2.8; qaf2dashboard, QA Test Org): opens /editor, logged in, plan Free Trial. No date fields: dates default to Dec 16–17, 2026 (61 days ahead). Name and URL are prefilled as real values ("New Event", "event…"), not placeholders (UX question for Product)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

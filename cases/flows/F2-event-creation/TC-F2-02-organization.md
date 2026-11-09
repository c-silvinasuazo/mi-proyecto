---
id: TC-F2-02
title: Organization
flow: F2 — Event creation
type: Positive
env: Local
bugs: [ENG-985]
last_run: partial
automation: not mapped yet
---

# TC-F2-02 — Organization

## Steps

Create an event choosing an existing org

## Expected result

Event in the right org and department; org not requested twice (ENG-985)

## Automation

not mapped yet

## Last run

⚠️ 2026-10-14 (/signup, local): the form only offers creating a new org. ✅ 2026-10-16 (Dashboard → Create New Event, production): existing orgs are listed (QA eng, QA Test Org) and the event lands in the selected org. Menus differ by org (QA Test Org shows Badges, QA eng doesn't)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

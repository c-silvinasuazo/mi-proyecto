---
id: TC-F4-02
title: Guest checkout + share
flow: F4 — Ticket payments
type: Positive
env: dev2
bugs: [ENG-101]
last_run: passed
automation: 🟡 placeholder — `tests/dev2/f4-payments.spec.ts`
---

# TC-F4-02 — Guest checkout + share

## Steps

Buying for Others → Continue as Guest → Manage Tickets → Share Ticket

## Expected result

The recipient gets the email; no duplicate (ENG-101)

## Automation

🟡 placeholder — `tests/dev2/f4-payments.spec.ts`

## Last run

✅ 2026-10-13 (4.2). Change .sched.com to .dev2.sched.co in email links. No option to reassign a shared ticket (question for the team). ✅ 2026-10-22 (after the ENG-2281 fix): sharing from the token link works; the recipient gets the ticket email and can open it from their own link, and the original purchaser no longer has it

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

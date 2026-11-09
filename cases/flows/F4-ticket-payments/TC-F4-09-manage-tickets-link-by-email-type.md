---
id: TC-F4-09
title: Manage Tickets link by email type
flow: F4 — Ticket payments
type: Positive
env: dev2
bugs: [ENG-2281]
last_run: passed
automation: 🟡 placeholder — `tests/dev2/f4-payments.spec.ts`
---

# TC-F4-09 — Manage Tickets link by email type

## Steps

Guest purchase with three kinds of email; check the order email's "Manage Tickets" link

## Expected result

Token link for guest emails (never in Sched, or never signed in); login link for accounts that have signed in (Bill So, ENG-2281)

## Automation

🟡 placeholder — `tests/dev2/f4-payments.spec.ts`

## Last run

✅ 2026-10-21/22: new email → token link, opens the ticket on dev2 (change the host to .dev2.sched.co and keep the token); existing email that never signed in (added with "Add", no invite) → token link; account that has signed in → /login. The thank-you screen shows the purchaser email and points to the order email, with no direct access. The browser isn't logged into an existing account after a guest purchase with its email, and the ticket shows when that account logs in

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

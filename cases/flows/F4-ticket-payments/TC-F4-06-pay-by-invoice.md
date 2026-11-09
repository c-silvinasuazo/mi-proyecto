---
id: TC-F4-06
title: Pay by invoice
flow: F4 — Ticket payments
type: Positive
env: dev2
bugs: []
last_run: passed
automation: 🟡 placeholder — `tests/dev2/f4-payments.spec.ts`
---

# TC-F4-06 — Pay by invoice

## Steps

Buy with invoice as a guest; check Registration → Guest Buyers; pay the invoice

## Expected result

The ticket is assigned automatically: a guest buyer shows under Guest Buyers, a logged-in buyer under Attendees. Registrants only lists people who completed the registration form (Gabriel Mago, 2026-10-27)

## Automation

🟡 placeholder — `tests/dev2/f4-payments.spec.ts`

## Last run

✅ 2026-10-27 (dev2, billmtttest42): the guest buyer who paid by invoice (2026-10-22, After Party) shows under Guest Buyers with the ticket assigned; the Stripe invoice was paid on 2026-10-26 with the test card. The earlier "doesn't show in any list" note came from checking Registrants and Attendees instead of Guest Buyers. Not compared on production (no access to demo2025's Control Panel). In Stripe test mode the invoice isn't emailed; send it from the Stripe Dashboard. Turn Pay by Invoice off after testing

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

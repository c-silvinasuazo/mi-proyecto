---
id: TC-F4-08
title: Guest checkout without paying
flow: F4 — Ticket payments
type: Negative
env: dev2
bugs: [ENG-2281]
last_run: passed
automation: 🟡 placeholder — `tests/dev2/f4-payments.spec.ts`
---

# TC-F4-08 — Guest checkout without paying

## Steps

Guest checkout with an email that already has a ticket; stop at the Stripe page and abandon

## Expected result

The browser gets no access to that email's tickets (ENG-2281)

## Automation

🟡 placeholder — `tests/dev2/f4-payments.spec.ts`

## Last run

✅ 2026-10-21: the same browser shows "Incomplete Order" and the event page shows no ticket or manage options. ?guest_restored=1 without a token doesn't grant access either

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

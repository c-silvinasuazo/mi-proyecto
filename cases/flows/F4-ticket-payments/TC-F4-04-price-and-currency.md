---
id: TC-F4-04
title: Price and currency
flow: F4 — Ticket payments
type: Edge
env: dev2
bugs: [ENG-946, SCH-16]
last_run: partial
automation: 🟡 placeholder — `tests/dev2/f4-payments.spec.ts`
---

# TC-F4-04 — Price and currency

## Steps

Compare Control Panel, checkout and email

## Expected result

Same price and currency everywhere (ENG-946, SCH-16)

## Automation

🟡 placeholder — `tests/dev2/f4-payments.spec.ts`

## Last run

⚠️ 2026-10-14: USD OK in the ticket and coupon forms (SCH-16 not reproduced). Formats differ ("81,78 US$" vs "USD 0.00"). ✅ 2026-10-22 (dev2): with the currency set to EUR in Payments, the editor shows "80,00 €" and the public ticket list, the Stripe payment page and the order flow show euros too (SCH-16 not reproduced). Currency set back to USD afterwards

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

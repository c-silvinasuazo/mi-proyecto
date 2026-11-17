---
id: TC-F4-03
title: Coupon
flow: F4 — Ticket payments
type: Positive
env: dev2
bugs: [ENG-266]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f4-payments.spec.ts` (skips until eph has Stripe test mode, ENG-2832)
---

# TC-F4-03 — Coupon

## Steps

Coupon on 3 tickets → edit validity → buy with it

## Expected result

The coupon keeps the 3 tickets; correct discount (ENG-266)

## Automation

🟡 placeholder — `tests/eph/f4-payments.spec.ts` (skips until eph has Stripe test mode, ENG-2832)

## Last run

✅ 2026-10-13 (4.3). USD 80 − 16 + fee 1.62 = 65.62

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

---
id: TC-F4-20
title: CA GST, UK VAT, AU GST and US state tax behave as before
flow: F4 — Ticket payments
type: Positive
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)
---

# TC-F4-20 — CA GST, UK VAT, AU GST and US state tax behave as before

## Preconditions

- One event per existing tax, set up as today (no new fields).

## Steps

1. On each, check the ticket picker notice and buy a ticket with the test card (M14).

## Expected result

Same notice, rate and Stripe lines as before the release.

## Automation

🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

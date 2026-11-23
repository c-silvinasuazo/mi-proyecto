---
id: TC-F4-23
title: Checkout with a wrong or archived rate ID
flow: F4 — Ticket payments
type: Negative
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)
---

# TC-F4-23 — Checkout with a wrong or archived rate ID

## Preconditions

- A EUR event with a merchant tax ID and a rate ID that doesn't exist, then one that is archived in Stripe.

## Steps

1. Try to buy a ticket with each (M11).

## Expected result

Record what happens: the expected result isn't defined in the ticket yet (ask for it). The buyer must not be charged a wrong amount silently.

## Automation

🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

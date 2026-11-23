---
id: TC-F4-18
title: Two events with different rates each charge their own rate
flow: F4 — Ticket payments
type: Positive
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)
---

# TC-F4-18 — Two events with different rates each charge their own rate

## Preconditions

- Two EUR events, one with a 19% rate and one with another rate (for example 7%).
- Tax rates in the Stripe test account connected to qaeng2884vat on pr-1906 (`acct_1Uf2HfDp7krj3Dk1`, created 2026-11-23, all exclusive): Germany VAT 19% `txr_1Uf3DdDp7krj3Dk1N0A8Gj5k`, Germany VAT 7% reduced `txr_1Uf3E6Dp7krj3Dk1qP7bSCT9`, Switzerland VAT 8.1% `txr_1Uf3EYDp7krj3Dk1TeTWY14b`. Merchant tax IDs in the same account (Invoices settings, 2026-11-23): DE VAT DE123456789 `txi_1Uf3GWDp7krj3Dk1rtebrovp`, CH VAT CHE-123.456.789 MWST `txi_1Uf3GWDp7krj3Dk1S2EtlEGK`. Rodolfo also created rates and a merchant tax ID (`txi_1Uf3BELbWfZlgASXTPrxJs1C`) in his own Stripe test account; those only work for an event connected to that account. One event with the 19% rate and one with the 7% rate.

## Steps

1. Buy a ticket on each event.

## Expected result

Each checkout charges its own event's rate.

## Automation

🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

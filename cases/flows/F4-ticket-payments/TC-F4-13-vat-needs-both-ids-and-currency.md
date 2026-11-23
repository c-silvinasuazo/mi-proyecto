---
id: TC-F4-13
title: VAT turns on only with both IDs and a non-CAD/GBP/AUD/USD currency
flow: F4 — Ticket payments
type: Negative
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)
---

# TC-F4-13 — VAT turns on only with both IDs and a non-CAD/GBP/AUD/USD currency

## Preconditions

- A EUR event with a paid ticket and Stripe in test mode.
- Tax rates in the Stripe test account connected to qaeng2884vat on pr-1906 (`acct_1Uf2HfDp7krj3Dk1`, created 2026-11-23, all exclusive): Germany VAT 19% `txr_1Uf3DdDp7krj3Dk1N0A8Gj5k`, Germany VAT 7% reduced `txr_1Uf3E6Dp7krj3Dk1qP7bSCT9`, Switzerland VAT 8.1% `txr_1Uf3EYDp7krj3Dk1TeTWY14b`. Merchant tax IDs in the same account (Invoices settings, 2026-11-23): DE VAT DE123456789 `txi_1Uf3GWDp7krj3Dk1rtebrovp`, CH VAT CHE-123.456.789 MWST `txi_1Uf3GWDp7krj3Dk1S2EtlEGK`. Rodolfo also created rates and a merchant tax ID (`txi_1Uf3BELbWfZlgASXTPrxJs1C`) in his own Stripe test account; those only work for an event connected to that account. Uses the 19% rate.

## Steps

1. Save only the rate ID; open the ticket picker and go to card checkout (M4).
2. Save only the merchant tax ID; repeat (M5).
3. Save both; repeat.
4. Clear both; repeat.

## Expected result

With one ID or none: no notice on the ticket picker and no tax line in Stripe. With both: the notice and the VAT line show.

## Automation

🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

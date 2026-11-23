---
id: TC-F4-14
title: Ticket picker notice says VAT for EUR/CHF, Tax for other currencies
flow: F4 — Ticket payments
type: Positive
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)
---

# TC-F4-14 — Ticket picker notice says VAT for EUR/CHF, Tax for other currencies

## Preconditions

- Events in EUR, CHF and another currency without a tax of its own (for example SEK), each with both new IDs saved and a paid ticket.
- Tax rates in the Stripe test account connected to qaeng2884vat on pr-1906 (`acct_1Uf2HfDp7krj3Dk1`, created 2026-11-23, all exclusive): Germany VAT 19% `txr_1Uf3DdDp7krj3Dk1N0A8Gj5k`, Germany VAT 7% reduced `txr_1Uf3E6Dp7krj3Dk1qP7bSCT9`, Switzerland VAT 8.1% `txr_1Uf3EYDp7krj3Dk1TeTWY14b`. Merchant tax IDs in the same account (Invoices settings, 2026-11-23): DE VAT DE123456789 `txi_1Uf3GWDp7krj3Dk1rtebrovp`, CH VAT CHE-123.456.789 MWST `txi_1Uf3GWDp7krj3Dk1S2EtlEGK`. Rodolfo also created rates and a merchant tax ID (`txi_1Uf3BELbWfZlgASXTPrxJs1C`) in his own Stripe test account; those only work for an event connected to that account. EUR events use the 19% rate; the CHF event uses the 8.1% rate.

## Steps

1. Open each event's ticket picker and select a paid ticket.

## Expected result

EUR and CHF show "VAT will be added to the total at checkout." The other currency shows "Tax will be added to the total at checkout." Only one tax notice shows.

## Automation

🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

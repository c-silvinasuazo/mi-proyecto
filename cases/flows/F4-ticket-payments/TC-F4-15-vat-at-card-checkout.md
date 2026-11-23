---
id: TC-F4-15
title: Card checkout charges the organizer's VAT rate as its own line
flow: F4 — Ticket payments
type: Positive
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)
---

# TC-F4-15 — Card checkout charges the organizer's VAT rate as its own line

## Preconditions

- A EUR event with a 19% rate (txr_…) and a merchant tax ID saved, a paid ticket, the Sched fee absorbed by the organizer, Stripe in test mode.
- On eph, the event's Stripe test account is created from Registration → Payments → connect (Stripe onboarding with test data; it ends on sched.com, close that tab). The tax rate is created in that connected account (VAT, 19%, exclusive, DE; percentage and country can't change later). For card checkout the merchant tax ID can be a placeholder starting with txi_: card checkout sends only the rate to Stripe.
- Tax rates in the Stripe test account connected to qaeng2884vat on pr-1906 (`acct_1Uf2HfDp7krj3Dk1`, created 2026-11-23, all exclusive): Germany VAT 19% `txr_1Uf3DdDp7krj3Dk1N0A8Gj5k`, Germany VAT 7% reduced `txr_1Uf3E6Dp7krj3Dk1qP7bSCT9`, Switzerland VAT 8.1% `txr_1Uf3EYDp7krj3Dk1TeTWY14b`. Merchant tax IDs in the same account (Invoices settings, 2026-11-23): DE VAT DE123456789 `txi_1Uf3GWDp7krj3Dk1rtebrovp`, CH VAT CHE-123.456.789 MWST `txi_1Uf3GWDp7krj3Dk1S2EtlEGK`. Rodolfo also created rates and a merchant tax ID (`txi_1Uf3BELbWfZlgASXTPrxJs1C`) in his own Stripe test account; those only work for an event connected to that account. Uses the 19% rate.

## Steps

1. Buy 1 ticket with the 4242 test card (M1).
2. Buy a quantity or price whose VAT has a fraction of a cent, for example 3 × €9.99 (M2).
3. Check the Stripe payment page, then the receipt in the Stripe Dashboard (test mode doesn't email receipts).

## Expected result

Check the VAT line on Stripe's page before paying: after paying, Stripe goes to sched.com, and on eph the order may stay in progress (webhook secret).


The payment page and the receipt show VAT as a separate line at 19%. The total equals net plus VAT, within 1 cent. Human check of the hosted payment page: the VAT line reads clearly to a buyer.

## Automation

🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

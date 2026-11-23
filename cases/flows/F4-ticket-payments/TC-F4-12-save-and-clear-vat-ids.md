---
id: TC-F4-12
title: Save and clear the VAT IDs in Schedmin
flow: F4 — Ticket payments
type: Positive
env: eph
bugs: [ENG-2884]
last_run: not run
automation: ✅ `tests/eph/eng-2884-vat.spec.ts` (skips until ENG-2884 is on eph and the Schedmin login is set)
---

# TC-F4-12 — Save and clear the VAT IDs in Schedmin

## Preconditions

- Staff access to Schedmin.
- An event in EUR (on eph: demofriends).

## Steps

1. Schedmin → the event → Set Sales Tax Stripe IDs.
2. Enter a tax rate ID (txr_…) and a merchant tax ID (txi_…) in the new fields; Save.
3. Reload the event in Schedmin.
4. Clear both fields; Save; reload.

## Expected result

After saving, both fields show the IDs. After clearing, both are empty, and new orders get no tax (checked in TC-F4-13). The other taxes' fields (CA GST, UK VAT, AU GST, US state) keep their values.

## Automation

✅ `tests/eph/eng-2884-vat.spec.ts` (skips until ENG-2884 is on eph and the Schedmin login is set)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

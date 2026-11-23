---
id: TC-F4-24
title: Invoice checkout shows VAT and the organizer's VAT number
flow: F4 — Ticket payments
type: Positive
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)
---

# TC-F4-24 — Invoice checkout shows VAT and the organizer's VAT number

## Preconditions

- A EUR event with both IDs and Pay by Invoice on.

## Steps

1. Buy a ticket by invoice; open the invoice in the Stripe Dashboard.

## Expected result

The invoice has a VAT line at the event's rate and the organizer's VAT number. In scope but without an acceptance criterion yet (Antonio's comment on ENG-2884).

## Automation

🟡 placeholder — `tests/eph/eng-2884-vat.spec.ts` (skips until eph has Stripe test mode, ENG-2832, and ENG-2884 is on eph)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

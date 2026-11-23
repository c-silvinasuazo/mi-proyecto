---
id: TC-F4-22
title: New PHP with the old payment binary charges no VAT
flow: F4 — Ticket payments
type: Edge
env: eph
bugs: [ENG-2884]
last_run: not run
automation: 👤 manual (needs the eph set up with the new PHP and payment binary v2.9.1)
---

# TC-F4-22 — New PHP with the old payment binary charges no VAT

## Preconditions

- The new PHP deployed with the old binary (v2.9.1); a EUR event with both IDs.

## Steps

1. Open the ticket picker; buy a ticket (M10).

## Expected result

Known deploy-order behavior: the notice shows but Stripe charges no VAT. Confirms why Go must ship first.

## Automation

👤 manual (needs the eph set up with the new PHP and payment binary v2.9.1)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

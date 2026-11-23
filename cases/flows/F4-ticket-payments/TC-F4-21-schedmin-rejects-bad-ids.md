---
id: TC-F4-21
title: Schedmin rejects IDs without the txr_ / txi_ prefix
flow: F4 — Ticket payments
type: Negative
env: eph
bugs: [ENG-2884]
last_run: not run
automation: ✅ (pending decision D7) `tests/eph/eng-2884-vat.spec.ts` (skips until ENG-2884 is on eph and the Schedmin login is set)
---

# TC-F4-21 — Schedmin rejects IDs without the txr_ / txi_ prefix

## Preconditions

- Staff access to Schedmin; ENG-2884 on the environment.

## Steps

1. In the new fields, save a rate ID that doesn't start with txr_ (for example txi_…).
2. Save a merchant tax ID that doesn't start with txi_.

## Expected result

Each save is rejected with a message that says why, and the saved values don't change. If D7 decides against the check, drop this case.

## Automation

✅ (pending decision D7) `tests/eph/eng-2884-vat.spec.ts` (skips until ENG-2884 is on eph and the Schedmin login is set)

## Last run

Not run yet: ENG-2884 is in review (2026-11-22).

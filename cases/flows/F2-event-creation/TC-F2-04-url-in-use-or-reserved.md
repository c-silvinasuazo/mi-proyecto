---
id: TC-F2-04
title: URL in use or reserved
flow: F2 — Event creation
type: Negative
env: Local
bugs: []
last_run: passed
automation: 🟡 placeholder — `tests/eph/f2-events.spec.ts`
---

# TC-F2-04 — URL in use or reserved

## Steps

URL of an existing event; then "admin"

## Expected result

"Create event" disabled

## Automation

🟡 placeholder — `tests/eph/f2-events.spec.ts`

## Last run

✅ 2026-10-14 (2.2, 2.3). The warning says "event name … already taken" though it's the URL; no event## suggestion. ✅ 2026-10-16 (Dashboard, production): taken URL shows "Your URL is not available, try qaeng2241a.sched.com"; "admin" shows "This URL is not available."; Create disabled in both

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

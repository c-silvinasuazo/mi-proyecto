---
id: TC-F3-08
title: Shared session with the Dashboard
flow: F3 — Login and SSO
type: Positive
env: Local
bugs: [ENG-1780]
last_run: passed
automation: ✅ automated — `tests/eph/areas.spec.ts`
---

# TC-F3-08 — Shared session with the Dashboard

## Steps

Control Panel → Dashboard → event; log out in the Dashboard; reload the event

## Expected result

No re-login while moving; logout ends both (ENG-1780)

## Automation

✅ automated — `tests/eph/areas.spec.ts`

## Last run

✅ 2026-10-14 (3.7), after building the Dashboard. ✅ 2026-10-16 (3.10, 3.11, production, Google SSO session): no re-login; logout ends both. After logout, the Dashboard shows "Oh, something went wrong" for under a second before redirecting to login → ENG-2256. The same screen also appeared when opening the Dashboard logged in, but only in a private/guest window; in a regular window, logged in is not reproduced

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

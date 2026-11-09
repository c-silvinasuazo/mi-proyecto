---
id: TC-F9-05
title: Freeze / unfreeze
flow: F9 — Session editor
type: Edge
env: Local
bugs: [ENG-517]
last_run: failed
automation: 🟡 placeholder — `tests/eph/f9-sessions.spec.ts`
---

# TC-F9-05 — Freeze / unfreeze

## Steps

Freeze and unfreeze sessions

## Expected result

The list unlocks (ENG-517)

## Automation

🟡 placeholder — `tests/eph/f9-sessions.spec.ts`

## Last run

❌ 2026-10-16 (production, qaeng2241, Boost plan): freeze doesn't block attendees. The frozen notice shows, but the attendee can add and remove sessions; the change persists after reload and the admin's counts update → ENG-2262. 2026-10-19: not reproducible; frozen sessions show a snowflake and the attendee can't remove them. ENG-2262 canceled. ✅ 2026-10-19 (production): unfreezing one session works for both attendees and the other session stays frozen; not immediate (unfrozen for attendees after 5 minutes). ENG-517 verified. Freeze needs the Boost or Ultra plan

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

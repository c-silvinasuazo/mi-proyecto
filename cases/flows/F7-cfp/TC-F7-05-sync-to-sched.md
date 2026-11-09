---
id: TC-F7-05
title: Sync to Sched
flow: F7 — CFP
type: Positive
env: cfp-staging
bugs: [ENG-33, ENG-2072]
last_run: passed
automation: 🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`
---

# TC-F7-05 — Sync to Sched

## Steps

Sync applicants → sessions

## Expected result

Title and formatting OK; speaker on the session (ENG-33). New sessions get today's date (the API doesn't allow TBA; ENG-2072); re-syncing an existing session keeps its times

## Automation

🟡 placeholder — `tests/cfp/f7-cfp.spec.ts`

## Last run

✅ 2026-10-21 (cfp-staging → qaengreminders): with the Applications status filter on "Final Confirmation", Sync with Sched completes (Sync Applicants, Sync Sessions and Attach Applicants to Sessions on). The session is created (unpublished) with its title and description, the speaker is created and attached, and the application in "Initial Submission" isn't synced. The new session gets the sync time as its date (Oct 21, 3:56–3:56 PM): expected per Marko in ENG-2072 (the API doesn't allow TBA when creating a session). Re-sync of an existing session not checked. Earlier block ("Please select at least one status") was because no status filter was set (Gabriel Mago)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

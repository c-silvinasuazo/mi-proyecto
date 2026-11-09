---
id: TC-F7-06
title: Export
flow: F7 — CFP
type: Positive
env: cfp-staging
bugs: [ENG-40]
last_run: passed
automation: ✅ automated — `tests/cfp-readonly/cfp-organizer.spec.ts` ((to confirm on first run))
---

# TC-F7-06 — Export

## Steps

Export 100+ submissions

## Expected result

Every row, including conditional answers (ENG-40)

## Automation

✅ automated — `tests/cfp-readonly/cfp-organizer.spec.ts` ((to confirm on first run))

## Last run

History, 2026-10-20 (cfp-staging): Applications → Download all shows an upsell ("Get the most data from your forms!" → Upgrade Now), on Free Trial and also with the event on Ultra. The CFP export seemed to depend on a separate CFP plan. ✅ 2026-10-21 (cfp-staging, qaengreminders on Boost): "Download all" works once the event is on a current paid plan. Earlier attempts showed the upsell because the event was on Engage, a legacy plan (Gabriel Mago, 2026-10-21; Ultra on 2026-10-20 also showed it, possibly without reloading). Volume (100+ submissions) not checked. Gabriel Mago (2026-10-21): it's only blocked on Free Trial; any paid plan enables it. Event back on Free Trial after the test

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

---
id: REG-216
title: "Messaging works: search, scroll and clearing recipients"
level: Extended
area: CFP
bugs: [ENG-157, ENG-158, ENG-159]
last_run: passed
automation: ✅ automated — `tests/eph/f7-cfp.spec.ts` (eph; opt-in with EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and applications)
---

# REG-216 — Messaging works: search, scroll and clearing recipients

## What to verify

Messaging works: search, scroll and clearing recipients

Prevents the return of: ENG-157, ENG-158, ENG-159

## Automation

✅ automated — `tests/eph/f7-cfp.spec.ts` (eph; opt-in with EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and applications)

## Last run

✅ 2026-11-16 (automated, pr-309 eph): with nine applications, a search by speaker name finds their application (ENG-157), dragging the list's scrollbar scrolls it and the list stays open (ENG-158), Cancel clears the recipients (ENG-159); nothing sent

✅ 2026-11-03 (production CFP, qaengreminders): in Messages → new message, searching recipients, adding several, scrolling the recipient list and removing recipients all work (message not sent)

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

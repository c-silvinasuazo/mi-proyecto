---
id: REG-222
title: A profile photo isn't reused in another profile and can be updated
level: Extended
area: Profiles
bugs: [ENG-2087, ENG-2133]
last_run: passed
automation: 🟡 placeholder — `tests/eph/feedback-profiles.spec.ts`
---

# REG-222 — A profile photo isn't reused in another profile and can be updated

## What to verify

A profile photo isn't reused in another profile and can be updated

Prevents the return of: ENG-2087, ENG-2133

## Automation

🟡 placeholder — `tests/eph/feedback-profiles.spec.ts`

## Last run

✅ 2026-11-03 (production, qaengreminders): two attendees got different photos and each profile kept its own; updating one attendee's photo shows the new one and doesn't change the other

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

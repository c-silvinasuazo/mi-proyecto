---
id: TC-F7-01
title: Submit a proposal
flow: F7 — CFP
type: Positive
env: cfp-staging (via /editor/callforpapers on a dev domain)
bugs: [ENG-503, ENG-1328]
last_run: passed
automation: ✅ automated — `tests/cfp-readonly/cfp-organizer.spec.ts` ((to confirm on first run))
---

# TC-F7-01 — Submit a proposal

## Steps

Verify email → co-speaker, file, conditional questions → submit

## Expected result

One correct confirmation email (ENG-503, ENG-1328)

## Automation

✅ automated — `tests/cfp-readonly/cfp-organizer.spec.ts` ((to confirm on first run))

## Last run

✅ 2026-10-20 (cfp-staging, form "qa F7 form" on qaengreminders, organizer account +30): the applicant submits, then gets "Verify your email"; after confirming, exactly one "You submitted new application" email per applicant (ENG-1328 not reproduced); the organizer gets "You received new application". The application shows the custom answers (multiple choice, short answer) and the uploaded file. Not run: co-speaker. Retest 2026-10-21: with the condition set up from the Multiple Choice question (per Gabriel Mago), the follow-up question shows only when "Workshop" is chosen; a co-speaker can be added (Maximum number of speakers set to 2); the applicant gets the verification and a single confirmation; the application shows the conditional answer, the file and the co-speaker. Notes: conditional questions are set up from Multiple Choice, Checkboxes or Dropdown questions (Gabriel Mago, 2026-10-21), and work; the organizer is notified before the applicant verifies; the applicant's confirmation copy is generic ("New application submitted"); the success URL ends in /success/success; the public form shows "Provide description" when no description is set; custom questions must be added with "+ Add Form Question" and saved. cfp-staging delivers emails

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

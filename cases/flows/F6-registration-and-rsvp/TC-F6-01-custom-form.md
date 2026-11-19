---
id: TC-F6-01
title: Custom form
flow: F6 — Registration and RSVP
type: Positive
env: Production
bugs: [ENG-1044, ENG-1779]
last_run: passed
automation: 🟡 placeholder — `tests/eph/f6-registration.spec.ts`
---

# TC-F6-01 — Custom form

## Steps

Logged out → registration → login or signup from the form → submit with a file

## Expected result

Login options shown; answers saved and in the report (ENG-1779, ENG-1044)

## Automation

🟡 placeholder — `tests/eph/f6-registration.spec.ts`

## Last run

✅ 2026-10-21 (production, qaengreminders on Boost): the Registration menu shows on Boost (it didn't on Engage, a legacy plan). New form with a required question, a Yes/No question with a conditional follow-up, and a file upload. Registering as a new attendee from a logged-out window: the required field blocks submit, the follow-up shows only for "Yes", and there's a confirmation; the registrant shows in Registrants with answers, not in Incomplete Registrations (this also covers TC-F6-02 / ENG-2169: a completed registrant doesn't stay in Incomplete Registrations; a partially filled form couldn't be produced, since creating a Sched account alone doesn't start a registration). File upload in the form works (validated by QA). Note (2026-10-22): for this registration the PDF doesn't show in the registrant's profile or in the export (the question was optional). Registrants export (2026-10-22, Boost): Reports → Registration downloads a CSV with the registrant, their details, the Yes/No answer and the conditional answer in its own column. Notes: a column with a numeric header (1792606281787) and a "Question name" column, both empty; the conditional column name uses double backslashes. History (2026-10-20): blocked on Engage and Ultra (production, qaengreminders): the Registration menu only showed on Free Trial, where the event is hidden; it disappears on Engage and Ultra. A form built on Free Trial doesn't show on the public site after moving to Engage (signing up only shows the standard attendee profile). Needs Sched to enable registration on a test event (asked Marko). ENG-1422 (pre-highlighted option) not reproduced on dev2

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

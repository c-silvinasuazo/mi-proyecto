---
id: TC-F9-02
title: Rich text
flow: F9 — Session editor
type: Positive
env: Local + App
bugs: [ENG-1202]
last_run: partial
automation: not mapped yet
---

# TC-F9-02 — Rich text

## Steps

Bold, italic, list, centered

## Expected result

Same on web, apps, print and PDF (ENG-1202)

## Automation

not mapped yet

## Last run

⚠️ 2026-10-19 (9.2, local, web): bold, italic, bulleted and numbered lists and centered text stay the same in the editor, the public session page and /print/all. The view opened by the public schedule's print icon doesn't show descriptions (to confirm whether intended). No PDF download found on the web. Apps: ✅ 2026-10-23 (Android, Samsung, Sched app 1.63.0): a session with a description ("qa capacity") shows it in the app. The earlier "no description" finding (ENG-2294, canceled) was because the session used had no description saved

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

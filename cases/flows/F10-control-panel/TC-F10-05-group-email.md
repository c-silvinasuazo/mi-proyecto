---
id: TC-F10-05
title: Group email
flow: F10 — Control Panel
type: Positive
env: Production
bugs: []
last_run: blocked
automation: not mapped yet
---

# TC-F10-05 — Group email

## Steps

Email a group of attendees

## Expected result

Only selected recipients; right name and links

## Automation

not mapped yet

## Last run

⛔ Blocked by design (2026-10-20). On a new organizer account/event (qaengreminders, Ultra), choosing a group (counts OK: Attendees 2, Attendees w/out a schedule 1) shows "This feature needs to be enabled by your Account Manager first to prevent spam abuse and malicious content" (anti-spam "Block Messaging"). Can't be tested unless Sched enables messaging. On qaengf10 (2026-10-19) the UI let me send instead, and the message stayed in "sending" and never arrived. Marko (2026-10-21): works as expected as long as the message is blocked; the rest will be polished later

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.

# Test cases

One Markdown file per test case, grouped by flow, app and regression level. Exported from the Notion page [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) on 2026-11-09; from now on, edit the cases here.

## How to read the cases

- Case IDs: TC-F<flow>-NN for flow cases and REG-NNN for regression checks. Each REG check points to the Linear bug it prevents from coming back.
- Type: Positive, Negative or Edge.
- Env: Local = local Docker; Production = own "qa" test event on production; dev2 = only F4 (Stripe test mode; set up with Bill; payments and web questions now go to Rodolfo); cfp-staging = via /editor/callforpapers on a dev domain; App = store app or test build. Where to test is defined in the Protected Flows page.
- Notes: ✅ OK, ⚠️ partial or observation, ❌ failed. Numbers in parentheses (1.1, 2.1…) match the execution doc.
- Automation: ✅ automated · 🟡 placeholder (`test.fixme`, to record) · 👤 stays manual. Taken from `COVERAGE.md` and the test titles in `tests/`.
- Last run: `passed`, `partial`, `failed`, `blocked`, `inconclusive` or `not run`, taken from the latest notes.

To add a case, copy [TEMPLATE.md](TEMPLATE.md) into the right folder.

## Regression levels

| Level | What goes in | When it runs | Target duration |
| --- | --- | --- | --- |
| Smoke | Happy path of the protected flows, plus fixed Urgent / High bugs in them | Every production deploy and before sign-off | 30 min or less |
| Core | All flows, plus fixed High bugs and bugs that were reopened | Every release / end of sprint | 2–3 h |
| Extended | Fixed Medium / Low bugs, mobile parity, formatting | Before larger releases or when an area is touched | Per area |

Rules: every Urgent / High bug that gets closed adds a REG check to Smoke or Core, and a bug that gets reopened moves up one level. A bug marked "Closed" in Linear doesn't mean the fix was verified: the first run is the verification.

Known issues (open bugs whose checks will fail until fixed): ENG-286, ENG-271, ENG-2240, ENG-589, ENG-40, ENG-2220, ENG-2221, ENG-241, ENG-544, ENG-545, ENG-546, ENG-774, ENG-1302, ENG-1568. Not reproduced in the October 2026 run (still open in Linear when checked): ENG-606, ENG-894, ENG-2169, ENG-1328, ENG-1565, ENG-2165, SCH-16.

## Contents

| Folder | Cases |
| --- | --- |
| [F1 — Free trial signup](flows/F1-free-trial-signup/README.md) | 9 |
| [F2 — Event creation](flows/F2-event-creation/README.md) | 8 |
| [F3 — Login and SSO](flows/F3-login-and-sso/README.md) | 8 |
| [F4 — Ticket payments](flows/F4-ticket-payments/README.md) | 11 |
| [F5 — Sched subscription billing](flows/F5-sched-subscription-billing/README.md) | 25 |
| [F6 — Registration and RSVP](flows/F6-registration-and-rsvp/README.md) | 5 |
| [F7 — CFP](flows/F7-cfp/README.md) | 6 |
| [F8 — Check-in, QR and badges](flows/F8-check-in-qr-and-badges/README.md) | 5 |
| [F9 — Session editor](flows/F9-session-editor/README.md) | 5 |
| [F10 — Control Panel](flows/F10-control-panel/README.md) | 6 |
| [Sched Count regression (iOS)](apps/sched-count-ios/README.md) | 12 |
| [Sched app regression (iOS and Android)](apps/sched-app/README.md) | 18 |
| [Smoke](regression/smoke/README.md) | 17 |
| [Core](regression/core/README.md) | 29 |
| [Extended](regression/extended/README.md) | 25 |

Total: 189 cases.

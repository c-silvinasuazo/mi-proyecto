# Sched QA – Playwright

Browser checks for the QA regression suite, with these targets:

| Target | Command | What runs | Writes data? |
| --- | --- | --- | --- |
| Production | `npm run test:prod` | `tests/readonly` and `tests/cfp-readonly`: read-only checks | No |
| eph (PR environment) | `npm run test:eph` | Every flow in `tests/eph`, in Chrome. REG-220 in Safari: `npx playwright test --project=eph-safari`. `npm run test:eph:quick` leaves out the two `@slow` cases (REG-105's unfreeze wait and the TC-F10-04 import, up to 15 minutes each) | Yes, only on eph (isolated database) |
| eph on an iPhone | `npm run test:eph:iphone` | `tests/eph-iphone`: the event site at iPhone size in WebKit (search, description, My Schedule, attendee list). Needs `npx playwright install webkit` | Yes, only on eph |
| dev2 | `npm run test:dev2` | Payments (F4) with Stripe test mode; opt in with `DEV2_BASE_URL` | Yes, in the production database: use billmtttest42 only |
| Sched app (iOS and Android) | `npm run test:ios` or `npm run test:android` | `mobile/sched-app`: Maestro flows for the native app on a simulator or emulator (APP-01, 02, 07, 09, 10 and 13). Setup in [mobile/README.md](mobile/README.md) | No (read-only, on qa reminders 2 in production) |

`COVERAGE.md` maps every validated check to its test, or to "manual" with the reason. `TEST-IDS.md` lists the elements
the tests can only find by CSS class or screen position, to ask the developers for test ids.

`npm run typecheck` checks the tests' TypeScript (Playwright runs them without checking types). The GitHub Actions
workflow in `.github/workflows/eph.yml` runs it on every push, and the eph suite against the QA eph every weekday
(and by hand from the Actions tab), once the eph secrets it lists are set.

`cases/` holds the test cases themselves, one Markdown file per case (steps, expected result, linked bugs, last run and automation status). Start at [cases/README.md](cases/README.md).

## Setup (once)

1. `npm install`
2. `npx playwright install chromium`
3. `cp .env.example .env` and fill it in. `.env` is git-ignored: never commit it or paste it anywhere.
   - Production: the QA organizer account.
   - eph: an eph event URL (`https://demofriends.qa.eph.sched.co` for QA, or `https://demofriends.pr-<number>.eph.sched.co` for a PR) and the docker-cd test admin (production accounts don't exist on eph).

### What each command needs in `.env`

| Command | Required | Optional |
| --- | --- | --- |
| `test:prod` | `SCHED_EMAIL`, `SCHED_PASSWORD`, `CFP_OPEN_FORM`, `CFP_FUTURE_FORM`, `CFP_CLOSED_FORM` | `SCHED_BASE_URL` (defaults to sched.com), `SCHED_USERNAME` (REG-008 username check is skipped without it), `QA_EVENT` (defaults to qaengf6app), `CFP_EVENT` (defaults to qaengreminders) |
| `test:eph` | `EPH_BASE_URL`, `EPH_USERNAME`, `EPH_PASSWORD` | — (the eph login uses the username; no email needed) |
| `test:dev2` | `DEV2_BASE_URL` | — |

`test:dev2` only holds placeholders today (see [Status of the placeholders](#status-of-the-placeholders)), so it runs nothing yet. The CFP flows (F7) run with `test:eph`, on the eph event's own CFP: each check creates its own form and archives it afterwards. The checks that send an application leave an applicant account and an application on eph (the CFP can't delete them), so they only run with `EPH_ALLOW_CFP_APPLICATIONS=1`.

A missing required value fails the run with `Missing <NAME>. Copy .env.example to .env and fill it in.`

## Running a QA pass

1. Pull the latest changes and check `.env` against the table above.
2. Run the read-only checks first: `npm run test:prod`. If the login setup fails, nothing else runs.
3. Then the flows on eph: `npm run test:eph` (add `:headed` to watch the browser).
4. Open the report with `npm run report`: every failure has a screenshot, a trace and an `error-context.md`.
5. A green run means nothing new broke. Known issues don't turn it red:
   - **Open bugs** are marked with `openBug('ENG-…')` and **eph gaps** from ENG-2832 (the list began in ENG-2665) with `ephGap(#)`: the check is
     expected to fail. When the bug or gap is fixed, Playwright reports the check as **"unexpectedly passed"**: remove
     the mark and update the case.
   - Gaps that only block one step (PDFs, photos) skip that step with a "skipped step" note in the report; gaps that
     block a whole check skip it with the reason (`tests/eph/preconditions.ts`). Both run for real once eph is fixed.
6. Sort each real failure before filing it:
   - **Environment problem** (the page returns 500, the server shows PHP warnings, eph is down): report it to whoever runs that environment, not as a product bug, and re-run once it is fixed.
   - **New failure**: reproduce it by hand, then file the bug, link it from the case and mark the check with `openBug`.
7. Update the case files you ran (Last run, Notes) and `COVERAGE.md` if automation changed.
8. Clean up: `rm -rf .auth test-results playwright-report`.

## Troubleshooting

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| `Missing SCHED_EMAIL` (or another variable) | That value is empty in `.env` | Fill it in; see [What each command needs](#what-each-command-needs-in-env) |
| `Sched login failed (still on /login)` | Wrong credentials, or Sched is throttling logins | Check the account by hand; wait a few minutes before retrying |
| `eph editor login failed (still on /editor/login)` | Wrong `EPH_USERNAME` / `EPH_PASSWORD`, or the eph URL points to a PR that no longer exists | Check the password in docker-cd's test data and that the URL opens |
| `<page> returned an HTTP error … Received: 500` on many eph pages at once | The eph server is broken, not the test (for example `file_put_contents(…/logs/mysqli_ex.log): Permission denied`) | Report it to the docker-cd maintainers, or point `EPH_BASE_URL` to another eph |
| Many tests "skipped" | Placeholders (`test.fixme`) not recorded yet, or opt-in targets without their variable | Expected; see below |

## Status of the placeholders

Each flow in `tests/eph` and `tests/dev2` that isn't recorded yet is a `test.fixme` with its steps and the REG / TC it covers. They show as "fixme" (skipped) until they are recorded. The order follows the eph exploration run sheet: only automate flows that worked by hand on eph.

## Recording a flow (eph)

1. `npm run record -- <URL of the target>` opens a browser and the Playwright recorder.
2. Do the flow by hand. The recorder writes the code.
3. Copy the code into the matching `test.fixme`, change `fixme` to `test`, and replace typed values with `runId()` where names must be unique.
4. Prefer roles and visible text (`getByRole`, `getByText`) over CSS classes, so tests survive layout changes. Use
   `.first()` only when any of several matches will do; when the test expects exactly one, check it with `toHaveCount(1)`.
5. Put sessions on the event's first day (`eventFirstDay(page)` in `tests/eph/sessions.ts`), not a fixed date: eph's
   data, the event's dates with it, can change when eph is rebuilt.
6. Wait for something specific (a response, an element), not for the network to go quiet (`networkidle`).
7. Set up the data a check needs with `createSession` and `addAttendee`: they send the editor's own save requests, so
   setup takes a second instead of a trip through the form. Go through the form only when the form is what the check
   tests (`openAddSession` / `publishNewSession`, `addAttendeeFromEditor`).
8. Screens that several specs use have a page object in `tests/eph/pages` (the Check-In App, a session's page and My
   Schedule). Add to them instead of repeating selectors in a spec.
9. Run `npm run test:eph:headed` to check it, then `npm run typecheck` and `npm run lint` (errors fail CI; the warnings
   left are conditionals kept on purpose, for screens that only sometimes show a button).

## Notes

- eph specs import `test` and `expect` from `tests/eph/fixtures.ts`, not from `@playwright/test`. After each test (pass, fail or timeout) the fixtures delete the sessions and attendees it created, close the extra browser contexts it opened with `newPage` (another device or account), and log the editor back in if the test ended its session (`editorSession.ended()`: the Check-In App's login and the Dashboard logout do). If the test run itself is killed, data can still be left behind: look for titles starting with "QA " in the editor.
- The eph suite runs one test at a time (`workers: 1`) on purpose. Sched keeps one session per account: logging in
  anywhere else as the eph admin (another test, the Check-In App, or a script you run during the suite) ends the
  session every test shares. Don't run other logins against the same eph while the suite runs.
- Production checks log in once per run (`tests/setup`) and reuse the session saved in `.auth/prod.json`, because Sched throttles repeated logins. That file holds session cookies: delete it after a run with `rm -rf .auth test-results playwright-report`.

- Sched's login labels aren't linked to their inputs, so `helpers.ts` finds the fields by position inside the main area.
- The ENG-2293 check never prints the page source or the token, and its traces and screenshots are off.
- Email delivery isn't checked on eph. SSO (Google, Microsoft) doesn't work on eph. Payments go to dev2 with Stripe test mode, not eph.
- Fixtures for uploads: `tests/fixtures/sample.pdf`; images are generated in the test (`solidPng` in `tests/eph/people.ts`).
- After a run, delete `test-results` and `playwright-report` if they contain anything sensitive.

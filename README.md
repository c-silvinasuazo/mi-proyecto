# Sched QA – Playwright

Browser checks for the QA regression suite, with four targets:

| Target | Command | What runs | Writes data? |
| --- | --- | --- | --- |
| Production | `npm run test:prod` | `tests/readonly` and `tests/cfp-readonly`: read-only checks | No |
| eph (PR environment) | `npm run test:eph` | Every flow in `tests/eph`, in Chrome. REG-220 in Safari: `npx playwright test --project=eph-safari` | Yes, only on eph (isolated database) |
| dev2 | `npm run test:dev2` | Payments (F4) with Stripe test mode; opt in with `DEV2_BASE_URL` | Yes, in the production database: use billmtttest42 only |
| CFP | `npm run test:cfp` | CFP flows (F7) on the production CFP, plus ENG-2267 on an iPhone viewport; opt in with `CFP_ENABLED=1` | Yes, on a qaeng event's CFP form only |

`COVERAGE.md` maps every validated check to its test, or to "manual" with the reason.

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
| `test:cfp` | `CFP_ENABLED=1` (documented opt-in; no test reads it yet) | — |

`test:dev2` and `test:cfp` only hold placeholders today (see [Status of the placeholders](#status-of-the-placeholders)), so they run nothing yet.

A missing required value fails the run with `Missing <NAME>. Copy .env.example to .env and fill it in.`

## Running a QA pass

1. Pull the latest changes and check `.env` against the table above.
2. Run the read-only checks first: `npm run test:prod`. If the login setup fails, nothing else runs.
3. Then the flows on eph: `npm run test:eph` (add `:headed` to watch the browser).
4. Open the report with `npm run report`: every failure has a screenshot, a trace and an `error-context.md`.
5. Sort each failure before filing it:
   - **Environment problem** (the page returns 500, the server shows PHP warnings, eph is down): report it to whoever runs that environment, not as a product bug, and re-run once it is fixed.
   - **Known issue** (listed in [cases/README.md](cases/README.md#regression-levels)): expected to fail until the bug is fixed.
   - **New failure**: reproduce it by hand, then file the bug and link it from the case.
6. Update the case files you ran (Last run, Notes) and `COVERAGE.md` if automation changed.
7. Clean up: `rm -rf .auth test-results playwright-report`.

## Troubleshooting

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| `Missing SCHED_EMAIL` (or another variable) | That value is empty in `.env` | Fill it in; see [What each command needs](#what-each-command-needs-in-env) |
| `Sched login failed (still on /login)` | Wrong credentials, or Sched is throttling logins | Check the account by hand; wait a few minutes before retrying |
| `eph editor login failed (still on /editor/login)` | Wrong `EPH_USERNAME` / `EPH_PASSWORD`, or the eph URL points to a PR that no longer exists | Check the password in docker-cd's test data and that the URL opens |
| `<page> returned an HTTP error … Received: 500` on many eph pages at once | The eph server is broken, not the test (for example `file_put_contents(…/logs/mysqli_ex.log): Permission denied`) | Report it to the docker-cd maintainers, or point `EPH_BASE_URL` to another eph |
| Many tests "skipped" | Placeholders (`test.fixme`) not recorded yet, or opt-in targets without their variable | Expected; see below |

## Status of the placeholders

Each flow in `tests/eph`, `tests/dev2` and `tests/cfp` is a `test.fixme` with its steps and the REG / TC it covers. They show as "fixme" (skipped) until they are recorded. The order follows the eph exploration run sheet: only automate flows that worked by hand on eph.

## Recording a flow (eph)

1. `npm run record -- <URL of the target>` opens a browser and the Playwright recorder.
2. Do the flow by hand. The recorder writes the code.
3. Copy the code into the matching `test.fixme`, change `fixme` to `test`, and replace typed values with `runId()` where names must be unique.
4. Prefer roles and visible text (`getByRole`, `getByText`) over CSS classes, so tests survive layout changes.
5. Run `npm run test:eph:headed` to check it.

## Notes

- Production checks log in once per run (`tests/setup`) and reuse the session saved in `.auth/prod.json`, because Sched throttles repeated logins. That file holds session cookies: delete it after a run with `rm -rf .auth test-results playwright-report`.

- Sched's login labels aren't linked to their inputs, so `helpers.ts` finds the fields by position inside the main area.
- The ENG-2293 check never prints the page source or the token, and its traces and screenshots are off.
- Email delivery isn't checked on eph. SSO (Google, Microsoft) doesn't work on eph. Payments go to dev2 with Stripe test mode, not eph.
- Fixtures for uploads: `tests/fixtures/image.png` and `tests/fixtures/sample.pdf`.
- After a run, delete `test-results` and `playwright-report` if they contain anything sensitive.

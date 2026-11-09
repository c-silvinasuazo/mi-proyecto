# Sched QA – Playwright

Browser checks for the QA regression suite, with two targets:

| Target | Command | What runs | Writes data? |
| --- | --- | --- | --- |
| Production | `npm run test:prod` | `tests/readonly`: read-only checks | No |
| eph (PR environment) | `npm run test:eph` | `tests/readonly` plus every flow in `tests/eph` (REG-220 also in Safari) | Yes, only on eph (isolated database) |
| dev2 | `npm run test:dev2` | Payments (F4) with Stripe test mode; opt in with `DEV2_BASE_URL` | Yes, in the production database: use billmtttest42 only |
| CFP | `npm run test:cfp` | CFP flows (F7) on the production CFP; opt in with `CFP_ENABLED=1` | Yes, on a qaeng event's CFP form only |

`COVERAGE.md` maps every validated check to its test, or to "manual" with the reason.

`cases/` holds the test cases themselves, one Markdown file per case (steps, expected result, linked bugs, last run and automation status). Start at [cases/README.md](cases/README.md).

## Setup (once)

1. `npm install`
2. `npx playwright install chromium`
3. `cp .env.example .env` and fill it in. `.env` is git-ignored: never commit it or paste it anywhere.
   - Production: the QA organizer account.
   - eph: the PR environment's main site (`https://pr-<number>.eph.sched.co`) and an organizer account created there (production accounts don't exist on eph).

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

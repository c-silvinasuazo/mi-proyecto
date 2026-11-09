# F7 — CFP

Production CFP runs (since 2026-10-30, per Marko): the runs above were on cfp-staging. On the production CFP (form "qa CFP prod" on qaengreminders): submitting before verifying the email sends both emails (TC-F7-01, ENG-1328, 2026-11-02); Sync with Sched with only "Sync Applicants" syncs applicants as speakers and creates no sessions (TC-F7-05, ENG-1565, 2026-11-02); two proposals from one applicant both sync with that speaker attached, without a duplicate speaker (REG-214, 2026-11-03); Messages recipient search, scroll and removal work (REG-216, 2026-11-03). On 2026-11-04, automated read-only checks (sched-qa-playwright) passed on the production CFP: an open form shows "Submit", and forms that open tomorrow or closed yesterday show "currently closed" with no Submit (TC-F7-02); the form's info page fits an iPhone screen (ENG-450). Logging in with a Sched account from a CFP form doesn't return to the form (ENG-2091, reproduced 2026-11-02). Still to re-run on production: reviewer groups and permissions (TC-F7-03, TC-F7-04) and the export (TC-F7-06).

| ID | Case | Type / prio | Last run | Automation |
| --- | --- | --- | --- | --- |
| [TC-F7-01](TC-F7-01-submit-a-proposal.md) | Submit a proposal | Positive | passed | ✅ automated |
| [TC-F7-02](TC-F7-02-cfp-dates.md) | CFP dates | Negative | passed | ✅ automated |
| [TC-F7-03](TC-F7-03-reviewer-group.md) | Reviewer group | Positive | passed | 🟡 placeholder |
| [TC-F7-04](TC-F7-04-reviewer-permissions.md) | Reviewer permissions | Negative | passed | 🟡 placeholder |
| [TC-F7-05](TC-F7-05-sync-to-sched.md) | Sync to Sched | Positive | passed | 🟡 placeholder |
| [TC-F7-06](TC-F7-06-export.md) | Export | Positive | passed | ✅ automated |

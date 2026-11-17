# Coverage map

Every check QA validated (regression suite, flow cases, #bug-sla reviews and recent fixes) and where it lives in automation. Source: the Test Cases and Regression Suite page in Notion.

Status: ✅ automated · 🟡 placeholder (`test.fixme`, to record) · 👤 stays manual (reason)

## Automated now (read-only, production and eph)

| Check | File | Status |
| --- | --- | --- |
| REG-008 / TC-F3-01: login with email and username | readonly/reg-008-login | ✅ |
| ENG-2250 / TC-F3-03: failed login keeps the "+" | readonly/eng-2250-failed-login-keeps-plus | ✅ |
| REG-007 / ENG-2180: purchase form escapes sub_code | readonly/reg-007-hidden-field-escaped | ✅ |
| Proposed REG-018 / ENG-2293: no login token in the handoff page | readonly/eng-2293-handoff-token | ✅ (fails until the fix ships) |
| TC-F7-02: CFP closed before opening and after closing; open form offers Apply | cfp-readonly/tc-f7-02-cfp-dates | ✅ |
| ENG-450: CFP info page fits an iPhone screen | cfp-readonly/eng-450-cfp-info-fits-iphone | ✅ |
| TC-F7-01 (organizer): the CFP portal opens from the editor and lists the QA form | cfp-readonly/cfp-organizer | ✅ (to confirm on first run) |
| TC-F7-06: on Free Trial, Download all asks to upgrade | cfp-readonly/cfp-organizer | ✅ (to confirm on first run) |
| TC-F7-02 (eph): a CFP form is closed before it opens and after it closes (forms created and archived by the test) | eph/f7-cfp | ✅ |
| PR #309 (ENG-2091, partial): logging in from a CFP form with a Sched-linked account sends you to Sched's login with a link back to the form | eph/f7-cfp | ✅ (marked with openBug until the PR ships; on the PR's eph, pr-309, it already passes) |
| ENG-2091: a Sched-linked applicant lands back on the form, signed in to the CFP | eph/f7-cfp | 🟡 (the fix moves to a follow-up ticket, not created yet) |
| REG-215 / TC-F7-01 (part): an application with a co-speaker reaches the organizer | eph/f7-cfp | ✅ (opt-in: EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and an application on eph) |
| REG-108 / TC-F7-05 / ENG-1565: Sync with Sched with only Sync Applicants brings in the speaker and no session; a full sync keeps the title and formatted description and attaches the speaker (the session's date is the sync time, ENG-2072; re-sync of an existing session not covered) | eph/f7-cfp | ✅ (opt-in: EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and applications on eph; the synced sessions and speaker are deleted) |
| REG-214: two proposals from one applicant sync with that speaker attached to both, and the speaker once | eph/f7-cfp | ✅ (opt-in: EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and applications on eph; the synced sessions and speaker are deleted) |
| REG-216 / ENG-157, ENG-158, ENG-159: Messages: recipients found by speaker name, the list scrolls by dragging its scrollbar and stays open, Cancel clears the recipients (nothing is sent) | eph/f7-cfp | ✅ (opt-in: EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves an applicant account and applications on eph) |
| REG-213 / TC-F7-03 (ENG-30, part): two reviewers join a reviewer group by its link and rate an application 2 and 4 stars; the organizer's Applications list shows 3 stars from 2 ratings and the application lists both reviews (the file field, ENG-237, needs uploads, which fail on eph) | eph/f7-cfp | ✅ (opt-in: EPH_ALLOW_CFP_APPLICATIONS=1, since it leaves applicant and reviewer accounts, an application and a reviewer group on eph; the CFP can't delete reviewer groups) |
| REG-208 / TC-F9-01: a multi-day session keeps its dates after save, reopen and a description-only edit (eph, writes) | eph/f9-sessions | ✅ |
| REG-209 / TC-F9-02: description formatting persists in the editor and on the public page (apps, print and PDF stay manual) | eph/f9-sessions | ✅ |
| ENG-2244: a long description pasted with heavy markup is not cut off and renders cleanly | eph/f9-sessions | ✅ |
| REG-127: turning chat on and off saves without a parsererror | eph/f9-sessions | ✅ (expected to fail on eph: the chat toggle answers "parsererror" there, blocker #6 in ENG-2832; marked with ephGap) |
| REG-107: event and attendee schedule PDFs contain data | eph/f9-sessions | ✅ (on eph the PDF downloads are skipped while PDFs aren't generated, blocker #2 in ENG-2832; the printable pages are still checked) |
| REG-210: session image saves; a PDF downloads as .pdf | eph/f9-sessions | ✅ (skips on eph while uploads fail with "Could not upload the file", blocker #1 in ENG-2832) |
| ENG-87: a session type with a comma is stored as one type | eph/f9-sessions | ✅ (open bug, marked with openBug: "QA Workshop, Advanced" is saved as two types) |
| REG-103: schedule, session page, date filter and search; the date filter doesn't redirect | eph/public-site | ✅ |
| REG-102: an attendee adds and removes a session in My Schedule; its print view isn't blank | eph/public-site | ✅ |
| REG-105 / TC-F9-05: a frozen session has no remove button for the attendee; unfreezing unlocks it | eph/f9-sessions | ✅ (tagged @slow: the unfreeze can take up to 8 minutes to reach attendees) |
| ENG-2762 (part of REG-105): a page opened before the freeze can't remove the frozen session | eph/f9-sessions | ✅ (fixed 2026-11-13: the removal now gets "frozen" and the session stays; before the fix it was removed, 6 of 6 runs on eph) |
| REG-220: the embed loads, scrolls and stays centered | eph/public-site | ✅ (Chrome; Safari with the eph-safari project, needs `npx playwright install webkit`) |
| ENG-1568: /print/all shows descriptions | eph/public-site | ✅ |
| REG-129 / TC-F2-06 (part): chatbot and banners don't cover editor menus or buttons | eph/public-site | ✅ (TC-F2-06's plan check isn't automated) |
| TC-F8-05: /checkin records a session check-in (Check-In App, saved after reload) | eph/f8-checkin | ✅ |
| REG-113 / TC-F8-03 (ENG-194, ENG-770, ENG-544, ENG-545, ENG-546): with Self Check-in on, the session QR export has only the selected published sessions, 3 per page | eph/f8-checkin | ✅ (on eph the "Export all (PDF)" step is skipped while PDFs aren't generated, blocker #2 in ENG-2832; the selection and the 3-per-page paging are checked) |
| Android check-in (/checkin at Pixel 7 size; Sched Count is iOS only): an attendee without an admin or check-in role can't log in (SC-03 on Android) | eph/checkin-android | ✅ (the app goes back to its login form with no message, unlike Sched Count's "No events assigned yet": ENG-2785) |
| Android check-in: Name Search checks an attendee in; saved after reopening the app; the editor lists it (SC-05 / SC-10 on Android) | eph/checkin-android | ✅ |
| ENG-2784: Android check-in: Name Search finds an attendee by first and last name | eph/checkin-android | ✅ (open bug, marked with openBug: a search with a space finds nobody, because the app encodes the space twice) |
| APP-07 (web): Menu -> Search finds a session by name on an iPhone | eph-iphone/event-site-iphone | ✅ (WebKit, iPhone 15 size; also checks the schedule fits the screen) |
| APP-09 (web): a session page shows its description on an iPhone | eph-iphone/event-site-iphone | ✅ |
| APP-08 (web): add a session to My Schedule and remove it on an iPhone | eph-iphone/event-site-iphone | ✅ |
| APP-10 (web): the attendee list isn't blank on an iPhone | eph-iphone/event-site-iphone | ✅ |
| APP-01: the Sched app opens on a fresh install to the events list, no login wall | mobile/sched-app (Maestro) | ✅ iOS (Sched Dev 2.16.2 simulator) and Android (1.63.1) |
| APP-02: the app's search finds qa reminders 2 and it opens to its schedule and tabs | mobile/sched-app (Maestro) | ✅ iOS and Android |
| APP-07: the event's search finds a session by one word and hides the others | mobile/sched-app (Maestro) | ✅ iOS and Android |
| APP-09: a session opens to its title, time, speaker and description | mobile/sched-app (Maestro) | ✅ iOS and Android (the description of qa publico was added on 2026-11-17) |
| APP-10: the attendee list isn't blank (Directory -> Attendees on iOS, Info -> Attendees on Android) | mobile/sched-app (Maestro) | ✅ iOS and Android (Android has no Directory tab; ENG-2591 aligns the tabs) |
| APP-13 / REG-126 / TC-F6-03 (app half): an event without registration (qa reminders 2) opens straight to its schedule | mobile/sched-app (Maestro) | ✅ iOS and Android |
| APP-16 / REG-123: no "Download the Sched app" banner on the schedule, a session or an attendee's profile | mobile/sched-app (Maestro) | ✅ iOS and Android |
| APP-15 / REG-122: in dark mode the schedule, a session and the attendee list show their content | mobile/sched-app-dark (Maestro) | ✅ iOS and Android, with screenshots for the visual check (Android 1.63.1 turns dark and reads well; Sched Dev 2.16.2 on iOS stays light, so dark mode isn't really exercised there) |
| ENG-183: Android check-in: undoing an event check-in in Name Search is saved | eph/checkin-android | ✅ (open bug, marked with openBug: the circle unticks but no request is sent; the attendee stays checked in, also on qaengreminders in production) |
| Android check-in: undoing a session check-in is saved (SC-06 on Android) | eph/checkin-android | ✅ |
| TC-F3-02: /password-reset and /password-reset/ show the reset form (main site; email, link and new password stay manual: captcha, no email on eph) | eph/f3-login | ✅ |
| TC-F3-08: editor -> Dashboard -> back without logging in again; logout ends both | eph/f3-login | ✅ (on eph the logout lands on qa.eph.sched.co, which loops; noted in the report) |
| TC-F2-04: a taken or reserved URL disables Create in the Dashboard's Create New Event | eph/f2-events | ✅ |
| TC-F10-01: a time zone change saves and shows on the public site; sessions keep their clock time (name and dates stay manual) | eph/f10-control-panel | ✅ |
| TC-F10-02: "Add" and "Add + Send Invite" add the attendee (the invite email stays manual) | eph/f10-control-panel | ✅ |
| TC-F10-06: Reports -> XLS Attendees has every attendee and the expected columns | eph/f10-control-panel | ✅ (skips on eph while exports come back empty, blocker #3 in ENG-2832) |
| REG-112: the CFP portal opens from the editor | eph/f10-control-panel | ✅ |
| REG-120: a sponsor photo's crop Accept works and the photo saves and loads | eph/f9-sessions | ✅ (on eph the photo-loading step is skipped: photos point to production's avatars host, blocker #5 in ENG-2832; Accept and the save are checked) |
| REG-222: two attendees keep their own photos (updating one stays manual) | eph/feedback-profiles | ✅ (skips on eph: photos point to production's avatars host, so they can't be compared there; blocker #5 in ENG-2832) |
| ENG-2217: with only one Speaker Tools option on, a speaker attached to a session gets the matching tool and fields | eph/feedback-profiles | ✅ (closed 2026-11-13 with the names switched; passes on eph 2026-11-13. Before the fix, on eph 2026-11-12, "Edit session description" gave Edit Session (title, video stream, button link, photo) and "Edit session details" gave Edit Description. Gives demofriendsspeaker a name first: with none, Attach People breaks for every session) |

## Skipped on eph until their precondition is met

Each of these runs a quick check first and skips with the reason in the report. Once the precondition is met the test
fails with "steps not recorded yet", so it gets written against the real screens instead of passing silently.

| Check | File | Skips while |
| --- | --- | --- |
| REG-012 / TC-F1-01, REG-013 / TC-F1-02, TC-F1-04/05 | eph/f1-signup | /signup has a captcha on eph |
| TC-F2-08 (written in full; ran once on eph 2026-11-10: the event was created and its editor opened), REG-014 / ENG-271 | eph/f2-events | EPH_ALLOW_EVENT_CREATION isn't set (each run creates an event that can't be deleted); the /signup half (TC-F2-01) stays manual: captcha |
| REG-101, REG-206, REG-207, REG-125, TC-F6-05 | eph/f6-registration | registration isn't on: its setup doesn't stick on demofriends' plan (tried 2026-11-10; needs a plan with registration, such as Boost) |
| REG-117 | eph/f8-checkin | file uploads fail on eph |
| ENG-241 | eph/f8-checkin | always: visual check (special characters drawn as boxes), stays manual; badge templates don't load on eph either |
| REG-106 (written in full), REG-104 / REG-211 | eph/f9-sessions | the import queue isn't processing / secret sessions need Ultra |
| TC-F10-04 (written in full) | eph/f10-control-panel | the import queue isn't processing |
| REG-118, REG-221, ENG-2588, ENG-2592 | eph/feedback-profiles | no feedback button on the public site, for the admin or the attendee (feedback is enabled in Settings; checked 2026-11-10) |
| REG-223 | eph/feedback-profiles | sponsor levels can't be added on the event's plan |
| REG-124, ENG-1543 (regression of the designed behavior, closed 2026-11-04: a timed session earns credit for its duration, TBA and ineligible sessions earn none) | eph/feedback-profiles | PD Hours isn't enabled on the event (the pdhours tag, blocker #11) |
| ENG-2641 | eph/feedback-profiles | the event's dates don't include today |
| REG-001 to REG-006, REG-017, REG-202 to REG-205, TC-F4-01 to TC-F4-09, SCH-16 (steps not recorded yet) | eph/f4-payments | eph has no ticket payments: registration isn't set up and no Stripe test account is connected (requested in ENG-2832) |

## Placeholders by target

| Target | File | Checks |
| --- | --- | --- |
| eph CFP (needs EPH_ALLOW_CFP_APPLICATIONS=1) | eph/f7-cfp | REG-212 / TC-F7-06 (also a paid plan), REG-109; TC-F7-04 / REG-111 is a security case, checked by review |

Open bugs kept as checks (expected to fail until fixed): ENG-241, ENG-87, ENG-2091, ENG-2293, ENG-183, ENG-2784.

## Stays manual

| Check | Reason |
| --- | --- |
| REG-009, REG-010, TC-F1-09, TC-F3-04/05 (Google and Microsoft SSO) | Third-party login; doesn't work on eph |
| ENG-2267 (the CFP form title is left-aligned on iOS) | Only shows in real iOS Safari: Playwright's WebKit at iPhone size centers the title, as Android does (checked on eph, 2026-11-16) |
| REG-011, REG-015, REG-121, REG-217, REG-218, REG-219, REG-225, ENG-2228, ENG-2253, APP-03 to APP-06, APP-08, APP-11, APP-12, APP-14, APP-17, APP-18 | Native apps (Sched); phase 1 (APP-01, 02, 07, 09, 10), APP-13, APP-15 and APP-16 run with Maestro above, the rest is phase 2 or stays manual (mobile/README.md) |
| REG-114, REG-115, REG-116, SC-01 to SC-12 | Sched Count app and camera (to automate with Maestro, see mobile/README.md: the simulator build we have is 1.6.3, the production app, not the β 1.8.3; the Android equivalents on the web Check-In App are automated above) |
| REG-119 | Push needs an event with its own app |
| REG-201, REG-110, ENG-1328 email part, reminders (TC-F9-04) | Email delivery |
| REG-016 | Covered by the existing screenshot tests in eph |
| ENG-1087, ENG-2220 to ENG-2224 | Security findings: verify fixes only |
| ENG-2633 | Anti-abuse limit; needs an account at the limit |
| REG-128, REG-224, F5 cases | Billing not testable yet |

# Mobile automation run — Nov 13, 2026 (updated Nov 17)

**Update, Nov 17:** the native Sched app now runs 8 Maestro flows, and all 8 pass on iOS and on Android: phase 1
(APP-01, 02, 07, 09, 10), plus APP-13, APP-15 (dark mode) and APP-16 (no download banner) from phase 2. APP-09 now
also checks the session's description. In the eph suite, 5 more regression cases are automated, all on the CFP
(REG-108, REG-213, REG-214, REG-215, REG-216), and 3 app regression cases are now mapped to the app flows that
cover them (REG-122, REG-123, REG-126), so regression coverage goes from 23% to 34%. The logged-in cases
(APP-08, APP-11) and Sched Count still wait on new builds from Diego, and none of the eph blockers in ENG-2832 has been
fixed yet.

In total, **64 automated checks passed on Nov 17**: 48 in the eph suite (the Android check-in checks included) and the 8
app flows on both iOS and Android (16). Counting each app flow once, that's 56 distinct checks. The event site at iPhone
size wasn't run again; it passed 4 of 4 on Nov 13. On Nov 13 the total was 54 (48 distinct).

| Area | Tool | Where it runs | Nov 13 | Nov 17 |
| --- | --- | --- | --- | --- |
| Sched app, iOS | Maestro | Sched Dev 2.16.2 (7698) on an iPhone 17 simulator, iOS 27.2 | 6/6 pass | 8/8 pass |
| Sched app, Android | Maestro | Sched 1.63.1 (prod APK) on an Android 17 emulator | 6/6 pass | 8/8 pass |
| Event site on an iPhone | Playwright, WebKit | eph (demofriends) | 4/4 pass | Not run |
| Check-In App on an Android phone | Playwright, Chrome | eph (demofriends) | 3/5 pass, 2 open bugs | 3/5 pass, same 2 open bugs (ENG-2784, ENG-183) |
| Full eph suite | Playwright | eph (demofriends) | 38 pass, 11 fail (all known), 23 skipped, 16.9 min | 48 pass, 6 fail (5 known, 1 intermittent), 30 skipped, 22.1 min (details in `eph-run-2026-11-17.md`) |

## Coverage

24 of the 71 regression cases (34%) are automated, up from 16 (23%) on Nov 13. One more (REG-106) is written in full
and waits for eph's import queue, 28 have a placeholder test whose steps aren't recorded yet, and 18 are manual or not
mapped yet. Of the 18 Sched app cases, 8 are automated (APP-01, 02, 07, 09, 10, 13, 15, 16), up from 6; the 12 Sched
Count cases wait for a working build, and their Android equivalents run on the web Check-In App.

| Regression cases (REG) | Nov 13 | Nov 17 | Share (Nov 17) |
| --- | --- | --- | --- |
| Automated | 16 | 24 | 34% |
| Written in full, waits for an eph precondition | 1 | 1 | 1% |
| Placeholder test (steps not recorded yet) | 33 | 28 | 39% |
| Manual or not mapped yet | 21 | 18 | 25% |
| Total | 71 | 71 | 100% |

New since Nov 13 (all on eph's CFP, opt-in with `EPH_ALLOW_CFP_APPLICATIONS=1`): REG-215 (an application with a
co-speaker reaches the organizer), REG-108 (Sync with Sched), REG-214 (two proposals from one applicant), REG-216
(Messages recipients) and REG-213 (two reviewers' ratings average for the organizer). In the app, REG-122 (dark mode),
REG-123 (no download banner) and REG-126 (registration disabled) are covered by APP-15, APP-16 and APP-13. The case statuses were also
checked against the tests on Nov 17, and 9 that didn't match were corrected.

The work is on the branch `qa/add-playwright-suite`, pushed to GitHub (no pull request yet).

## Native Sched app (Maestro)

The flows are in `mobile/sched-app`. They need no login: each one starts from a fresh install, finds the QA event
through the app's event search, and opens it.

- **Builds (from Diego):** Sched Dev 2.16.2 (7698) simulator build on iOS 27.2; Sched 1.63.1 (`com.sched`,
  production APK) on an Android 17 emulator (API 37).
- **Test event:** qa reminders 2 (qaengreminders) in production. The app's event search only finds public events, so
  the event was made public on Nov 13. After making it public, the app took about 5 minutes to find it. On Nov 17 the
  app couldn't find it (every flow but APP-01 failed at the search); it was made public again and the app found it
  about 2 minutes later.

| Case | What the flow checks | iOS | Android |
| --- | --- | --- | --- |
| APP-01 Install and launch | A fresh install opens to the events list with a search box, and no sign-in wall | Pass | Pass |
| APP-02 Open an event | The search finds qa reminders 2; it opens to its schedule, sessions and tabs | Pass | Pass |
| APP-07 Search sessions | The event's search finds "qa capacity" by one word and hides the other sessions | Pass | Pass |
| APP-09 Session description | "qa publico" opens with its title, date and time, speaker, and (since Nov 17) description | Pass | Pass |
| APP-10 Attendee list | The attendee list isn't blank (ENG-2213): Directory → Attendees on iOS, Info → Attendees on Android | Pass | Pass |
| APP-13 Registration disabled | An event without registration opens straight to its schedule, with no registration step | Pass | Pass |
| APP-16 No download banner (Nov 17) | No "Download the Sched app" banner on the schedule, a session or an attendee's profile | Pass | Pass |
| APP-15 Dark mode (Nov 17) | With the device in dark mode, the schedule, a session and the attendee list show their content | Pass (the app stays light) | Pass |

APP-09 checks the description "QA session for the mobile app checks.", added to "qa publico" on Nov 17. APP-15 is in
`mobile/sched-app-dark` (`npm run test:ios:dark`): `mobile/run.sh` turns dark mode on before it and off after. On
Android the app turns dark and every screen checked reads well; the iOS simulator build stays light, so on iOS it only
shows nothing is hidden. The two apps label their screens differently, so each flow has an iOS branch
and an Android branch where they differ. The event, sessions, speaker and date the flows expect are variables in
`mobile/run.sh`.

## Mobile web checks (Playwright)

Both suites run on eph (demofriends), and each test removes the sessions and attendees it creates.

**Event site on an iPhone** (`tests/eph-iphone`, WebKit at iPhone 15 size): the web side of the app's cases. Each
check also confirms the page fits the phone's width.

| Check | Result |
| --- | --- |
| APP-07 (web): Menu, then Search, finds a session by name | Pass |
| APP-09 (web): a session page shows its description | Pass |
| APP-08 (web): a session is added to My Schedule and removed | Pass |
| APP-10 (web): the attendee directory isn't blank | Pass |

**Check-In App on an Android phone** (`tests/eph/checkin-android.spec.ts`, /checkin at Pixel 7 size). Sched Count is
iOS only, so on Android check-in staff use the web Check-In App.

| Check | Covers | Result |
| --- | --- | --- |
| An attendee without an admin or check-in role can't log in | SC-03 | Pass (no message shown: ENG-2785) |
| Name Search checks an attendee in; the check-in is saved and shows in the editor | SC-05, SC-10 | Pass |
| Undoing a session check-in is saved | SC-06 | Pass |
| Name Search finds an attendee by first and last name | SC-05 | Fails: ENG-2784 (open) |
| Undoing an event check-in in Name Search is saved | SC-06 | Fails: ENG-183 (open) |

## Findings

| Finding | Where | Status |
| --- | --- | --- |
| Name Search with a first and last name finds nobody: the space is encoded twice and the server answers "No results". | Web Check-In App | ENG-2784, Backlog |
| Undoing an event check-in unticks the circle, but nothing is saved. | Web Check-In App | ENG-183, open |
| An account with no admin or check-in role is refused with no message (Sched Count says "No events assigned yet"). | Web Check-In App | ENG-2785, Backlog, Low |
| A session with no time (TBA) is listed at 12:00 AM; web and Android show TBA. | Sched app, iOS | ENG-2786, Backlog, Low |
| There's no Directory tab; the attendee list is under Info. | Sched app, Android | Covered by ENG-2591 (align the tabs) |
| Signing in doesn't stick: the sign-in screen closes with no error and the app stays logged out. The simulator log shows the app's keychain read failing with -34018 ("Client has neither application-identifier nor keychain-access-groups entitlements"); the simulator builds are signed ad hoc with no entitlements. | Sched Dev 2.16.2 simulator build | Sent to Diego |
| Sched Count 1.6.3 (1688) closes as soon as it opens: UIKit stops apps that don't adopt the scene life cycle on iOS 27. The β moved to the Xcode 27 tool chain in ENG-754. | Sched Count, iOS 27.2 simulator | Needs the β 1.8.3 simulator build |
| The app's event search only lists public events, so a private QA event can't be reached from a fresh install. | Sched app | Looks intended (not confirmed) |
| With the simulator in dark mode, the app stays light (Settings turns dark). Android 1.63.1 follows dark mode. | Sched Dev 2.16.2 simulator build | Noted (Nov 17) |
| Right after a session in qa reminders 2 was saved in the editor, the app briefly showed "Schedule has not yet been published" for the event; the next run was fine. | Sched app, iOS | Noted (Nov 17) |
| The sign-in screen's email and password fields aren't in the accessibility tree (only their labels are), so the login flow taps by position. VoiceOver may not reach them either (not checked). | Sched app, iOS | To confirm |

ENG-2217 (Speaker Tools names) was fixed on Nov 13 and its check passes on eph, alone and in the full suite; it's a
regression check now. The 11 failures in the full eph suite are all known: open bugs (ENG-2784, ENG-183, ENG-87,
ENG-2762) and the eph gaps listed in ENG-2665 (uploads, PDFs, exports, photos, chat). ENG-2762 (frozen sessions) was fixed later the same
day: REG-105 now passes on eph, and a removal from a page opened before the freeze gets "frozen".

## How to run

Start one device at a time: the Android emulator slows down when the iOS simulator is also running. For Android, wait
until `adb shell getprop sys.boot_completed` prints 1. Then, from the repo:

- `npm run test:ios` or `npm run test:android`: the 7 flows in `mobile/sched-app`; `npm run test:ios:dark` (or
  `sh mobile/run.sh sched-app-dark --platform android`): APP-15 in dark mode. Results go to `mobile/results/` as JUnit XML.
- `sh mobile/run.sh sched-app --platform ios --device <udid>`: the same on another simulator.
- `npm run test:ios:login`: signs the QA account from `.env` in to the app, for the logged-in flows. The person whose
  account it is runs it. Blocked until the simulator build can keep the login.
- `npm run test:eph:iphone`: the event site at iPhone size. The Android check-in suite runs as part of
  `npm run test:eph`.

Setup and details are in `mobile/README.md`.

## Next steps

- [ ] Diego: a Sched Dev simulator build with keychain entitlements, then write APP-08 and APP-11.
- [ ] Diego: a Sched Count β 1.8.3 simulator build, for SC-01 to SC-04 (then SC-05/06 and SC-08 to SC-10).
- [x] Add a description to "qa publico" so APP-09 also checks the description (Nov 17).
- [ ] qa reminders 2 has to stay public for the app flows (made public again on Nov 17); remove the email from its
  About page.
- [x] Push `qa/add-playwright-suite` to GitHub (Nov 17).
- [ ] Open a pull request for `qa/add-playwright-suite`.

Stays manual: Google, Microsoft and Apple sign-in, the password reset email, push notifications, the ticket
QR (SC-11), and camera scanning (the simulator has no camera).

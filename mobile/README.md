# Sched apps – Maestro

Mobile checks for the Sched app (iOS and Android) and Sched Count (iOS) with [Maestro](https://maestro.dev): each case
is a YAML flow in `mobile/<app>/` that taps, types and checks what the screen shows. The same flows can run on Android
and iOS. The plan and the order of the cases are in the Notion page "Mobile automation plan (draft)": phase 1 is the
read-only checks (APP-01, 02, 07, 09, 10 and SC-01 to SC-04).

## Status (2026-11-25)

| Flow | What it checks | Android 1.63.1 | iOS Sched Dev 2.16.2 |
| --- | --- | --- | --- |
| APP-01 | Fresh install opens to the events list, no login wall | ✅ | ✅ |
| APP-02 | The event search finds the QA event; it opens to its schedule and tabs | ✅ | ✅ |
| APP-07 | The event's search finds a session by one word | ✅ | ✅ |
| APP-09 | A session shows its title, time, speaker and description | ✅ | ✅ |
| APP-13 | An event without registration opens straight to its schedule | ✅ | ✅ |
| REG-225 | The speaker list keeps the web's order | ✅ | ✅ |
| APP-10 | The attendee list isn't blank | ⏸ needs test data | ⏸ needs test data |
| APP-16 | No "Download the Sched app" banner in the app | ⏸ needs test data | ⏸ needs test data |
| APP-15 | Dark mode (`mobile/sched-app-dark`) | not rerun on the new event | not rerun on the new event |

- APP-10, APP-15 and APP-16 need an attendee with a **public** profile on the QA event: attendees added from the
  editor are private, and only the person can make their profile public. Until then the attendee list is empty.
- APP-08 (My Schedule) and APP-11 (session feedback) need a logged-in account. On Android the debug build
  (`com.sched.debug`) logs in, so they're next. On iOS the simulator build can't keep the login (its keychain read
  fails with -34018: ad hoc builds have no entitlements; Diego is looking at it). The login flow (`mobile/login`,
  `npm run test:ios:login`, run by the person whose account it uses) is ready for when that works.
- Sched Count (SC-01 to SC-12): blocked. The build we have is the production 1.6.3, which closes on open on the
  iOS 27 simulator; they need a β 1.8.3 simulator build.
- Flows that change data have to undo what they change.

## Test data

The flows open **QA ENG-2240 copy** (`qaeng2240copy`, January 24, 2027) in production from the app's event search.
`mobile/run.sh` sets what the flows expect, and any of it can be overridden from the shell:

| Variable | Default | What it is |
| --- | --- | --- |
| `MAESTRO_EVENT` | QA ENG-2240 copy | The event the search finds |
| `MAESTRO_SESSION` | qa mobile session | Sunday, January 24, 2027, 9:00, speaker Ana Alpha, with a description |
| `MAESTRO_OTHER_SESSION` / `_WORD` | qaengf6app | Another session, found by one word (APP-07) |
| `MAESTRO_SPEAKER_ORDER_1` to `_4` | Ana Alpha, Bruno Bravo, Carla Charlie, Dario Delta | The speakers in the editor's order |
| `MAESTRO_ATTENDEE` | QA Mobile Attendee | An attendee in the list (needs a public profile, see above) |
| `MAESTRO_APP_ID` | `com.sched.attendeeappbeta` (iOS), `com.sched` (Android) | The app to open |

What the event needs for the flows to pass:
- **Visible to the public.** The app's search only finds public events, and drops past ones. Free Trial events are
  hidden ("You're on a Free Trial - event is hidden from public"); activating it is done in production Schedmin.
  After a change, the search can take about 5 minutes to catch up. While it's hidden, every flow but APP-01 fails at
  the search.
- **Speakers and Attendees in Settings -> Pages -> Active.** The app's Info menu (Android) and Directory (iOS) list
  only the active pages.
- **Future dates.** When the event ends, the search stops finding it: move the flows to another future event and
  update `mobile/run.sh`.
- After editing the event, give it a few minutes before running the flows: right after a save, iOS once showed
  "Schedule has not yet been published" for a moment.

## How the flows are built

- Each flow is one case, named after it (`APP-09-session-description.yaml`), with a comment saying what it checks.
- Steps several flows share live in `mobile/sched-app/common/`: `launch.yaml` (fresh install), `open-event.yaml`
  (search -> the event), `open-session.yaml`, `open-attendees.yaml` and `back.yaml`. Maestro runs only the top-level
  flows of a folder, so the common ones don't run on their own.
- The two apps differ (texts, ids, tabs: Android has no Directory tab, ENG-2591), so a step that differs has an iOS
  and an Android branch (`runFlow: when: platform:`); everything else is shared.
- Wait for something on the screen (`extendedWaitUntil`, `waitForAnimationToEnd`), never a fixed sleep.
- Select by id where the app has one and by visible text otherwise; missing ids are listed in `TEST-IDS.md`.

Sched Count has no Android app: on Android, check-in staff use the web Check-In App (/checkin) in the phone's browser.
That part runs with Playwright at an Android phone's size, on eph: `tests/eph/checkin-android.spec.ts` (part of
`npm run test:eph`). The event site on an iPhone (the web side of APP-07 to APP-10) runs in WebKit at iPhone size with
`npm run test:eph:iphone` (`tests/eph-iphone`).

The Sched app points to production, and Sched Count β to dev2 (production database), so the flows only use qaeng
events, and the ones that change data will undo it. Phase 1 needs no login.

## Setup (once, macOS)

1. Maestro: download `maestro.zip` from the [latest release](https://github.com/mobile-dev-inc/Maestro/releases),
   check it against `checksums_sha256.txt` (`shasum -a 256 maestro.zip`) and unzip it into `~/.maestro`.
2. Java: `mobile/run.sh` uses the one that comes with Android Studio unless `JAVA_HOME` is set.
3. Android: create an emulator in Android Studio (Device Manager) or use a phone with USB debugging on.
4. iOS: install Xcode, open it once, then download the simulator with `xcodebuild -downloadPlatform iOS` (about 8 GB).
5. Check each device with the setup flow: `sh mobile/run.sh smoke --platform android` (or `ios`). It opens the system
   Settings app; it isn't a Sched case.

## Running

1. Start a device:
   - Android: `~/Library/Android/sdk/emulator/emulator -avd <name>` (`-list-avds` shows the names).
     Wait until it has finished starting (`adb shell getprop sys.boot_completed` prints 1): before that, Maestro
     fails with "Can't find service: package". Run the iOS simulator and the Android emulator one at a time: together
     the emulator slows down and shows "System UI isn't responding" (`common/launch.yaml` taps Wait when it does).
   - iOS: `xcrun simctl boot "iPhone 17"` (`xcrun simctl list devices available` shows the names).
2. Install the build:
   - Android: `~/Library/Android/sdk/platform-tools/adb install -r <file>.apk`.
   - iOS: unzip the `.app` and `xcrun simctl install booted <App>.app`.
3. `npm run test:android` or `npm run test:ios`. Results go to `mobile/results/` (JUnit XML); screenshots of failures
   stay in `~/.maestro/tests`.

To run on another simulator, pass its id: `sh mobile/run.sh sched-app --platform ios --device <udid>`. The flows also
pass on an iPhone SE (3rd generation) with iOS 27.2 (2026-11-13), the smallest iPhone screen; install the app on it
first. The login flow taps the email field by its position on an iPhone 17, so it may need adjusting on other sizes:
the fields aren't in the accessibility tree, and the fix (accessibility identifiers) is on the app's side (see
`TEST-IDS.md`).

To write or fix a flow, `maestro studio` shows the screen and the selector of each element.

## What stays manual

Google, Microsoft and Apple sign-in (SSO), password reset email, dark mode (visual), push notifications, the ticket QR
(SC-11), and scanning a QR with the camera (the simulator has no camera).

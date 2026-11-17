# Sched apps – Maestro

Mobile checks for the Sched app (iOS and Android) and Sched Count (iOS) with [Maestro](https://maestro.dev): each case
is a YAML flow in `mobile/<app>/` that taps, types and checks what the screen shows. The same flows can run on Android
and iOS. The plan and the order of the cases are in the Notion page "Mobile automation plan (draft)": phase 1 is the
read-only checks (APP-01, 02, 07, 09, 10 and SC-01 to SC-04).

Status (2026-11-13): phase 1 of the Sched app passes on both platforms, twice in a row: `mobile/sched-app` has APP-01
(install and launch), APP-02 (open an event), APP-07 (search sessions), APP-09 (session details) and APP-10 (attendee
list), on Diego's builds: Sched Dev 2.16.2 (7698) on an iPhone 17 simulator with iOS 27.2 and the Sched app
1.63.1 (`com.sched`, prod APK) on the Android emulator (same flows; on Android the attendee list is at Info ->
Attendees, as the app has no Directory tab, ENG-2591). APP-13 (phase 2, read-only) was added the same day and passes
on both. Both platforms run the same 6 flows. Still to do:
- APP-09 checks the description too since 2026-11-17: "qa publico" got one ("QA session for the mobile app checks."),
  now the default `MAESTRO_SESSION_DESCRIPTION` in run.sh.
- Sched Count (SC-01 to SC-04): the build Diego sent is 1.6.3 (1688), the production app, not the β 1.8.3 that points
  to dev2, and it closes as soon as it opens on the iOS 27.2 simulator (UIKit stops apps that don't adopt the scene
  life cycle on iOS 27; ENG-754 moved the β to the Xcode 27 tool chain). SC-01 to SC-04 need a β 1.8.3 simulator build.
- Phase 2: APP-13 (an event without registration opens straight to its schedule) passes on both platforms.
- 2026-11-17 (iOS): APP-16 (no download banner on the schedule, a session or an attendee's profile) passes, and
  on Android too. APP-15 is in `mobile/sched-app-dark` (`npm run test:ios:dark`): run.sh turns dark mode
  on, runs it, and turns it back off. It passes, but Sched Dev 2.16.2 stays light with the simulator in dark mode, so
  it only shows nothing is hidden. On Android 1.63.1
  the app turns dark and every screen checked reads well. All 7 flows in `mobile/sched-app` pass on both platforms.
  Right after a session in qa reminders 2 was saved in the editor, the first iOS run showed "Schedule has not yet been
  published" in the event for a moment (APP-09 failed; the next flows and the next run passed). After editing the
  event, give it a few minutes before running the flows.
- APP-08 and APP-11 need a logged-in account in the app, and are blocked: on Sched Dev 2.16.2 (7698) in the
  simulator, signing in with Sched closes the sign-in screen with no error and no session, by hand and with the login
  flow (2026-11-13). The simulator's log shows why: the app's keychain read fails with -34018 ("Client has neither
  application-identifier nor keychain-access-groups entitlements"), and the simulator builds are signed ad hoc with no
  entitlements. Diego is looking at it. The login flow (`mobile/login`, run with `npm run test:ios:login` by the person
  whose account it uses) is ready for when that works.
- SC-05/06 and SC-08 to 10 need Sched Count. Flows that change data have to undo what they change.

The flows open **qa reminders 2** (qaengreminders) in production from the app's event search, which only finds public
events: it was made public on 2026-11-13, and the app found it a few minutes later. If it goes private, every flow but
APP-01 fails at the search; after making it public again, the app took about 5 minutes to find it. `mobile/run.sh`
sets the event, session and attendee the flows expect (`MAESTRO_EVENT`, `MAESTRO_SESSION`, `MAESTRO_ATTENDEE`) and the
app to open (`MAESTRO_APP_ID`: Sched Dev on iOS, `com.sched` on Android); set any of them in the shell to point
elsewhere. `mobile/sched-app/common/open-event.yaml` is the shared start (fresh install -> search -> the event); the
screens differ between the two apps (texts and ids), so each flow has an iOS and an Android branch where they do.

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

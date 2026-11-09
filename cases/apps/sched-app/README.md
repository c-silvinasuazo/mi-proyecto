# Sched app regression (iOS and Android)

Run on every Sched app build before it goes to the App Store or Google Play, and when a build changes its toolchain (for example the iOS 27 pipeline, ENG-2275 and ENG-2073). Test builds: iOS through TestFlight ("Sched Dev", shared by Diego); Android APKs shared by Derek until 11/16, then to be confirmed. The store apps and Sched Dev point to production. Use an attendee account with Google SSO, the organizer account, a public QA event on Boost with sessions (one with a description), a private event for the login cases, and record the exact build on every run.

Not covered yet (to run on the next build):

Android: search sessions (APP-07), My Schedule (APP-08), attendee list (APP-10), session feedback (APP-11), registration in the app (APP-12), public profile (APP-14), no download banner (APP-16) and chat (APP-17). No Android test build (APK) has been tested yet, only the Google Play version.

iOS test build (Sched Dev): Google SSO (APP-03), Apple sign-in (APP-05), forgot password (APP-06), registration in the app (APP-12), registration disabled (APP-13), public profile (APP-14), dark mode (APP-15) and no download banner (APP-16).

iOS App Store version: search sessions (APP-07), My Schedule (APP-08), session feedback (APP-11) and registration disabled (APP-13).

All platforms: push notifications (APP-18) need an event with its own native app.

Notes: on an event with an active registration form, the app asks a new attendee to register first (expected). Chat needs both attendees' profiles to be public.

Test build Sched 2.16.2 (7726), iOS, 2026-11-03 (fix for ENG-2228, foreground refresh): when the app comes back to the foreground, session and speaker data refresh (the change shows in lists), but a session or speaker screen that was open keeps the old data until you leave it; an attendee profile edited on the web doesn't update with pull-to-refresh or by leaving the event, only after closing and reopening the app; closing and reopening the app refreshes everything. Results commented on ENG-2228.

| ID | Case | Type / prio | Last run | Automation |
| --- | --- | --- | --- | --- |
| [APP-01](APP-01-install-and-launch.md) | Install and launch |  | see builds | 👤 manual |
| [APP-02](APP-02-open-an-event.md) | Open an event |  | see builds | 👤 manual |
| [APP-03](APP-03-google-sso.md) | Google SSO |  | see builds | 👤 manual |
| [APP-04](APP-04-microsoft-sso.md) | Microsoft SSO |  | see builds | 👤 manual |
| [APP-05](APP-05-apple-sign-in-ios.md) | Apple sign-in (iOS) |  | see builds | 👤 manual |
| [APP-06](APP-06-forgot-password.md) | Forgot password |  | see builds | 👤 manual |
| [APP-07](APP-07-search-sessions.md) | Search sessions |  | see builds | 👤 manual |
| [APP-08](APP-08-add-to-my-schedule.md) | Add to My Schedule |  | see builds | 👤 manual |
| [APP-09](APP-09-session-description.md) | Session description |  | see builds | 👤 manual |
| [APP-10](APP-10-attendee-list.md) | Attendee list |  | see builds | 👤 manual |
| [APP-11](APP-11-session-feedback.md) | Session feedback |  | see builds | 👤 manual |
| [APP-12](APP-12-registration-in-the-app.md) | Registration in the app |  | see builds | 👤 manual |
| [APP-13](APP-13-registration-disabled.md) | Registration disabled |  | see builds | 👤 manual |
| [APP-14](APP-14-public-profile.md) | Public profile |  | see builds | 👤 manual |
| [APP-15](APP-15-dark-mode-ios.md) | Dark mode (iOS) |  | see builds | 👤 manual |
| [APP-16](APP-16-no-download-banner.md) | No download banner |  | see builds | 👤 manual |
| [APP-17](APP-17-chat.md) | Chat |  | see builds | 👤 manual |
| [APP-18](APP-18-push-notifications.md) | Push notifications |  | see builds | 👤 manual |

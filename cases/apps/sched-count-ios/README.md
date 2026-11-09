# Sched Count regression (iOS)

Run on every Sched Count build before it goes to the App Store. Sched Count has two TestFlight builds (Diego, 2026-10-29): production (com.sched.checkin, points to sched.com, real data, no test tools) and β (com.sched.checkinbeta, points to dev2.sched.co, with a "QA" button that generates test QR codes). Use the organizer account (Admin of the event), an attendee account without an admin role, and a QA event on Boost with attendees. A real attendee QR is the one behind the QR icon (top right) on the public site, logged in as that attendee, or on their exported badge.

Also checked on β: a QR that doesn't belong to any attendee (the badge template preview) shows "invalid QR", as expected.

β 1.8.3 (2104), 2026-11-05 (iPhone 15, iOS 26.5.2): ❌ the app stays on a blank white screen after launch, so the login screen never shows. Same issue as the freeze on 1.8.3 (2095) (ENG-754, still unanswered). This blocks testing the new login screen (ENG-2660: centered form with labeled, bordered fields; show/hide password; a purple Login button that's disabled until both fields are filled and shows a spinner while signing in; password autofill; Dynamic Type) and the rest of this regression from SC-04. Reported on ENG-2660.

β 1.8.3 (2108), 2026-11-05 (iPhone 15, iOS 26.5.2): ✅ the app opens (no blank screen). The new login screen (ENG-2660) works: centered layout, labeled and bordered fields, Login button gray until both fields are filled and purple after, spinner while signing in, form moves up with the keyboard, show/hide password, no clear (x) buttons, and a real organizer login works. Dynamic Type not checked yet. Regression on 2108 (qaengreminders on Boost): SC-04 ⚠️ opening the event shows the sessions by day instead of the attendee list (to confirm if intended); SC-05 ✅ search and check-in; SC-06 ✅ undo; SC-07 ✅ camera permission; SC-08 ✅ a personal attendee QR (QR icon on the public site) checks the attendee in; SC-09 ❌ scanning the same QR again records a second check-in instead of "already checked in", and the attendee list shows the entries as "Ticket" instead of the attendee's name → ENG-2670 (filed 2026-11-05, unassigned; Tony and Saša asked to review and prioritize). SC-10 ❌ after the scans, the attendee's profile in the editor shows no check-in (check-ins from Sched Count's search do sync); added to ENG-2670. SC-11 not run (QA events have no tickets).

| ID | Case | Type / prio | Last run | Automation |
| --- | --- | --- | --- | --- |
| [SC-01](SC-01-install-and-launch.md) | Install and launch |  | see builds | 👤 manual |
| [SC-02](SC-02-login-with-an-admin-role.md) | Login with an admin role |  | see builds | 👤 manual |
| [SC-03](SC-03-login-without-an-admin-role.md) | Login without an admin role |  | see builds | 👤 manual |
| [SC-04](SC-04-choose-the-event.md) | Choose the event |  | see builds | 👤 manual |
| [SC-05](SC-05-search-and-check-in.md) | Search and check in |  | see builds | 👤 manual |
| [SC-06](SC-06-undo-a-check-in.md) | Undo a check-in |  | see builds | 👤 manual |
| [SC-07](SC-07-camera-permission.md) | Camera permission |  | see builds | 👤 manual |
| [SC-08](SC-08-check-in-with-a-qr.md) | Check in with a QR |  | see builds | 👤 manual |
| [SC-09](SC-09-same-qr-twice.md) | Same QR twice |  | see builds | 👤 manual |
| [SC-10](SC-10-shown-in-sched.md) | Shown in Sched |  | see builds | 👤 manual |
| [SC-11](SC-11-ticket-qr.md) | Ticket QR |  | see builds | 👤 manual |
| [SC-12](SC-12-log-out.md) | Log out |  | see builds | 👤 manual |

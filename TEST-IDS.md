# Test ids to ask the developers for

The tests find most elements by role and visible name, or by stable ids such as `#add-session-title`. The elements
below have neither, so the tests depend on CSS classes, page structure or screen position, and break when the markup
changes. A `data-testid` (web) or an accessibility identifier (apps) on each would make them stable. Nothing here is
filed yet.

## Web (event site, editor, Check-In App)

| Element | What the tests use now | Used by | Suggested id |
| --- | --- | --- | --- |
| Check-in circle on an attendee's row (Check-In App) | `label.sched-checkbox`, with the real checkbox hidden behind it | checkin-android, f8-checkin | `checkin-toggle` on the label, and an accessible name ("Check in <name>") |
| Attendee row in Name Search (Check-In App) | `#name-search-list .person` | checkin-android | `name-search-result` |
| Check-In App menu button | `[ng-click*="menu.toggle"]` | checkin-android | `checkin-menu` |
| Event site menu button on a phone | `.button--menu` | eph-iphone | `site-menu`, and an accessible name ("Menu") |
| Session block on the public session page (frozen, in My Schedule) | `.list-single__event .event` and its `frozen` / `sub` classes | f9 (REG-105, ENG-2762) | `session-detail`, with `data-frozen` and `data-in-schedule` |
| Session links on the public schedule | `a[href*="event/"]` | public-site, areas | `schedule-session-link` |
| Attendee directory entries | `.sched-container-people .sched-person` | eph-iphone (APP-10 web) | `directory-person` |
| Description editor (Froala) in the session form | `#session-add-tab .fr-element` | f9, public-site, eph-iphone | `session-description-editor` |
| Freeze session switch | `#edit-frozen-enable + .slider` (the input is hidden behind the slider) | f9 | an accessible name on the switch, like the "Secret session" one has |
| Photo and file upload areas (Dropzone) | the hidden file input, found through `window.Dropzone` | preconditions, people, f9 | `session-photo-input`, `person-photo-input` on the inputs |
| Main login form fields (sched.com/login) | the first and second textbox in `main`: their labels aren't linked to the inputs | helpers (`login`), auth setup | link the labels (`for` / `id`) |
| Editor login form fields (/editor/login) | the first textbox of the form that has a password field | helpers (`logInToEph`) | link the labels |
| CFP application form fields (speaker and session steps) | Each field's position in the speaker block (Name, Email, Company, Position, LinkedIn, Instagram), since the labels aren't linked to the inputs | eph/f7-cfp (`CfpForm.apply`) | link the labels, or `cfp-speaker-<n>-name` and so on |
| Form and status filters on the CFP organizer's Applications page | Naive UI's `.n-base-selection`, told apart by their placeholder text ("All forms", "All statuses") | eph/f7-cfp (`CfpOrganizer.sync`) | `applications-form-filter`, `applications-status-filter` |
| Switches in the CFP "Sync with Sched" dialog | `.n-switch`, found through the row that holds its label; the switches have no accessible name | eph/f7-cfp (`CfpOrganizer.sync`) | accessible names ("Sync Applicants" and so on), or `sync-applicants`, `sync-sessions`, `sync-attach-applicants` |
| "To" field of a new CFP message, its recipients and its list | `.n-base-selection`, `.n-tag`, `.n-base-select-option` and the list's scrollbar `.n-scrollbar-rail__scrollbar` | eph/f7-cfp (REG-216) | `message-recipients` on the field, `message-recipient` on each tag |
| "Log in" and "Forgot password?" in the CFP login modal | A plain div found by its text (it isn't a button or link, so the keyboard can't reach it either; noted in ENG-2091's review) | eph/f7-cfp (`CfpForm.logIn`) | make them buttons |

## Sched app (iOS)

| Element | What the flow uses now | Used by | Suggested fix |
| --- | --- | --- | --- |
| Email and password fields on "Sign in with Sched" | A tap at a fixed spot on the screen (50%, 58%), since only their labels are in the accessibility tree | mobile/login | accessibility identifiers (`signin-email`, `signin-password`); this also lets VoiceOver reach them |

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

## Placeholders by target

| Target | File | Checks |
| --- | --- | --- |
| eph | eph/f1-signup | REG-012, REG-013, TC-F1-04/05 |
| eph | eph/f2-events | TC-F2-01/04/08, REG-014, ENG-271 |
| eph | eph/f3-login | TC-F3-02, TC-F3-08 |
| eph | eph/f6-registration | REG-101, REG-206, REG-207, REG-125, TC-F6-05 |
| eph | eph/f8-checkin | REG-113, ENG-544/545/546, TC-F8-05, REG-117, ENG-241 |
| eph | eph/f9-sessions | REG-208, REG-209, REG-210, ENG-2244, REG-106, REG-105, REG-104, REG-211, REG-107, REG-127, REG-120, ENG-87 |
| eph | eph/f10-control-panel | TC-F10-01/02/04/06, REG-112 |
| eph | eph/public-site | REG-103, REG-102, REG-220 (also Safari), ENG-1568, REG-129 |
| eph | eph/feedback-profiles | REG-118, REG-221, ENG-2588, ENG-2592, REG-222, REG-223, REG-124, ENG-1543, ENG-2641, ENG-2217 |
| dev2 | dev2/f4-payments | REG-001 to REG-006, REG-017, REG-202 to REG-205, TC-F4-03/07/09, SCH-16 |
| cfp | cfp/f7-cfp | TC-F7-01 to 06, REG-108, REG-109, REG-111, REG-212 to REG-216, ENG-1328, ENG-1565, ENG-2091, ENG-2267 (also iPhone), ENG-450 |

Open bugs kept as checks (expected to fail until fixed): ENG-241, ENG-87, ENG-1543, ENG-2091, ENG-2267, ENG-2293.

## Stays manual

| Check | Reason |
| --- | --- |
| REG-009, REG-010, TC-F1-09, TC-F3-04/05 (Google and Microsoft SSO) | Third-party login; doesn't work on eph |
| REG-011, REG-015, REG-121, REG-122, REG-123, REG-126, REG-217, REG-218, REG-219, REG-225, ENG-2228, ENG-2253, APP-01 to APP-18 | Native apps (Sched) |
| REG-114, REG-115, REG-116, SC-01 to SC-12 | Sched Count app and camera |
| REG-119 | Push needs an event with its own app |
| REG-201, REG-110, ENG-1328 email part, reminders (TC-F9-04) | Email delivery |
| REG-016 | Covered by the existing screenshot tests in eph |
| ENG-2221 to ENG-2224 | Security findings: verify fixes only |
| ENG-2633 | Anti-abuse limit; needs an account at the limit |
| REG-128, REG-224, F5 cases | Billing not testable yet |

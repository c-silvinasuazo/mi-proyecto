# F5 — Sched subscription billing

Source: Sched Commercial Platform PRD and the Chargebee tickets in Linear (ENG-1751, ENG-1754, ENG-2125, ENG-2126, ENG-2192, ENG-2229). Previous F5 cases (upgrade banner, plan features, overage, waiver, service fee, cancellation) were on hold during the billing rework and are replaced by this draft.

Open questions before testing (to ask when it's ready to validate):

Which environment and Chargebee site to test on; is there a feature flag?

Which cases ship first (the pricing page and login gate tickets look like the first release)?

How to get test accounts with an active new-plan subscription (Event and Organization) and with different org roles?

Which test cards the Chargebee test site uses?

Which are the "3 surfaces" for the pricing table (marketing site, event dashboard, org dashboard)?

| ID | Case | Type / prio | Last run | Automation |
| --- | --- | --- | --- | --- |
| [TC-F5-P01](TC-F5-P01-pricing-page-hierarchy.md) | Pricing page hierarchy | Positive | not run | not mapped yet |
| [TC-F5-P02](TC-F5-P02-event-plan-bands.md) | Event plan bands | Positive | not run | not mapped yet |
| [TC-F5-P03](TC-F5-P03-prices-and-discounts.md) | Prices and discounts | Positive | not run | not mapped yet |
| [TC-F5-P04](TC-F5-P04-enterprise.md) | Enterprise | Negative | not run | not mapped yet |
| [TC-F5-P05](TC-F5-P05-chargebee-unavailable.md) | Chargebee unavailable | Edge | not run | not mapped yet |
| [TC-F5-R01](TC-F5-R01-logged-out-visitor.md) | Logged-out visitor | Positive | not run | not mapped yet |
| [TC-F5-R02](TC-F5-R02-logged-out-existing-customer.md) | Logged-out existing customer | Positive | not run | not mapped yet |
| [TC-F5-R03](TC-F5-R03-login-abandoned.md) | Login abandoned | Negative | not run | not mapped yet |
| [TC-F5-R04](TC-F5-R04-logged-in-no-active-subscription.md) | Logged in, no active subscription | Positive | not run | not mapped yet |
| [TC-F5-R05](TC-F5-R05-customer-without-billing-permission.md) | Customer without billing permission | Negative | not run | not mapped yet |
| [TC-F5-R06](TC-F5-R06-session-expires-mid-flow.md) | Session expires mid-flow | Edge | not run | not mapped yet |
| [TC-F5-U01](TC-F5-U01-second-event-on-the-event-plan.md) | Second event on the Event plan | Positive | not run | not mapped yet |
| [TC-F5-U02](TC-F5-U02-upgrade-accepted.md) | Upgrade accepted | Positive | not run | not mapped yet |
| [TC-F5-U03](TC-F5-U03-payment-declined.md) | Payment declined | Negative | not run | not mapped yet |
| [TC-F5-U04](TC-F5-U04-upgrade-closed.md) | Upgrade closed | Negative | not run | not mapped yet |
| [TC-F5-U05](TC-F5-U05-network-failure-during-payment.md) | Network failure during payment | Edge | not run | not mapped yet |
| [TC-F5-U06](TC-F5-U06-organization-plan-events.md) | Organization plan events | Positive | not run | not mapped yet |
| [TC-F5-S01](TC-F5-S01-soft-attendee-cap.md) | Soft attendee cap | Edge | not run | not mapped yet |
| [TC-F5-S02](TC-F5-S02-buffer-hidden.md) | Buffer hidden | Negative | not run | not mapped yet |
| [TC-F5-B01](TC-F5-B01-billing-portal-owner.md) | Billing portal (Owner) | Positive | not run | not mapped yet |
| [TC-F5-B02](TC-F5-B02-billing-permissions.md) | Billing permissions | Negative | not run | not mapped yet |
| [TC-F5-W01](TC-F5-W01-subscription-sync.md) | Subscription sync | Positive | not run | not mapped yet |
| [TC-F5-SM01](TC-F5-SM01-schedmin.md) | Schedmin | Positive | not run | not mapped yet |
| [TC-F5-L01](TC-F5-L01-legacy-plans.md) | Legacy plans | Positive | not run | not mapped yet |
| [TC-F5-L02](TC-F5-L02-no-card-data-in-sched.md) | No card data in Sched | Negative | not run | not mapped yet |

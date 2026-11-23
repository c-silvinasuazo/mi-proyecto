# F4 — Ticket payments

| ID | Case | Type / prio | Last run | Automation |
| --- | --- | --- | --- | --- |
| [TC-F4-01](TC-F4-01-paid-ticket-logged-in.md) | Paid ticket, logged in | Positive | passed | 🟡 placeholder |
| [TC-F4-02](TC-F4-02-guest-checkout-share.md) | Guest checkout + share | Positive | passed | 🟡 placeholder |
| [TC-F4-03](TC-F4-03-coupon.md) | Coupon | Positive | passed | 🟡 placeholder |
| [TC-F4-04](TC-F4-04-price-and-currency.md) | Price and currency | Edge | partial | 🟡 placeholder |
| [TC-F4-05](TC-F4-05-sold-out.md) | Sold out | Edge | passed | 🟡 placeholder |
| [TC-F4-06](TC-F4-06-pay-by-invoice.md) | Pay by invoice | Positive | passed | 🟡 placeholder |
| [TC-F4-07](TC-F4-07-declined-card.md) | Declined card | Negative | passed | 🟡 placeholder |
| [TC-F4-08](TC-F4-08-guest-checkout-without-paying.md) | Guest checkout without paying | Negative | passed | 🟡 placeholder |
| [TC-F4-09](TC-F4-09-manage-tickets-link-by-email-type.md) | Manage Tickets link by email type | Positive | passed | 🟡 placeholder |
| [TC-F4-10](TC-F4-10-free-ticket-as-guest.md) | Free ticket as guest | Positive | passed | not mapped yet |
| [TC-F4-11](TC-F4-11-guest-checkout-on-mobile.md) | Guest checkout on mobile | Positive | partial | not mapped yet |
| [TC-F4-12](TC-F4-12-save-and-clear-vat-ids.md) | Save and clear the VAT IDs in Schedmin | Positive | not run | ✅ |
| [TC-F4-13](TC-F4-13-vat-needs-both-ids-and-currency.md) | VAT turns on only with both IDs and a non-CAD/GBP/AUD/USD currency | Negative | not run | 🟡 placeholder |
| [TC-F4-14](TC-F4-14-vat-notice-on-ticket-picker.md) | Ticket picker notice says VAT for EUR/CHF, Tax for other currencies | Positive | not run | 🟡 placeholder |
| [TC-F4-15](TC-F4-15-vat-at-card-checkout.md) | Card checkout charges the organizer's VAT rate as its own line | Positive | not run | 🟡 placeholder |
| [TC-F4-16](TC-F4-16-vat-on-fee-line.md) | Only ticket lines are taxed when the fee is absorbed; the fee is taxed when passed on | Edge | not run | 🟡 placeholder |
| [TC-F4-17](TC-F4-17-existing-taxes-not-stacked.md) | CAD/GBP/AUD/USD events with the new fields filled still apply only their own tax | Negative | not run | 🟡 placeholder |
| [TC-F4-18](TC-F4-18-vat-rate-per-event.md) | Two events with different rates each charge their own rate | Positive | not run | 🟡 placeholder |
| [TC-F4-19](TC-F4-19-vat-new-orders-only.md) | Orders created before the IDs were saved don't change | Edge | not run | 🟡 placeholder |
| [TC-F4-20](TC-F4-20-existing-taxes-regression.md) | CA GST, UK VAT, AU GST and US state tax behave as before | Positive | not run | 🟡 placeholder |
| [TC-F4-21](TC-F4-21-schedmin-rejects-bad-ids.md) | Schedmin rejects IDs without the txr_ / txi_ prefix | Negative | not run | ✅ |
| [TC-F4-22](TC-F4-22-new-php-old-binary.md) | New PHP with the old payment binary charges no VAT | Edge | not run | 👤 manual |
| [TC-F4-23](TC-F4-23-wrong-or-archived-rate-id.md) | Checkout with a wrong or archived rate ID | Negative | not run | 🟡 placeholder |
| [TC-F4-24](TC-F4-24-vat-on-invoice-checkout.md) | Invoice checkout shows VAT and the organizer's VAT number | Positive | not run | 🟡 placeholder |

TC-F4-12 to TC-F4-24 are the ENG-2884 cases (German VAT on EUR events). The ticket's M1–M14 numbers are in each case's steps; the document they come from isn't linked yet.

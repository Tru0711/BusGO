# BusGo Features

Feature modules should live here when a workflow grows beyond a single page.

Recommended modules:

- `auth`: login, register, OTP, password reset
- `search`: routes, filters, bus details
- `booking`: passenger details, seat selection, payment, confirmation
- `wallet`: transactions, refunds, reward points
- `vendor`: fleet, routes, schedules, revenue
- `admin`: approvals, moderation, reports, settings

Keep route-level screens in `pages`, shared UI in `components`, and API clients in `services`.

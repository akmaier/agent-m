---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 320d7ebe8c0002220c2bf1b46962fddf52f1ee61
  - https://github.com/akmaier/agent-m/pull/463
date: 2026-10-12 22:14 UTC
---
# Development → Release testing: ITM-429, a connected mailbox, its disconnect and its processing places

**REGISTER**

## Reason

ITM-429, pull request #463 by developer-sonnet-a into `sprint/team1/24`, head `320d7eb`. The tests-only commits
`7731a3b` and `c86daf3` were red on the five new tests alone (runs 38313650822, 38314547587), and `320d7eb` is green
(run 38314780318, 2144 tests, 0 failures). The code changes only `src/settings-pages/`; the new test names
MOD-settings-pages and its guards, and 20 faults are recorded. The Acceptance holds: the line with its route, folders
and places; *Disconnect* asking once and leaving no key of the connection or its sign-in; the withdrawal page on the
Microsoft route; changed places stored, a place outside the EU only after its notice; no request to a repository host.

The points weighed:
- One fault, the withdrawal link shown on the IMAP route, makes the test file wait until it is stopped, 73 seconds,
  rather than fail an assertion. The fault is caught — the test does not pass —, so the counter-proof holds, as it did
  for #444's w14; and a test that waits only under a fault keeps `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` on green
  code. That a regression of this kind would show as a stopped job rather than a named assertion is noted for the review.
- *Disconnect* asks with `globalThis.confirm`, as every *Clear* of `settings.mjs` does today, while MOD-settings-pages'
  file names MOD-site-frame's `confirmDecision` among its uses for a decision's dialog; the settings page's confirmations
  as a whole are noted for the review, not this item's alone.

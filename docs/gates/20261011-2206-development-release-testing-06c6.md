---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 28ce5a0ed518ed202aa01876c1270291d67defe1
  - https://github.com/akmaier/agent-m/pull/438
date: 2026-10-11 22:06 UTC
---
# Development → Release testing: ITM-428, connecting a Microsoft 365 mailbox

**REGISTER**

## Reason

ITM-428, pull request #438 by developer-sonnet-a into `sprint/team1/22`, head `28ce5a0`. The tests-only commits
`d5e3064` and `63479ae` were red on the new tests alone (runs 38178406452, 38178704318); CI is green on `28ce5a0` (run
38178873253, 2030 tests, 0 failures). The code changes only `src/settings-pages/mailbox.mjs`; the new test names
MOD-settings-pages and its guards, and 29 faults are recorded. The Acceptance holds: the permissions named before the
window opens; the return address with its copy button; a declined permission named and nothing stored; a stored
connection with the client identifier and no password; the test's counts; an expired sign-in asked again.

The points weighed: the page signs in only through MOD-mail-routes' `signIn` and names no authority itself, so the
open question for akmaier — `/common` against `organizations` — stays where it is, in `graph-route.mjs`, unsettled by
this item. *Sign in* stores nothing, and *Store and test* stores the client identifier and the account; what would not
work without each permission is worded from UC-037 3a; an expired sign-in is shown where *Store and test* meets it. The
return address shown over this repository is `https://akmaier.github.io/agent-m/`, MOD-identifiers' `pagesAddress` and
`signIn`'s return address alike.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4b5b37fd0f68725dfd2b6503dfa64c8f2183ee93
  - https://github.com/akmaier/agent-m/pull/428
date: 2026-10-11 21:10 UTC
---
# Development → Release testing: ITM-427, connecting a mailbox over IMAP through a Bridge

**REGISTER**

## Reason

ITM-427, pull request #428 by developer-sonnet-a into `sprint/team1/21`, head `4b5b37f`. The tests-only commits
`22327a8` and `9fdfde4` were red on the twelve new tests alone (runs 38174470995, 38174760662); CI is green on
`4b5b37f` (run 38174953712, 1986 tests, 0 failures). The code changes only `src/settings-pages/`; the new test names
MOD-settings-pages and its guards, and 40 faults are recorded, the four that survived on the draft killed by
`9fdfde4`. The Acceptance holds, and the export's statement now names the sign-in's tokens and the password with what
each grants (`AN EXPORT STATES THAT IT CONTAINS SECRETS`), as #413's gate noted for this item.

The points weighed:
- Where the library loads. ARC-053: the library "is loaded only by the pages that reach the mailbox". The settings
  routes, now with `mailbox`, are loaded by the dashboard page `docs/index.html` through `dashboard-app.mjs`, which is
  the page whose Settings reach the mailbox; the main page `index.html` and the Bridge's window load neither the
  settings pages nor MOD-mail-routes. As built, ARC-053 holds: no change between jobs and no question is needed now. A
  page that imports the settings routes without reaching the mailbox would break it, and is noted for the review.
- The EU place rule. `A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT` and UC-037 step 6 ask the notice for a place
  outside the EU; a participant declares its place "in words" (MOD-participant-list), and no text says how words are
  read as inside or outside. The page takes `this machine` and a place naming the EU or a member state as inside and
  every other as outside, so an unclear place gets the notice, which the person may still accept and which the
  connection records — it warns where in doubt and allows nothing the texts forbid. That a place in the EU named
  without those words (UC-017's `NHR@FAU, Erlangen`) is noticed as outside, and whether a participant should declare
  it, is noted for the review.

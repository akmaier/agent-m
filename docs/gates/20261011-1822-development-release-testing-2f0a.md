---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b4513a7a372e62c4763686e37a44de41647e7923
  - https://github.com/akmaier/agent-m/pull/392
date: 2026-10-11 18:22 UTC
---
# Development → Release testing: ITM-403, each Bridge kept under its name in the browser

**REGISTER**

## Reason

ITM-403, pull request #392 by developer-sonnet-a into `sprint/team1/18`, head `b4513a7`. The first commit `88c75ff`
holds only `tests/browser-store-bridges-by-name.test.mjs`, and CI was red on it (run 38163237038): its six tests fail,
and no other test does. CI is green on `b4513a7` (run 38163348539, 1634 tests, 0 failures). The code changes only
`src/browser-store/catalogue.mjs` and `index.mjs`; every new test names MOD-browser-store and its guards, and 14
planted faults are recorded, at least one for each test. The Acceptance holds: two Bridges of each form kept, listed,
exported and imported with their tokens, one cleared with its entry removed, and an endpoint naming its Bridge.

The reading weighed: the Outcome says `bridge:<name>` replaces the single `bridge` and `remote-session:<name>`; the
pull request adds the family and keeps both old keys accepted. The Acceptance requires that the existing tests stay
green with no expected result changed and that only `src/browser-store/` changes, and MOD-settings-pages
(`src/settings-pages/bridge.mjs`) still writes both old keys, so a store that refused them would fail those tests. The
two cannot both hold in this item; the reading the Acceptance allows is taken (AGENTS.md §6a.6). Removing the old keys
belongs where their writers change to `bridge:<name>`, MOD-settings-pages' route `bridge` (ITM-405); it is noted for
the sprint review.

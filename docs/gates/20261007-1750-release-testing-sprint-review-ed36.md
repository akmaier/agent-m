---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c1aa81faa5fa2f614411bc798d36db303908cdf7
date: 2026-10-07 17:50 UTC
---
# Release testing → Sprint review: sprint 11

**REGISTER**

## Reason

Sprint 11, ended by the Product Owner (`6a8fb00`), on `sprint/11` at `c1aa81f`. Of its selection, ITM-246, ITM-247 and
ITM-252 are done (#190, #189, #191). ITM-239, ITM-271 and ITM-237 wait on events outside this team.

**The release tests of the selected items.**
- ITM-246's (#190): `tests/dashboard-notifications.test.mjs`, the release tests `SPEC.md` names for
  `A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE` and `NOTIFICATIONS ARE SWITCHED ON BY THE PERSON`. They run through
  the main page and the review pages.
- ITM-247 and ITM-252 add no behaviour that a release test must reach yet. Nothing outside their modules calls
  `listTags`, `createTag`, `appendSection` or MOD-job-ledger: a `git grep` on `c1aa81f` over `src/`, `docs/assets/` and
  `index.html` finds only the three modules themselves.
- Their behaviour reaches a person through ITM-239, whose release tests are ITM-271's, and through UC-013's release
  panel, whose are ITM-257's. MOD-documents' existing tests stay green.

**Written by a participant other than the implementer of the behaviour they test.** developer-sonnet-e wrote ITM-246's.
It implemented none of UC-047 nor any code of this sprint:
- MOD-notifications is developer-sonnet-c's (ITM-236), and its wiring developer-sonnet-a's (#157, #163);
- `waitingForAcceptance` is developer-sonnet-b's (ITM-235);
- this sprint's ITM-247 is developer-sonnet-d's, and ITM-252 developer-sonnet-b's.

**Green on the sprint branch.** Run 37661583880, on `sprint/11` merged into `main` at `2074a73`, passes:
- node: 882 tests, 871 pass, 0 fail, 11 todo; python: 396, OK.
- The 11 todo tests are those from before this sprint; none is UC-002's or ITM-246's.

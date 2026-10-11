---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2a45c107a232b47c937c0c76731a8fcfde3c70df
  - https://github.com/akmaier/agent-m/pull/384
date: 2026-10-11 17:03 UTC
---
# Development → Release testing: ITM-344

**REGISTER**

## Reason

ITM-344, pull request #384 by developer-sonnet-b into `sprint/team1/17`, on head `2a45c10`, against the item and
MOD-site-frame's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `eb4f2e8`, holds only `tests/site-frame-run-panel.test.mjs`, and CI was red on it (run 38157277216):
  node failed on exactly its 10 tests.
- CI is green on the head (run 38157456985): node 1542 tests, 0 failed; python 441 tests, OK.
- Only MOD-site-frame's folder — `runPanel` in the new `run-panel.mjs`, the export of `index.mjs` — and the new test
  whose header names the module change; no existing test or expected result changes.
- The 10 new tests name what they guard — among them `THE PAGE STATES WHAT IT SENDS WHERE`, `ONE CLICK PER DECISION` and
  `THE CORRECTION LOOP HAS A FIXED LIMIT` — and MOD-site-frame, with 42 faults planted on the draft and on the code.
- The Acceptance holds, for fixture `Prepared` values: the destinations and parts with their sizes; a participant whose
  context is too small, named, with no *Run*; a part left out with its reason; a blocking finding with no *Run*; *Run*
  calling `onRun` once.

Noted for the sprint's review, no condition of this gate: the readings the pull request names — the layout pinned by
class names, *Run* offered only when nothing blocks and everything fits, a double press as one decision, findings shown
by their fields.

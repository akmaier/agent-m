---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 6b8b366c3a539781647de161ea56d1145ba5e13f
  - https://github.com/akmaier/agent-m/pull/760
date: 2026-10-17 19:59 UTC
---
# Release testing → Sprint review: sprint team2/77

**REGISTER**

## Reason

Sprint team2/77 was ended on `sprint/team2/77` at `6b8b366c`. Its done items are merged on the heads their gates passed:
- ITM-702 with #746 at `3739d875` (gate record 2026-10-17 19:48);
- ITM-650 with #759 at `a4c48e84` (gate record 2026-10-17 19:52).

No selected item is unfinished.

**The release tests.** Run 39064565248, on #760 at `6b8b366c` merged into `main` at `fe81eb75`, runs every level: each
of the ten jobs runs `mode=all`, as the base is `main`, not a sprint branch. All ten pass. I read the ten logs.
The first run, 39064415057, failed in python (1) on `test_backlog_layout`: two items named ITM-818. With
`fe81eb75` on `main` (ours is ITM-820) every test of `test_backlog_layout` is `ok`.
- **python (0) and (1)** end `OK`: 259 tests (3 skipped, 3 expected failures) and 257 tests (2 skipped, 2 expected
  failures).
- **The sprint's tests**, both items `level: module`, `tests: unit`; neither asks for release tests, and the sprint
  added none:
  - ITM-650: `test_expected_results_stated`, 4 cases, all `ok`, the list printed;
  - ITM-702: `test_groups`, 29 cases, 28 `ok`, 1 skipped ("this repository has no group files").
  Each file holds as many tests as the log shows lines for it.
- **node (0) to (7):** seven logs end `# fail 0`, 3373 tests, 10 todos; the eight `not ok` lines printed are each
  `# TODO FINDING`. The log of node (2) ends without the TAP summary lines; its step "Dashboard core" and the job conclude
  `success`, and it prints no `not ok`.

**Who wrote them.** No release test was written in this sprint, so none was written by a developer who implemented the
behaviour it tests.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bb2a555e7ccf96e547ac58f58ec58e558fa3dee3
  - https://github.com/akmaier/agent-m/pull/345
date: 2026-10-11 11:56 UTC
---
# Development → Release testing: ITM-306

**REGISTER**

## Reason

ITM-306, pull request #345 by developer-sonnet-b into `sprint/team1/14`, on head `bb2a555`, against the item and
MOD-trace-graph's accepted file as they stand on the sprint's branch and on `main`. All five points hold:
- The first commit, `91af946`, holds only `tests/trace-graph-checks.test.mjs`, and CI was red on it (run 38136352004):
  node failed on exactly its 14 tests — 1293 tests, 14 failed. The two tests-only commits after it, red too, add rows the
  code's guards need, before any code.
- CI is green on the head (run 38137064180): node 1293 tests, 0 failed; python passed.
- Only MOD-trace-graph's folder — the new `checks.mjs`, the exports and header of `index.mjs` — and the new test whose
  header names the module change; no existing test or expected result changes. The checks use `pagesAddress` and
  `finding`, as the module file's uses state.
- The 14 new tests name what they guard and MOD-trace-graph, and have 55 counter-proofs.
- The Acceptance holds: one test per finding the file lists, among them a used interface not provided, a plan step with
  another level's tests, a module folder misnamed and one inside another, a group's title in `realises`, a reference by
  position as a warning, a link to a missing file, to the instance and to its dashboard; and a fixture with none. The rows
  beyond that list are marked in the pull request; each guards an edge of a listed finding or odd input.

Noted for the sprint's review, no condition of this gate: the six readings the pull request names, among them no finding
for a repository without decisions and `release` alone accepted at level system; and, run over this repository, the
checks give 9 errors in existing test declarations' `guards` and 287 position warnings, none of them a draft's. The check
`graph-checks` (ITM-330) runs them on a snapshot with a draft's files: `A DRAFT THAT FAILS A CHECK GOES BACK TO ITS
PARTICIPANT` sends back the draft's findings, which ITM-330 has to tell from those that stand in other files.

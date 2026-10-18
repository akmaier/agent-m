---
id: ITM-892
title: End sprint refuses a sprint that has no record
level: module
realises:
  - UC-032
  - ONE CLICK PER DECISION
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - found by po-opus-b at sprint 89's start decision
---
# ITM-892 End sprint refuses a sprint that has no record

**REGISTER**

## Outcome

MOD-work-plans.md:205-207: `endSprint` "appends `## Ended` with the date to a sprint without a time box. Errors:
`NotEndable` …; and the host's." An unknown sprint has no record to append to. The path, on `main`:
- `src/work-plans/saves.mjs:138-140` reads `docs/backlog/sprints/<sprint>.md`, which `Snapshot.read` gives as `null` for
  a missing path (MOD-repository-hosts.md:106-108);
- `:141` and `:148` read and append to it with no check, and `:150` commits a new file.
Verified with a fake host like the one of `tests/work-plans-end-sprint.test.mjs`: `team2/01`, which exists without a
time box, gets its `## Ended` (the known positive); `team2/99`, which does not exist, is committed as a new file holding
only `"\n## Ended\n\nat: 2026-10-18\n\n"`; `closeSprint` for `team2/99` throws `NotFound` (`saves.mjs:205-206`).

The fix: `endSprint` of a sprint with no record throws `NotFound { path }` as `closeSprint` does, and writes nothing.

## Acceptance

- A unit test naming MOD-work-plans: `endSprint` of an unknown sprint throws `NotFound` naming the path, and no commit is
  made; the existing tests of `endSprint` stay green with no expected result changed.
- The first commit holds only the test, and CI is red on it. No stub is committed.
- Only `src/work-plans/` and the tests that name MOD-work-plans change.

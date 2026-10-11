---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 68ef55c4b6f9dbdf9eb0687f602c8418a87e3d2c
  - https://github.com/akmaier/agent-m/pull/426
date: 2026-10-11 21:09 UTC
---
# Development → Release testing: ITM-364, the instance's workflow entry that applies approvals

**REGISTER**

## Reason

ITM-364, pull request #426 by developer-sonnet-d into `sprint/team1/21`, head `68ef55c`. The tests-only commits
`139dd36` and `5a8e089` were red on the four new tests alone (runs 38174392343, 38174673021); CI is green on
`68ef55c` (run 38174935602, 1960 tests, 0 failures). The code changes only `src/workflow-entries/`; the new test,
on a temporary git repository, names MOD-workflow-entries and its guards, and 22 faults are recorded, 18 killed. The
Acceptance holds: an approval committed without the dashboard applied in one commit, byte for byte as `acceptEntries`
writes it; a stale approval writing nothing and named in the status; nothing to apply giving `nothing to do`; a
missing token giving `not run`, naming it, before anything is written.

The points weighed:
- The environment's names, read at the gate in GitHub's documentation ("Variables", default environment variables):
  `GITHUB_ACTIONS`, `GITHUB_EVENT_NAME`, `GITHUB_EVENT_PATH`, `GITHUB_WORKSPACE`, `GITHUB_SERVER_URL`,
  `GITHUB_REPOSITORY`, `GITHUB_REF_NAME` (the short name of the branch that triggered the run) and `GITHUB_SHA` stand
  there as the code reads them; `GITHUB_TOKEN` does not, and the entry reads it as the token the workflow passes to
  the step, as its summary says. The branch from `GITHUB_REF_NAME`, `runEntry`, `CiEnvironment` and the exit code
  — 0 for `done` and `nothing to do`, else 1 — read MOD-workflow-entries' file as it stands.
- The survivor F12: MOD-workflow-entries' file states that "the status names what was applied and what was stale", so
  an approval refused beside one applied is behaviour the file gives; the code applies the one and names both, but no
  test pins it, since the Acceptance's four cases do not include it. A stale approval ending `failed` with its finding
  is the reading that never shows a refused approval as passed. The untested case is noted for the review, with F04 and
  F22; F02 is equivalent.

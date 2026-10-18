---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - be1a3c5f62c089f898b0e4f835abd921ae178aed
  - https://github.com/akmaier/agent-m/pull/878
date: 2026-10-18 10:01 UTC
---
# Development → Release testing: ITM-799, Who works on what

**REGISTER**

## Reason

ITM-799, pull request #878 into `sprint/team2/90`, passes on `be1a3c5f`: `whoWorksOnWhat` as MOD-progress-measures.md:212-214
(accepted blob 1395bb4b) and UC-035 step 5 and 1b state it.

- First commit `5014716e` holds only the test file, red in run 39117027535 (`whoWorksOnWhat` not exported); the head is
  green in run 39117172067. Both test the merge with `e331456f`, the sprint's head, which is the pull request's base.
- Scope: `src/progress-measures/overviews.mjs` and `index.mjs` (MOD-progress-measures, the item's module) and
  `tests/progress-measures-who-works-on-what.test.mjs`, new, whose header names the module, UC-035 and
  `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`. The Acceptance holds in the fixture of two teams.
- The readings, settled by the texts (AGENTS.md §6a.6, §6a.7):
  - Participants are those the role assignments name: SPEC `A ROLE ASSIGNMENT FILLS THE ROLES`; UC-043 Actors,
    "Participants of the product's roles — the agents and people assigned in UC-048"; the register's `Participant`
    (MOD-participant-list) has no roles, so `facts.participants` cannot give them.
  - A team is the role assignment's name: MOD-work-plans' sprint path, "`<team>` is the name of the team's role
    assignment"; SPEC `A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM`: several teams are several assignments.
  - Current is not ended (MOD-job-ledger's `JobState`; UC-035's "running and waiting jobs"); jobs of an unreachable source
    are not shown (module line 214, UC-035 1b).
  - A participant with a current job but no role: no defect. SPEC `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` hands no job to
    one, and one whose role was later taken is no participant of the product; the job stays on the job dashboard (UC-036).
  - `unreachable.route` as the path of an unreadable record goes beyond `route: string` and "each source": drafted for
    akmaier in the module file, with the listing of a source once per reason.
- Agreement 83, on the head with LC_ALL=C after the npm install: all of `tests/*.test.mjs` (4,379 tests; 3 fail:
  TST-321001 and TST-320321902, known on main, and a library test that passes alone on head and base),
  `tests/release-sprint-02-d-traceability.test.mjs` 8 pass, `tests/test_progress_derived.py` 3 pass.
- Counter-proofs replayed: `done` as current fails TST-799001; teams in a product with one assignment and `held` as `[]`
  fail TST-799002; the reachable check as `true` fails TST-799001 and TST-799003; no dedupe fails TST-799003.

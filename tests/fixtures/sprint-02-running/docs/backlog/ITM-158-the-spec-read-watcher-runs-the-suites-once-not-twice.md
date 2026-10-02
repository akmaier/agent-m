---
id: ITM-158
title: The SPEC-read watcher runs the suites once, not twice — CI's Python step back from 117 to about 50 seconds
kind: refactoring
level: 1
realises:
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - UC-022
modules:
  - MOD-artifacts
depends_on:
  - ITM-128
origin: release tests of sprint 02, strand C (ITM-144); its record's cost note
---
# ITM-158 The SPEC-read watcher runs the suites once, not twice — CI's Python step back from 117 to about 50 seconds

**REGISTER**

## Outcome

`tests/test_release_sprint_02_c.py` (ITM-144) checks that no test opens Agent M's own `SPEC.md` by running both suites once
more under a watcher — an audit hook in every Python process, a module every node process loads first. It is the right
check (a read under any spelling, through any reader, is seen; the watcher is shown to see each planted way first), and it
doubles CI's Python step: 46 s before, 117 s with it (ITM-144's record, *Files and commands*; the sprint 02 gate decisions).
Soll: the watcher sees the one run CI makes, not a second one — CI's workflow starts the two suites with the watcher's
environment set (`PYTHONPATH` to the `sitecustomize`, `NODE_OPTIONS` to the module) and a last step reads the log and fails
when it is not empty; the test file keeps its known-positive case (the planted readers are seen) and loses the two cases
that run the suites. The expected results — nothing seen on either suite, every planted reader seen — do not change.

## Realises

- `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS` — the check ITM-128 realises, kept at the same strength for half the cost
- UC-022 — Derive the architecture (the check guards the reader of requirement names)

## Where it came from

Release tests of sprint 02, strand C (ITM-144, pull request #61 into `sprint/02`): the cost note of
`docs/measurements/2026-10-01_release-tests-sprint-02-c.md` ("it costs about 70 seconds of the Python step"), raised by the
Scrum Master at the gate decisions of 2026-10-02. Not a finding; no mark. The Product Owner filed it because every CI run of
every item pays it.

Architecture decisions its modules follow: ARC-003, ARC-016, ARC-020.

## Modules

- MOD-artifacts (kernel) — for the test file; the CI workflow (`.github/workflows/tests.yml`) carries no module (ARC-020 decision 5, as ITM-050's checks)

The pull request changes only test files that name this module and the workflow (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`); no code file changes.

Files it creates or changes:

- `.github/workflows/tests.yml` (the watcher's environment on the two suite steps; the step that reads the log)
- `tests/test_release_sprint_02_c.py` (the two suite-running cases leave; the known positive stays; the watcher's two helpers move to a file the workflow names)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS` (exists; not changed)

## Acceptance criteria

- CI's Python step on the pull request takes about what it took before ITM-144 (the record names 46 s), measured from the workflow's own timings and recorded; the workflow fails when a planted read of `SPEC.md` is added to any test of either suite, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- The known-positive case of the watcher stays in `tests/test_release_sprint_02_c.py` and is green.
- The S1 case's expectation, as ITM-128's corrected criterion states it (a whole-repository scan may open `SPEC.md` as one file among all), is kept by the workflow's step.
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-128 — its corrected criterion and the adjusted S1 case (sprint 02, strand C)

## Needs a person

No.

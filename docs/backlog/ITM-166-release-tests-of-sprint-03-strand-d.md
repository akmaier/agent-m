---
id: ITM-166
title: Release tests of sprint 03, strand D — the GitHub routes of a refused batch and save, the requirement edge of the graph, the product's token rule and the job records (ITM-151, ITM-156, ITM-149, ITM-037)
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-006
  - UC-008
  - UC-018
modules:
  - MOD-dashboard-app
  - MOD-traceability
  - MOD-run-engine
depends_on:
  - ITM-151
  - ITM-156
  - ITM-149
  - ITM-037
origin: sprint 03 planning
---
# ITM-166 Release tests of sprint 03, strand D — the GitHub routes of a refused batch and save, the requirement edge of the graph, the product's token rule and the job records (ITM-151, ITM-156, ITM-149, ITM-037)

**REGISTER**

## Outcome

The items of strand D of sprint 03 (`docs/backlog/sprints/sprint-03.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/03`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/03`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand; the sprint is not closed before every
strand's gate is decided.

What is tested — each rule and flow as the item realised it:

- **ITM-151** — `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK`, UC-008 3d, 3e with 4a, UC-018 6b: *Accept
  ticked* and *Accept all* refused for missing write access offer one prefilled new-file page per record; a refused
  *Save* offers GitHub's editor of the file; a used-up rate limit and a GitLab product get no such link.
- **ITM-156** — `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`, `THE TRACEABILITY MATRIX IS DERIVED`: a requirement
  that names another in backticks is in that requirement's impact list; a name in prose is not; a withdrawn requirement
  still named by a live one is reported with its note.
- **ITM-149** — `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`, `EVERY STEP EXPLAINS ITSELF`, UC-006 4c: a
  product's SPEC entry without a token offers no GitHub page, says a token is required and links the token step; the
  instance's entry keeps GitHub's page; a product's use case keeps it; a GitLab product is as before.
- **ITM-037** — `A JOB IS RECORDED IN ITS PRODUCT REPOSITORY`, `A JOB IDENTIFIER IS NEVER REUSED`, `THE GATE IS RECORDED`,
  `NO COST IS GUESSED`, `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`, `A RUN IS A JOB THAT NAMES ITS JOBS`, `ONE
  DASHBOARD SHOWS EVERY JOB`: records as the rules describe them, each read back into its parts; identifiers never collide;
  a job without a reported cost says unknown; the seven states, *ended without record* among them, and no eighth.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-006, UC-008, UC-018 — the use cases of the strand's items, tested at level `release`

## Where it came from

Sprint 03 planning (`docs/backlog/sprints/sprint-03.md`), on the Product Owner's practice since sprint 02: release testing
of a sprint's own items is a selected item of that sprint, one per strand, so that the gate *Release testing → Sprint
review* is decided before the close.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-006, ARC-007, ARC-010, ARC-016, ARC-020.

## Modules

- the modules of the strand's items: MOD-dashboard-app (shells), MOD-traceability, MOD-run-engine (kernel)

The pull request changes only test files that name one of these modules and the measurement record; no code file
changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-03-d.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-03-d-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_03_d.py` (new, only for a check better written over the repository's files)
- `docs/measurements/<date>_release-tests-sprint-03-d.md` (new)

## Kind and level

- Job kind: **refactoring** — tests of merged behaviour, no expected result changed, CI green on every commit. A
  release test that is red on `sprint/03` is a finding that goes **back to Development** (the model's transition
  *Release testing → Development*): it stays in the file marked as expected to fail — `{ todo: true }` under
  `node --test`, `@unittest.expectedFailure` under `unittest` — with the item's identifier; the strand's developer
  takes the item up again on a branch of its own, whose first commit removes the mark (red first, as an
  implementation job) and whose pull request makes it green. The gate for the strand is decided as sprint 02 applied
  the rule: a mark goes back when its fix lies inside the item; a mark that names more than the item said, or a reading
  the Product Owner settles otherwise, is an accepted limitation with an item of its own.
- Level: **1** — browser and hosted CI; nothing installed. The tests' own level line is `Level: release`.

## Tests the SPEC names

- none — the SPEC's named checks are built by the items; these are the use-case tests at level `release` (ARC-016).

## Acceptance criteria

- Every test is written from the text of a use-case flow or a SPEC rule and names it in its `Guards:` line; the
  record lists, per test, the flow or rule and the item it tests. The items' own tests and measurement records
  are not its source; read, if at all, after the release tests are written, to name overlaps in the record.
- The tests run green on `sprint/03` at the commit the record names, after the strand's last item is merged; they are
  run on a clean tree, and no test runs a suite inside itself (sprint 02 retrospective).
- A test's input is a fixture or a frozen copy, never the live backlog, sprint records or pull requests of this
  repository (sprint 02's close broke two tests that pinned live state).
- Every test is shown red on a planted fault, the mutation and the red result recorded (`A NEW TEST IS SHOWN TO
  FAIL ON A PLANTED FAULT`).
- A red test is recorded as a finding with the item it sends back to Development, and marked as expected to fail.
- The pull request's first line names `tester-opus`, the model and the commit it started from; the head comment of
  every release test file says the same (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
- Every test file names its module, what it guards and its one level (ARC-020 decision 2).
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB
  RULES`).

## Depends on

- ITM-151, ITM-156, ITM-149, ITM-037 — every item of the strand, merged into `sprint/03`

## Needs a person

No.

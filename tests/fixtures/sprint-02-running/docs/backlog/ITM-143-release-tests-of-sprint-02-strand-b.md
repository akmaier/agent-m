---
id: ITM-143
title: Release tests of sprint 02, strand B — the first slice of the process dashboard (ITM-027, ITM-033, ITM-034, ITM-147)
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-032
  - UC-033
modules:
  - MOD-process-model
  - MOD-work-items
  - MOD-dashboard-app
depends_on:
  - ITM-027
  - ITM-033
  - ITM-034
  - ITM-147
origin: sprint 02 planning
---
# ITM-143 Release tests of sprint 02, strand B — the first slice of the process dashboard (ITM-027, ITM-033, ITM-034, ITM-147)

**REGISTER**

## Outcome

The items of strand B of sprint 02 (`docs/backlog/sprints/sprint-02.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/02`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/02`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand; the sprint is not closed before every
strand's gate is decided.

The strand ends in a view; the release tests run it in `tests/app-harness.mjs` over this very repository — its
`docs/process-models/scrum-wip.md`, its `docs/process.md`, its `docs/backlog/` with `order.md` and the sprint files,
and a pull-request fake that replays the pull requests of sprint 02 as the harness's recorder saw them — and over
fixtures written from the use cases. What is tested — each rule and flow as the item realised it:

- **ITM-027** — `A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED`; `A GATE NAMES WHAT IT CHECKS`; `A GATE NAMES
  WHO DECIDES IT`: Agent M's own model validates; one broken definition per rule of the SPEC's check is refused.
- **ITM-033** — UC-032, UC-033, `THE BACKLOG LIVES IN THE PRODUCT REPOSITORY`, `A BACKLOG ITEM NAMES WHAT IT
  REALISES`: this backlog parses without a problem, an item realising nothing is an error, the order file places
  every item once and appends the unnamed, an item from an issue names the issue as its origin.
- **ITM-034** — `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`; `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR
  IT`; `AGILE IMPLEMENTATION STARTS FROM THE BACKLOG`: with limit 2 and two items in progress a third start is
  refused with the limit named; an item outside the sprint's selection is refused; a job without an item is refused.
- **ITM-147** — UC-032 step 1 and the board of step 7, `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`, `EVERY STEP
  EXPLAINS ITSELF`: the tab shows sprint 02's own board with the states that the pull requests of the sprint give —
  the merged items *done*, an open one *in progress*, the limit named —, the backlog in its order below, the
  uncovered names above; after clearing every browser store and reloading, the same; nothing written; no request
  for an unselected item before the backlog is unfolded.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-032, UC-033 — the use cases of the strand's items, tested at level `release`

## Where it came from

Sprint 02 planning (`docs/backlog/sprints/sprint-02.md`), on the Product Owner's condition at the merge of sprint 01:
release testing of a sprint's own items is a selected item of that sprint, one per strand, so that the gate
*Release testing → Sprint review* is decided before the close.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-006, ARC-016, ARC-019, ARC-020.

## Modules

- the modules of the strand's items: MOD-process-model, MOD-work-items (kernel), MOD-dashboard-app (shells)

The pull request changes only test files that name one of these modules and the measurement record; no code file
changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-02-b.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-02-b-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_02_b.py` (new, only for a check better written over the repository's files)
- `docs/measurements/<date>_release-tests-sprint-02-b.md` (new)

## Kind and level

- Job kind: **refactoring** — tests of merged behaviour, no expected result changed, CI green on every commit. A
  release test that is red on `sprint/02` is a finding that goes **back to Development** (the model's transition
  *Release testing → Development*): it stays in the file marked as expected to fail — `{ todo: true }` under
  `node --test`, `@unittest.expectedFailure` under `unittest` — with the item's identifier; the strand's developer
  takes the item up again on a branch of its own, whose first commit removes the mark (red first, as an
  implementation job) and whose pull request makes it green. The gate for the strand is decided only when no
  release test of the strand carries a mark.
- Level: **1** — browser and hosted CI; nothing installed. The tests' own level line is `Level: release`.

## Tests the SPEC names

- none — the SPEC's named checks are built by the items; these are the use-case tests at level `release` (ARC-016).

## Acceptance criteria

- Every test is written from the text of a use-case flow or a SPEC rule and names it in its `Guards:` line; the
  record lists, per test, the flow or rule and the item it tests. The items' own tests and measurement records
  are not its source; read, if at all, after the release tests are written, to name overlaps in the record.
- The tests run green on `sprint/02` at the commit the record names, after the strand's last item is merged.
- Every test is shown red on a planted fault, the mutation and the red result recorded (`A NEW TEST IS SHOWN TO
  FAIL ON A PLANTED FAULT`).
- A red test is recorded as a finding with the item it sends back to Development, and marked as expected to fail.
- The pull request's first line names `tester-opus`, the model and the commit it started from; the head comment of
  every release test file says the same (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
- Every test file names its module, what it guards and its one level (ARC-020 decision 2).
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB
  RULES`).

## Depends on

- ITM-027, ITM-033, ITM-034, ITM-147 — every item of the strand, merged into `sprint/02`

## Needs a person

No.

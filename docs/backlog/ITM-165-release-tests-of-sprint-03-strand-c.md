---
id: ITM-165
title: Release tests of sprint 03, strand C — the approval engine's records, the product layout, the SPEC list's batch and the verbatim reading (ITM-152, ITM-148, ITM-155, ITM-159)
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-001
  - UC-006
  - UC-008
modules:
  - MOD-review-core
  - MOD-dashboard-app
depends_on:
  - ITM-152
  - ITM-148
  - ITM-155
  - ITM-159
origin: sprint 03 planning
---
# ITM-165 Release tests of sprint 03, strand C — the approval engine's records, the product layout, the SPEC list's batch and the verbatim reading (ITM-152, ITM-148, ITM-155, ITM-159)

**REGISTER**

## Outcome

The items of strand C of sprint 03 (`docs/backlog/sprints/sprint-03.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/03`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/03`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand; the sprint is not closed before every
strand's gate is decided.

What is tested — each rule and flow as the item realised it:

- **ITM-152** — `A RECORD IS EVIDENCE, NOT A PROPOSAL`, UC-008 step 4: an acceptance handed a job, gate, approval or
  test result record writes no approval record for it and names it; a use case in the same batch is written.
- **ITM-148** — `ONE REVIEW LAYOUT FOR EVERY PRODUCT`, `ADDING A PRODUCT CREATES ITS LAYOUT`, UC-001 step 5 and 3c: the
  layout written into a new product holds `docs/architecture/`, on GitHub and on a GitLab server; a product that has
  anything there gets no README; a complete layout gets no commit.
- **ITM-155** — `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`, UC-006 3b and 4d: *Accept ticked* on the SPEC list
  leaves out an entry that changes or withdraws a requirement whose impact list was never shown, and names it; opened
  once, it is written; an entry that adds only is written without being opened.
- **ITM-159** — `THE APPROVED TEXT IS TAKEN VERBATIM`, UC-006: the section is written with the proposal's content byte for
  byte, the blank lines that end the proposal being the separator between sections and not its text (the Product Owner's
  reading of 2026-10-02, `docs/backlog/sprints/sprint-03.md`); a proposal with a trailing line break inside its text keeps it.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-001, UC-006, UC-008 — the use cases of the strand's items, tested at level `release`

## Where it came from

Sprint 03 planning (`docs/backlog/sprints/sprint-03.md`), on the Product Owner's practice since sprint 02: release testing
of a sprint's own items is a selected item of that sprint, one per strand, so that the gate *Release testing → Sprint
review* is decided before the close.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-006, ARC-016, ARC-020.

## Modules

- the modules of the strand's items: MOD-review-core (kernel), MOD-dashboard-app (shells)

The pull request changes only test files that name one of these modules and the measurement record; no code file
changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-03-c.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-03-c-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_03_c.py` (new, only for a check better written over the repository's files)
- `docs/measurements/<date>_release-tests-sprint-03-c.md` (new)

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
  run on a clean tree, and no test runs a suite inside itself (sprint 02 retrospective; ITM-158).
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

- ITM-152, ITM-148, ITM-155, ITM-159 — every item of the strand, merged into `sprint/03`

## Needs a person

No.

---
id: ITM-164
title: Release tests of sprint 03, strand B — the progress bar on the main page and the job definitions (ITM-162, ITM-023)
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-035
modules:
  - MOD-dashboard-app
  - MOD-job-harness
depends_on:
  - ITM-162
  - ITM-023
origin: sprint 03 planning
---
# ITM-164 Release tests of sprint 03, strand B — the progress bar on the main page and the job definitions (ITM-162, ITM-023)

**REGISTER**

## Outcome

The items of strand B of sprint 03 (`docs/backlog/sprints/sprint-03.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/03`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/03`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand; the sprint is not closed before every
strand's gate is decided.

The strand's first item ends on the main page; its release tests run the page in `tests/app-harness.mjs` over a frozen
copy of this repository's backlog and sprint records and a pull-request fake that replays the pull requests of sprints
01 to 03 as recorded once — never the live ones —, and over fixtures written from the use case. What is tested — each
rule and flow as the item realised it:

- **ITM-162** — UC-035 step 2, `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE`, `PROGRESS AND JOB STATE ARE DERIVED, NOT
  STORED`, `EVERY STEP EXPLAINS ITSELF`: the main page shows Agent M's own completion as items per state — done, in
  progress, blocked, not started — with the measure named; a Scrum fixture with a time box shows remaining items of its
  sprint; a planned fixture shows no bar; after clearing every browser store and reloading, the same; nothing written; no
  item file read; on no other route; a product without a declaration gets nothing and asks for nothing.
- **ITM-023** — `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`, `NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY`, `THE
  PAGE STATES WHAT IT SENDS WHERE`, `A FINDING READS LIKE A COMPILER MESSAGE`: a job definition is loaded from its folder,
  its prompt rendered, its output validated against its schema, a context that does not fit is named and not cut
  silently, the disclosure names what is sent where, and every finding of the catalogue formats as the rule says.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-035 — the use case of the strand's first item, tested at level `release`

## Where it came from

Sprint 03 planning (`docs/backlog/sprints/sprint-03.md`), on the Product Owner's practice since sprint 02: release testing
of a sprint's own items is a selected item of that sprint, one per strand, so that the gate *Release testing → Sprint
review* is decided before the close.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-006, ARC-007, ARC-016, ARC-020.

## Modules

- the modules of the strand's items: MOD-dashboard-app (shells), MOD-job-harness (kernel)

The pull request changes only test files that name one of these modules and the measurement record; no code file
changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-03-b.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-03-b-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_03_b.py` (new, only for a check better written over the repository's files)
- `tests/fixtures/sprint-03-running/` (new — the frozen copy the page is served, if the tester reads this repository)
- `docs/measurements/<date>_release-tests-sprint-03-b.md` (new)

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

- ITM-162, ITM-023 — every item of the strand, merged into `sprint/03`

## Needs a person

No.

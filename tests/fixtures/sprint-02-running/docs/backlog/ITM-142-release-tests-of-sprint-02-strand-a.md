---
id: ITM-142
title: Release tests of sprint 02, strand A — the dashboard's hub chain (ITM-126, ITM-129, ITM-130, ITM-133, ITM-136)
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-008
  - UC-024
  - UC-042
modules:
  - MOD-dashboard-app
  - MOD-artifacts
  - MOD-review-core
  - MOD-git-host
  - MOD-settings-store
depends_on:
  - ITM-126
  - ITM-129
  - ITM-130
  - ITM-133
  - ITM-136
origin: sprint 02 planning
---
# ITM-142 Release tests of sprint 02, strand A — the dashboard's hub chain (ITM-126, ITM-129, ITM-130, ITM-133, ITM-136)

**REGISTER**

## Outcome

The items of strand A of sprint 02 (`docs/backlog/sprints/sprint-02.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/02`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/02`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand (`docs/process-models/scrum-wip.md`);
the sprint is not closed before every strand's gate is decided.

What is tested — each rule and flow as the item realised it:

- **ITM-126** — `AN EDITED FILE KEEPS ITS IDENTIFIER`; `A FINDING READS LIKE A COMPILER MESSAGE`: a save under a
  changed identifier is refused, nothing written, the refusal a sentence written by the dashboard from a finding.
- **ITM-129** — UC-024, the shell: a page load of every address requests no view or settings file that is not
  built; every tab and view of today is shown.
- **ITM-130** — UC-024, `EVERY ARTIFACT NAMES ITS ORIGIN`: the kernel reads through ports only; no kernel file
  imports from the git host, no shell file reads past what MOD-git-host provides; the dashboard's reads behave as
  before.
- **ITM-133** — UC-008 4a, `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK`: a commit refused for missing
  write access offers the GitHub path as a link; a used-up rate limit and a GitLab product get no such link.
- **ITM-136** — UC-042 step 1, `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`, `EVERY SETTING IS
  REACHED FROM ONE PAGE`: a setting's line keeps its last test across a reload; *Clear* removes it with the setting;
  the export carries it.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-008, UC-024, UC-042 — the use cases of the strand's items, tested at level `release`

## Where it came from

Sprint 02 planning (`docs/backlog/sprints/sprint-02.md`), on the Product Owner's condition at the merge of sprint 01:
release testing of a sprint's own items is a selected item of that sprint, one per strand, so that the gate
*Release testing → Sprint review* is decided before the close.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-004, ARC-005, ARC-016, ARC-020.

## Modules

- the modules of the strand's items: MOD-dashboard-app (shells), MOD-artifacts and MOD-review-core (kernel),
  MOD-git-host and MOD-settings-store (adapters)

The pull request changes only test files that name one of these modules and the measurement record; no code file
changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-02-a.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-02-a-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_02_a.py` (new, only for a check better written over the repository's files)
- `docs/measurements/<date>_release-tests-sprint-02-a.md` (new)

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

- ITM-126, ITM-129, ITM-130, ITM-133, ITM-136 — every item of the strand, merged into `sprint/02`

## Needs a person

No.

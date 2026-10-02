---
id: ITM-144
title: Release tests of sprint 02, strand C — the artifact kernel's checks, the pull-request reads and the approval engine (ITM-127, ITM-128, ITM-146, ITM-014, ITM-016)
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-006
  - UC-022
  - UC-032
modules:
  - MOD-artifacts
  - MOD-review-core
  - MOD-git-host
depends_on:
  - ITM-127
  - ITM-128
  - ITM-146
  - ITM-014
  - ITM-016
origin: sprint 02 planning
---
# ITM-144 Release tests of sprint 02, strand C — the artifact kernel's checks, the pull-request reads and the approval engine (ITM-127, ITM-128, ITM-146, ITM-014, ITM-016)

**REGISTER**

## Outcome

The items of strand C of sprint 02 (`docs/backlog/sprints/sprint-02.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/02`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/02`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand; the sprint is not closed before every
strand's gate is decided.

What is tested — each rule and flow as the item realised it:

- **ITM-127** — `A REQUIREMENT HAS A REGISTERED SOURCE`; `A REQUIREMENT HAS FIVE FIELDS`: a requirement whose
  source is named as it is written yields no finding; a missing source, a source without a date, a resource entry
  as source and an unlinked `SRC-` identifier are still errors — on a fixture SPEC written from the SPEC's own
  format rules, never on Agent M's `SPEC.md`.
- **ITM-128** — UC-022, `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`: no test of the repository opens Agent M's own
  `SPEC.md`; the reader of requirement names marks a withdrawn one and takes bold prose for no requirement.
- **ITM-146** — UC-032 step 1, `GITLAB PRODUCTS ARE SUPPORTED`, `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`: the
  pull requests of a GitHub and of a GitLab fixture come back in one shape, each token seen only at its own server,
  the list stopping at the date the filter names, no write.
- **ITM-014** — the seven approval-gate rules it characterises (`A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS
  WRITTEN`; `THE APPROVED TEXT IS TAKEN VERBATIM`; `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`; `THE REPLACED
  TEXT STAYS REACHABLE`; `A GENERATED ARTIFACT IS A PROPOSAL`; `A RECORD IS EVIDENCE, NOT A PROPOSAL`; `A REVIEWED
  ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN`), each from the rule's text over a fixture repository.
- **ITM-016** — UC-006, `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`, `A STALE APPROVAL IS NOT
  APPLIED`: `applyApprovals` writes what the workflow writes, byte for byte as `tools/apply_approvals.py`, and
  refuses a stale or malformed record by name.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-006, UC-022, UC-032 — the use cases of the strand's items, tested at level `release`

## Where it came from

Sprint 02 planning (`docs/backlog/sprints/sprint-02.md`), on the Product Owner's condition at the merge of sprint 01:
release testing of a sprint's own items is a selected item of that sprint, one per strand, so that the gate
*Release testing → Sprint review* is decided before the close.

Architecture decisions its modules follow: ARC-003, ARC-004, ARC-006, ARC-016, ARC-020.

## Modules

- the modules of the strand's items: MOD-artifacts, MOD-review-core (kernel), MOD-git-host (adapters)

The pull request changes only test files that name one of these modules and the measurement record; no code file
changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-02-c.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-02-c-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_02_c.py` (new, only for a check better written over the repository's files)
- `docs/measurements/<date>_release-tests-sprint-02-c.md` (new)

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

- ITM-127, ITM-128, ITM-146, ITM-014, ITM-016 — every item of the strand, merged into `sprint/02`

## Needs a person

No.

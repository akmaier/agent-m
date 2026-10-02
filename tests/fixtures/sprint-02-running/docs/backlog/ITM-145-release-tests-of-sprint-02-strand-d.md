---
id: ITM-145
title: Release tests of sprint 02, strand D — the review findings, the repository checks and the link graph (ITM-125, ITM-131, ITM-132, ITM-050, ITM-018, ITM-134)
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
  - MOD-dashboard-app
  - MOD-settings-store
  - MOD-traceability
depends_on:
  - ITM-125
  - ITM-131
  - ITM-132
  - ITM-050
  - ITM-018
  - ITM-134
origin: sprint 02 planning
---
# ITM-145 Release tests of sprint 02, strand D — the review findings, the repository checks and the link graph (ITM-125, ITM-131, ITM-132, ITM-050, ITM-018, ITM-134)

**REGISTER**

## Outcome

The items of strand D of sprint 02 (`docs/backlog/sprints/sprint-02.md`) have release tests: tests of level
`release`, written by `tester-opus` once the last item of the strand is merged into `sprint/02`, from the texts of
the use-case flows and SPEC rules those items realise — not from their code and not from the tests their
implementers wrote —, green on `sprint/02`, with a dated measurement record. Their green run is what the Product
Owner decides the gate *Release testing → Sprint review* on for this strand; the sprint is not closed before every
strand's gate is decided.

What is tested — each rule and flow as the item realised it:

- **ITM-125** — `ONE GITHUB TOKEN SERVES EVERY FEATURE`; `AN EXPORT STATES THAT IT CONTAINS SECRETS`: the export
  notice names every write the one token carries — commits, issues, pull requests, workflow runs.
- **ITM-131** — UC-008 3a, `A REFUSED SAVE KEEPS THE EDIT`: after the file changed on the server, *Save* writes
  nothing, the edit stays, and the newer version is shown beside it — in every editor the review views open and
  on the SPEC changes page.
- **ITM-132** — UC-001 2a and 3a, `EVERY STEP EXPLAINS ITSELF`, `ONE CLICK PER DECISION`: a repository that does not
  exist is named with GitHub's page for a new one; Step A shows as done when the token already reaches the product.
- **ITM-050** — `NO SERVER`; `ARTIFACTS ARE MARKDOWN`; `THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`: the three
  repository checks refuse a planted violation each and pass the repository.
- **ITM-018** — `THE TRACEABILITY MATRIX IS DERIVED`; `A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION`;
  `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN`; `MODULE GAPS ARE REPORTED, NOT FORBIDDEN`; `A REQUIREMENT IS
  NOT CHANGED WITHOUT AN IMPACT LIST`; `AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST`: the graph of
  one commit over this repository and over a fixture — gaps reported, nothing blocked, unknown names kept with
  their withdrawal note, the impact of a requirement and of a decision derived.
- **ITM-134** — UC-006 3b, `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`: an entry that changes or withdraws
  an existing requirement shows the artifacts that reference it before *Accept*; an entry adding a new one shows
  no list.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-001, UC-006, UC-008 — the use cases of the strand's items, tested at level `release`

## Where it came from

Sprint 02 planning (`docs/backlog/sprints/sprint-02.md`), on the Product Owner's condition at the merge of sprint 01:
release testing of a sprint's own items is a selected item of that sprint, one per strand, so that the gate
*Release testing → Sprint review* is decided before the close.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-006, ARC-016, ARC-020.

## Modules

- the modules of the strand's items: MOD-dashboard-app (shells), MOD-settings-store (adapters), MOD-traceability
  (kernel); ITM-050's checks run under no module (ARC-020 decision 5), and so do their release tests

The pull request changes only test files that name one of these modules — or, for ITM-050's rules, none — and the
measurement record; no code file changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-02-d.test.mjs` (new — `Level: release`; split by module as `tests/release-sprint-02-d-<module>.test.mjs` where the tester prefers)
- `tests/test_release_sprint_02_d.py` (new, only for a check better written over the repository's files)
- `docs/measurements/<date>_release-tests-sprint-02-d.md` (new)

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

- ITM-125, ITM-131, ITM-132, ITM-050, ITM-018, ITM-134 — every item of the strand, merged into `sprint/02`

## Needs a person

No.

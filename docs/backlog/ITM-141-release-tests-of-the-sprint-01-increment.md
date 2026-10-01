---
id: ITM-141
title: Release tests of the sprint 01 increment — written from the use cases and the SPEC, by the release tester, run on main
kind: refactoring
level: 1
realises:
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - EVERY TEST HAS ONE LEVEL
  - UC-001
  - UC-006
  - UC-008
  - UC-014
  - UC-042
modules:
  - MOD-dashboard-app
  - MOD-git-host
depends_on: []
origin: sprint 01 merge decision
---
# ITM-141 Release tests of the sprint 01 increment — written from the use cases and the SPEC, by the release tester, run on main

**REGISTER**

## Outcome

The increment of sprint 01 (`main` at `385f5cf`, pull request #39) has release tests: tests of level `release`,
written by `tester-opus` — the Release tester of `docs/process.md`, who implemented nothing of the increment —
from the texts of the use cases and the SPEC rules the sprint 01 items realise, **not from the code and not from
the tests the implementers wrote**. They run green on `main`, their result is a dated measurement record, and
the limitation the Product Owner accepted at the merge of sprint 01 (`docs/backlog/sprints/sprint-01.md`, *Branch
and close*: "the gate *Release testing → Sprint review* has no decision") is closed by it: green, the Product
Owner adds a dated addendum to `sprint-01.md` that lifts the limitation; a red test is a finding that becomes a
backlog item.

What is tested — each main and alternative flow the increment carries out, and each rule as the item realised it:

- **UC-001** Add a managed product (ITM-123 characterised it; ITM-132 lists the flows 2a and 3a that are not
  carried out — no release test for those).
- **UC-006** Approve a specification change (3b is not carried out — ITM-134).
- **UC-008** Review and accept a use case (4a is not carried out — ITM-133; 3a holds only in part — ITM-131).
- **UC-014** Get your own Agent M — the built part, *Finish setting up* (steps 1–5 are ITM-073).
- **UC-042** Manage settings in one place — browser settings, export and import, pseudonymisation, collaborators
  (step 1 after a reload is ITM-136; 5a is ITM-137).
- The rules of **ITM-005**: `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`; `AN EXPIRED TOKEN IS NAMED
  AND ITS RENEWAL LINKED`.
- The rules of **ITM-006**: `ONE GITHUB TOKEN SERVES EVERY FEATURE`; `THE TOKEN LINK IS PREFILLED`; `THE
  REPOSITORY CHOICE IS SPELLED OUT`; `A TOKEN IS SCOPED TO WHAT IT WRITES`.
- The rules of **ITM-007**: `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`; `SWITCHING PSEUDONYMISATION
  OFF STATES WHAT FOLLOWS`; `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS` — as the setting's
  explanation realises it; the write gate itself is ITM-068 and ITM-069.
- The rules of **ITM-008**: `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`; `A SAVE IS REFUSED WHEN THE TEXT
  CHANGED MEANWHILE`; `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`; `A LOCAL AGENT USES THE
  PERSON'S OWN LOGIN` — the last two at the boundary of MOD-git-host (`commitFiles` refuses without an authority
  and takes each of the three kinds), because no CI job and no bridge exists yet to carry them end to end; the
  record says so.

A flow that a backlog item names as *not carried out* gets no release test here; the item that builds it brings
its own, and the release tests of that sprint cover it.

## Realises

- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `EVERY TEST HAS ONE LEVEL`
- UC-001, UC-006, UC-008, UC-014, UC-042 — the use cases the increment realises, tested at level `release`

## Where it came from

The Product Owner's merge decision of sprint 01 (`docs/backlog/sprints/sprint-01.md`, *Branch and close*, *Merged
into `main`, 2026-10-01*; the gate record in pull request #39): release testing was not carried out, the gate
*Release testing → Sprint review* has no decision, and the limitation "is closed by the release tests of this
increment as the first item of sprint 02". The model places *Release testing* between *Development* and *Sprint
review* (`docs/process-models/scrum-wip.md`, kind 4 of ARC-016 names the level).

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-004, ARC-005, ARC-016, ARC-020.

## Modules

- MOD-dashboard-app (shells) — the flows run through the real dashboard in `tests/app-harness.mjs`
- MOD-git-host (adapters) — the token, rate-limit and authority rules at the adapter's boundary

The pull request changes only test files that name one of these modules and the measurement record; no code
file changes (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/release-sprint-01.test.mjs` (new — the dashboard flows and the adapter rules; `Level: release`; where the
  tester splits by module, one file per module, `tests/release-sprint-01-<module>.test.mjs`)
- `tests/test_release_sprint_01.py` (new, only if a check is better written over the repository's files; not to be
  confused with `tests/test_release_run.py`, which the SPEC names for `A RELEASE RUNS EVERY TEST AT EVERY LEVEL`
  and ITM-058 builds)
- `docs/measurements/<date>_release-tests-sprint-01.md` (new)

## Kind and level

- Job kind: **refactoring** — it adds tests of behaviour that exists and changes no expected result; CI is green on
  every commit (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
  A release test that is red on `main` is a finding, not a change of an expectation: it stays in the file marked
  as expected to fail — `{ todo: true }` under `node --test`, `@unittest.expectedFailure` under `unittest` — with
  the identifier of the backlog item that will make it pass, so that the suite stays green and the test becomes
  an ordinary one when that item is done.
- Level: **1** — browser and hosted CI; nothing installed. The tests' own level line is `Level: release` (ARC-016
  kind 4 names the level; these tests need no model, so they run deterministically with the fakes the harness
  brings). Until a product test schedule and the CI generated from it exist (ITM-059, ITM-060), every level runs in
  the one workflow `.github/workflows/tests.yml`; the schedule later selects them by their `Level:` line.

## Tests the SPEC names

- none — the SPEC names checks per rule, and those checks exist or are built by the items that realise the rules.
  The release tests are the tests of the use cases at level `release` (ARC-016); `RELEASE TESTS ARE NOT WRITTEN BY
  THE IMPLEMENTER` is checked by `tests/test_test_battery.py` (ITM-057), which reads the recorded author — this
  item records it where that check will read it (below).

## Acceptance criteria

- Every test is written from the text of a use-case flow or a SPEC rule and names it in its `Guards:` line; the
  measurement record lists, per test, the flow or rule it was written from, in the order of the use case. The
  existing tests of the increment (`tests/dashboard-review-flows.test.mjs` and the `tests/review-core.d/` files)
  and their measurement records are not the source of a release test; if the tester reads them at all, then only
  after the release tests are written, to name overlaps in the record.
- The tests run green on `main` at the commit the record names (`385f5cf` or a later `main` that holds nothing but
  records), and the record states the commit, the environment and the command of each suite.
- Every test is shown red on a planted fault in the code it guards, the mutation and the red result recorded
  (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- A red test on `main` is recorded as a finding — the flow or rule, what the dashboard does instead — and is
  marked as expected to fail with the identifier of the backlog item the Product Owner adds for it; the record
  lists these.
- The pull request's first line names `tester-opus`, the model and the commit it started from, and the head
  comment of every release test file says the same, so that the gate's condition — written by a participant other
  than the implementer — can be read from the file and the pull request (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`; `docs/process.md`, *Roles*).
- Every test file names its module, what it guards and its one level, `release` (ARC-020 decision 2; `EVERY TEST
  HAS ONE LEVEL`).
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB
  RULES`).
- After the merge, the Product Owner — not this job — adds the dated addendum to `docs/backlog/sprints/sprint-01.md`
  that lifts the limitation (green) or names the findings and their items (red); the sprint record is the Product
  Owner's own input (UC-041 step 6).

## Depends on

- nothing — the increment is on `main`.

## Needs a person

No.

## Notes

- The release tester tests what the increment does, against what the use cases and the SPEC say; a difference is
  a finding for the backlog, never a change to a use case or the SPEC (`docs/process.md`, *Boundary*).
- Where a use case names a flow the dashboard does not carry out and no backlog item names it yet, that is a
  finding too, and becomes an item.

---
id: ITM-128
title: No test reads Agent M's own SPEC.md — the specRequirements check runs on its fixture
kind: refactoring
level: 1
realises:
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - UC-022
modules:
  - MOD-artifacts
depends_on: []
origin: sprint 01 review
---
# ITM-128 No test reads Agent M's own SPEC.md — the specRequirements check runs on its fixture

**REGISTER**

## Outcome

`tests/architecture-format.test.mjs` no longer opens Agent M's own `SPEC.md` (today
`readFileSync(new URL("../SPEC.md", import.meta.url))`, in the test "specRequirements — the names in SPEC.md; a withdrawn
one is marked; prose in bold is no requirement"). What that part asserts about the real SPEC is asserted on the fixture
SPEC under `tests/fixtures/architecture/`, which the same test already reads; where the fixture lacks a case the real SPEC
supplied — a withdrawn requirement, prose in bold —, the fixture gains it. No expected result changes: the same reader is
held to the same expectations, on fixture text.

## Realises

- `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS` — the check guards the reader of requirement names that the prerequisite check uses
- UC-022 — Derive the architecture

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 5). The read predates the sprint
(`tests/architecture.test.mjs` on `main`); ITM-004 moved it unchanged into `tests/architecture-format.test.mjs`. A test that
reads the product's own SPEC makes the SPEC a test input, so the SPEC can no longer be rewritten without breaking tests —
`KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE` (`SOFTWARE_MAINTENANCE.md`, *Prozess und Produkt*).

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/architecture-format.test.mjs` (the read of `../SPEC.md` leaves)
- `tests/fixtures/architecture/SPEC.md` (the cases the real SPEC supplied, if missing)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`

## Acceptance criteria

- No file under `tests/` opens the repository's own `SPEC.md` as a source of expected values; reading a fixture's `SPEC.md`
  stays allowed. **A whole-repository scan** — a test that opens every committed file, or every artifact, of the
  repository to check each against a rule (today `tests/test_artifact_format.py`, `ARTIFACTS ARE MARKDOWN`, and
  `tests/test_products_folder.py`, `NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY`) — **opens `SPEC.md` as one file among
  all and does not fall under this criterion**, nor under `KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE`: the rule's occasion is a test
  that compares strings with a Markdown file so that the SPEC can no longer be rewritten without breaking it; a scan asserts
  nothing about the SPEC's content and breaks on no rewording (reading of the Scrum Master, 2026-10-01, adopted by the
  Product Owner at the sprint 02 gate decisions, 2026-10-02; *From the sprint 02 release tests*, below).
- The assertions of the test keep their expected values; only their input changes from the real SPEC to fixture text.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- A fault planted in `specRequirements` that the real-SPEC block caught (a withdrawn requirement read as live) is still caught, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.

## From the sprint 02 release tests (2026-10-02)

Finding **S1** of ITM-144 (`docs/measurements/2026-10-01_release-tests-sprint-02-c.md`, case 26, `@unittest.expectedFailure`
in `tests/test_release_sprint_02_c.py`): the watcher sees two Python tests open `SPEC.md` — `tests/test_artifact_format.py:94`
(every artifact of the repository is Markdown; ITM-050) and `tests/test_products_folder.py:76` (every committed file names no
product). Both are whole-repository scans; the tester left their reach as an open question. The Product Owner decided at
the gate of strand C (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*): the criterion above is corrected,
**not the code** — the two scans stay as they are. The S1 case follows the corrected criterion: its expectation becomes
"every open of `SPEC.md` the watcher sees comes from a whole-repository scan" (the watcher records the test file and line
of each open), and its mark goes. That is a change to a release test's expectation, so it is made by its author,
`tester-opus`, on a branch of ITM-144 — one commit, green, no code — not by this item's developer
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). The item itself is not re-opened. ITM-158 moves the watcher into CI's
one run.

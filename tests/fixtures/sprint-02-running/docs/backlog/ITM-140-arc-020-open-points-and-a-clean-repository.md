---
id: ITM-140
title: The five points ARC-020 leaves open are decided, and Agent M's own tests pass the test format check
kind: implementation
level: 1
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - THE NAME IS THE ID AND IT SURVIVES
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - EVERY TEST HAS ONE LEVEL
modules:
  - MOD-artifacts
depends_on:
  - ITM-128
  - ITM-138
  - ITM-139
origin: sprint 01 review
---
# ITM-140 The five points ARC-020 leaves open are decided, and Agent M's own tests pass the test format check

**REGISTER**

## Outcome

ITM-011 built the identity and header checks on the strict reading wherever ARC-020 and the SPEC leave the form open, and
raised the open points as a change request (pull request #32). Run over this repository, `formatChecks("test")` reports
72 errors, all from these points (`docs/measurements/2026-10-01_format-checks.md`, section 3). Once `akmaier` has decided
the five points below, the checks of MOD-artifacts follow the decision, the test files of this repository carry what it
asks, and a test keeps the repository at zero findings of `formatChecks("test")`.

## Realises

- `EVERY ARTIFACT HAS AN IDENTIFIER`
- `THE NAME IS THE ID AND IT SURVIVES`
- `EVERY ARTIFACT NAMES ITS ORIGIN`
- `EVERY TEST HAS ONE LEVEL`

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 4): points 1–5 of the change request in pull
request #32 (point 6 is ITM-139).

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`). The decision may ask for header lines in test files of other modules; the Product Owner then adds those modules to this list before the job starts, so that the pull request still changes only its modules. Their tests' code and expectations are not touched.

Files it creates or changes:

- `docs/assets/artifacts/headers.mjs`, `docs/assets/artifacts/identity.mjs` (the decided forms)
- the header lines of the test files of `tests/` (identifiers, `Module:` lines, helper marks — as decided)
- `tests/artifacts-checks.test.mjs` (every test file of this repository yields no finding of `formatChecks("test")`)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_identifiers.py` — `EVERY ARTIFACT HAS AN IDENTIFIER`
- `tests/test_identifier_stability.py` — `THE NAME IS THE ID AND IT SURVIVES`
- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`
- `tests/test_test_levels.py` — `EVERY TEST HAS ONE LEVEL`

## Acceptance criteria

- The decisions of `akmaier` are recorded where they bind (ARC-020, or the SPEC) before the first commit of the job.
- After the job, `formatChecks("test")` over every test file of this repository yields no finding; counter-proof: a test file without its `Level:` line yields one.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-128 — changes `tests/architecture-format.test.mjs` first
- ITM-138 — the last of the sprint 01 review items that change test files of these modules
- ITM-139 — changes `docs/assets/artifacts/headers.mjs` first

## Needs a person

Yes — **a decision of `akmaier`** on five points ARC-020 and the SPEC leave open; the item cannot start before it:

1. **`TST-` in a Python test case.** ARC-020 decision 2 puts `TST-<nnn>` "in the case's name"; a Python `unittest`
   method name cannot contain a hyphen. Where does a Python case carry its identifier — and how is a `TST-` string that is
   fixture data inside a test (`TST-12`, `TST-4` …) told from an identifier?
2. **Withdrawal notes for the other kinds.** The SPEC gives the form for requirements, ARC-020 decision 4 for decisions and
   modules; for use cases, tests, backlog items, job records, sources and resources none is defined. UC-029 5a lets a
   removed test stay only in the history, while the check of `THE NAME IS THE ID AND IT SURVIVES` asks every identifier
   absent now for a withdrawal note.
3. **`RES-` identifiers.** How a resource entry of `docs/resources.md` carries its `RES-` identifier.
4. **Tests of rules under no module.** ARC-020 decision 5 puts rules whose check runs no single module under no module;
   what does such a test's `Module:` line name (`tests/test_licence.py`, `tests/test_pages_layout.py`,
   `tests/test_products_folder.py`)?
5. **Helper files in a test folder.** How a helper (`tests/app-harness.mjs`, `tests/jsrun.py`, `tests/artifact_checks.py`,
   `tests/review-core.d/helpers.mjs`) is told from a test, so that it owes no `Guards:`, `Level:` or `TST-`.

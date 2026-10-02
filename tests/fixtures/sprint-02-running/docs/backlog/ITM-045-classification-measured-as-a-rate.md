---
id: ITM-045
title: The model's classification measured as a rate — fixed examples, phrasings, runs fixed in advance
kind: implementation
level: 1
realises:
  - THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED
modules:
  - MOD-derivation
depends_on:
  - ITM-043
origin: backlog refinement 2026-10-01
---
# ITM-045 The model's classification measured as a rate — fixed examples, phrasings, runs fixed in advance

**REGISTER**

## Outcome

A fixed set of candidate examples with several phrasings, a run count fixed before the first run, and a report of the rate against the last release — reported, never gated (ARC-016 kind 4). In commit tests it runs with a scripted driver; the real measurement runs nightly and on release candidates.

## Realises

- `THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-derivation (Testing); ARC-016 kind 4.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007.

## Modules

- MOD-derivation (features) — uses MOD-artifacts, MOD-job-harness, MOD-review-core, MOD-source-library, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/test_derivation_classes.py`
- `tests/rates/derivation-classes/` (new: fixed example set, phrasings, runner)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_derivation_classes.py` — `THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED`

## Acceptance criteria

From the SPEC's checks:

- `THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED` — `tests/test_derivation_classes.py` — the rate is reported, not gated.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-043 — extends tests/test_derivation_classes.py after it

## Needs a person

The real nightly run needs a model endpoint key stored as a CI secret of Agent M by the PO (ITM-116).

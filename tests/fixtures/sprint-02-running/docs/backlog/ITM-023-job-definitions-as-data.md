---
id: ITM-023
title: Job definitions as data — loader, prompt, output schema, context fit, disclosure, the finding catalogue
kind: implementation
level: 1
realises:
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
  - THE PAGE STATES WHAT IT SENDS WHERE
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-job-harness
depends_on:
  - ITM-013
origin: backlog refinement 2026-10-01
---
# ITM-023 Job definitions as data — loader, prompt, output schema, context fit, disclosure, the finding catalogue

**REGISTER**

## Outcome

`loadDefinition`, `renderPrompt`, `validateOutput`, `contextFits`, `disclosure`, `formatFinding` and `splitFindings` of MOD-job-harness, over `docs/assets/jobs/<kind>/job.json` and `prompt.md` (ARC-007 decision 1). The finding catalogue `docs/assets/jobs/findings.json` is seeded with every finding the accepted SPEC and use cases name for a correction loop — the format rules, an unknown realised name, a changed identifier, an exact duplicate classed otherwise, a candidate without its fields, a test without expected result, a model-dependent test on one run, a commit-level test calling a paid service, a mention of a person —, so that later items add job folders, not codes.

## Realises

- `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`
- `NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY`
- `THE PAGE STATES WHAT IT SENDS WHERE`
- `A FINDING READS LIKE A COMPILER MESSAGE`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-job-harness; ARC-007 decisions 1, 2, 5.

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-009.

## Modules

- MOD-job-harness (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/job-harness.mjs` (new)
- `docs/assets/jobs/findings.json` (new)
- `tests/job-harness.test.mjs` (new)
- `tests/test_derivation_context.py`
- `tests/test_prompted_change_context.py`
- `tests/fixtures/jobs/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_correction_loop.py` — `A FINDING READS LIKE A COMPILER MESSAGE` (checked by ITM-024, which builds the loop; here `formatFinding` is checked in `tests/job-harness.test.mjs`)
- `tests/test_derivation_context.py` — `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`
- `tests/test_destination_disclosure.py` — `THE PAGE STATES WHAT IT SENDS WHERE`
- `tests/test_prompted_change_context.py` — `NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY`

## Acceptance criteria

From the SPEC's checks:

- `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY` — `tests/test_derivation_context.py`
- `NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY` — `tests/test_prompted_change_context.py`
- `THE PAGE STATES WHAT IT SENDS WHERE` — `tests/test_destination_disclosure.py`
- `A FINDING READS LIKE A COMPILER MESSAGE` — in `tests/job-harness.test.mjs`: every finding of the catalogue formats as `<artifact>:<line>: <error|warning>: <what> [<RULE>] — <fix>`; the fixture run of the loop is `tests/test_correction_loop.py`, checked by ITM-024.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-013 — the finding codes of the format checks are seeded into the catalogue

## Needs a person

No.

## From the sprint 02 planning

P6 of the sprint 01 retrospective: an item names only checks it can build inside its modules and files.
`tests/test_correction_loop.py` runs the correction loop, which ITM-024 builds; this item's part of `A FINDING READS
LIKE A COMPILER MESSAGE` — the template — is checked in its own test file.

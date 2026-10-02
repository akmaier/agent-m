---
id: ITM-013
title: Every format check of one artifact kind in one call, as findings for the correction loop
kind: implementation
level: 1
realises:
  - UC-007
  - UC-019
  - UC-022
modules:
  - MOD-artifacts
depends_on:
  - ITM-009
  - ITM-010
  - ITM-011
  - ITM-012
origin: backlog refinement 2026-10-01
---
# ITM-013 Every format check of one artifact kind in one call, as findings for the correction loop

**REGISTER**

## Outcome

`MOD-artifacts.formatChecks(kind, text, context)` runs every format check of one kind — requirement, use case, decision, module, test, group file — and returns findings naming the artifact, the line, the rule by name and the expected correction, the named checks a job definition lists (ARC-007 decision 3).

## Realises

- UC-007 — Derive use cases from requirements
- UC-019 — Change a specification or a use case by prompt
- UC-022 — Derive the system architecture from requirements and use cases

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-artifacts `formatChecks`; ARC-007 decision 3.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts/checks.mjs` (new)
- `tests/artifacts-checks.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-007 (Derive use cases from requirements), for the part this item builds:

> - Each proposed use case is one Markdown file naming the requirements it realises.
> - None of them counts as accepted until UC-008.

From the postcondition of UC-019 (Change a specification or a use case by prompt), for the part this item builds:

> - Only what the author saved — or, through a CI agent, what its workflow committed for review (6b) —
>   was written: a use case as open, or a queue entry beside the current SPEC section; the SPEC itself is
>   unchanged.
> - No requirement was duplicated: a restated rule became a duplicate, a changed rule kept its name.
> - The record of the change names the instruction and the participant that drafted it.

From the postcondition of UC-022 (Derive the system architecture from requirements and use cases), for the part this item builds:

> - The product repository holds one open file per proposed decision and per proposed module under
>   `docs/architecture/`; nothing counts as accepted before a person accepts it.
> - No proposal duplicates an existing decision or module: changes stand under their existing
>   identifiers.
> - Every reuse decision carries a due diligence whose facts name where and when they were read.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-009 — requirement checks
- ITM-010 — use-case checks
- ITM-011 — header and identifier checks
- ITM-012 — group-file checks

## Needs a person

No.

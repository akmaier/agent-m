---
id: ITM-009
title: The requirement format and its checks — five fields, one statement, a named check, what it constrains, a registered source
kind: implementation
level: 1
realises:
  - A REQUIREMENT HAS FIVE FIELDS
  - ONE STATEMENT PER REQUIREMENT
  - A REQUIREMENT NAMES ITS CHECK
  - A REQUIREMENT NAMES WHAT IT CONSTRAINS
  - A REQUIREMENT HAS A REGISTERED SOURCE
  - A RESOURCE'S TERMS ENTER AS A SOURCE
modules:
  - MOD-artifacts
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-009 The requirement format and its checks — five fields, one statement, a named check, what it constrains, a registered source

**REGISTER**

## Outcome

`MOD-artifacts.parseRequirements(specText)` reads every requirement of a SPEC or of a queue entry by its name with its five fields, what it constrains (product or process) and whether it is withdrawn; `requirementProblems(requirement, linkedSources)` returns findings: a missing field or check, a source the product does not link (a resource entry named as source among them) as errors, a conjunction in the rule as a warning. `specRequirements` reads through it, so the dashboard's prerequisite check uses the same reader.

## Realises

- `A REQUIREMENT HAS FIVE FIELDS`
- `ONE STATEMENT PER REQUIREMENT`
- `A REQUIREMENT NAMES ITS CHECK`
- `A REQUIREMENT NAMES WHAT IT CONSTRAINS`
- `A REQUIREMENT HAS A REGISTERED SOURCE`
- `A RESOURCE'S TERMS ENTER AS A SOURCE`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-artifacts `parseRequirements`, `requirementProblems`; ARC-006.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts/requirements.mjs` (new)
- `docs/assets/artifacts.mjs` (specRequirements delegates)
- `tests/test_requirement_fields.py`
- `tests/test_single_statement.py`
- `tests/test_requirement_names_check.py`
- `tests/test_requirement_has_source.py`
- `tests/fixtures/requirements/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_requirement_fields.py` — `A REQUIREMENT HAS FIVE FIELDS`; `A REQUIREMENT NAMES WHAT IT CONSTRAINS`
- `tests/test_requirement_has_source.py` — `A REQUIREMENT HAS A REGISTERED SOURCE`; `A RESOURCE'S TERMS ENTER AS A SOURCE`
- `tests/test_requirement_names_check.py` — `A REQUIREMENT NAMES ITS CHECK`
- `tests/test_single_statement.py` — `ONE STATEMENT PER REQUIREMENT`

## Acceptance criteria

From the SPEC's checks:

- `A REQUIREMENT HAS FIVE FIELDS` — `tests/test_requirement_fields.py`
- `ONE STATEMENT PER REQUIREMENT` — `tests/test_single_statement.py` — flags conjunctions in the rule field for review; the decision stays human.
- `A REQUIREMENT NAMES ITS CHECK` — `tests/test_requirement_names_check.py`
- `A REQUIREMENT NAMES WHAT IT CONSTRAINS` — `tests/test_requirement_fields.py`
- `A REQUIREMENT HAS A REGISTERED SOURCE` — `tests/test_requirement_has_source.py`
- `A RESOURCE'S TERMS ENTER AS A SOURCE` — `tests/test_requirement_has_source.py` — a requirement naming a resource entry as its source is rejected; counter-proof: the same requirement naming the registered licence source passes.

Further:

- Checks run on fixture specifications, never on Agent M's own SPEC.md (`KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE`, SOFTWARE_MAINTENANCE.md).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.

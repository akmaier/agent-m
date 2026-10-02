---
id: ITM-019
title: What traces to a requirement, at any released version, with the open proposals touching it
kind: implementation
level: 1
realises:
  - THE BROWSER SHOWS ANY RELEASED VERSION
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
modules:
  - MOD-traceability
depends_on:
  - ITM-018
origin: backlog refinement 2026-10-01
---
# ITM-019 What traces to a requirement, at any released version, with the open proposals touching it

**REGISTER**

## Outcome

The data of the specification browser (UC-020): the requirement tree of one version — the default branch or a release tag — with each requirement's status (*in SPEC*, *change proposed*, *withdrawal proposed*, *proposed*, *withdrawn*), what traces to it, and the open queue entries touching it; two versions compared.

## Realises

- `THE BROWSER SHOWS ANY RELEASED VERSION`
- `A REQUIREMENT SHOWS WHAT TRACES TO IT`
- `OPEN PROPOSALS ARE SHOWN IN THE BROWSER`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-traceability `tracesTo`; ARC-006 (versions are commits).

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/traceability/browser.mjs` (new)
- `tests/test_spec_browser.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_spec_browser.py` — `THE BROWSER SHOWS ANY RELEASED VERSION`; `A REQUIREMENT SHOWS WHAT TRACES TO IT`; `OPEN PROPOSALS ARE SHOWN IN THE BROWSER`

## Acceptance criteria

From the SPEC's checks:

- `THE BROWSER SHOWS ANY RELEASED VERSION` — `tests/test_spec_browser.py`
- `A REQUIREMENT SHOWS WHAT TRACES TO IT` — `tests/test_spec_browser.py`
- `OPEN PROPOSALS ARE SHOWN IN THE BROWSER` — `tests/test_spec_browser.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-018 — the link graph

## Needs a person

No.

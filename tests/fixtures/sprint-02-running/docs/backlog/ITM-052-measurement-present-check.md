---
id: ITM-052
title: A released runtime has a dated measurement file
kind: implementation
level: 1
realises:
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
modules: []
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-052 A released runtime has a dated measurement file

**REGISTER**

## Outcome

The check the SPEC names: for every runtime a release of Agent M offers (browser to model endpoint, browser to bridge on loopback, browser to bridge over the jump host's HTTPS address, mail through Microsoft Graph), a dated file in `docs/measurements/` records the browser behaviour it depends on; a runtime without one fails the check. How a release names its runtimes is decided in this item.

## Realises

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-009, ARC-012, ARC-013, ARC-014 (open measurements); SPEC §6.

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `tests/test_measurement_present.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_measurement_present.py` — `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`

## Acceptance criteria

From the SPEC's checks:

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` — `tests/test_measurement_present.py` — a released runtime has a dated measurement file.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.

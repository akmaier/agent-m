---
id: ITM-024
title: The correction loop — runDraft against any driver, rounds counted, a fixed limit
kind: implementation
level: 1
realises:
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
  - WHAT A PERSON DECIDES IS NOT SENT BACK
  - THE CORRECTION LOOP HAS A FIXED LIMIT
  - THE ROUNDS ARE COUNTED AND SHOWN
  - A FINDING READS LIKE A COMPILER MESSAGE
  - UC-019
modules:
  - MOD-job-harness
depends_on:
  - ITM-023
origin: backlog refinement 2026-10-01
---
# ITM-024 The correction loop — runDraft against any driver, rounds counted, a fixed limit

**REGISTER**

## Outcome

`runDraft({ definition, inputs, driver, limit, checks })` of ARC-007 decision 7, tested with a fixture driver that returns scripted answers.

## Realises

- `A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT`
- `AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED`
- `WHAT A PERSON DECIDES IS NOT SENT BACK`
- `THE CORRECTION LOOP HAS A FIXED LIMIT`
- `THE ROUNDS ARE COUNTED AND SHOWN`
- `A FINDING READS LIKE A COMPILER MESSAGE`
- UC-019 — Change a specification or a use case by prompt

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-job-harness `runDraft`; ARC-007 decisions 7, 8.

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-009.

## Modules

- MOD-job-harness (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/job-harness/loop.mjs` (new)
- `tests/test_correction_loop.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_correction_loop.py` — `A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT`; `AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED`; `WHAT A PERSON DECIDES IS NOT SENT BACK`; `THE CORRECTION LOOP HAS A FIXED LIMIT`; `THE ROUNDS ARE COUNTED AND SHOWN`; `A FINDING READS LIKE A COMPILER MESSAGE`

## Acceptance criteria

From the SPEC's checks:

- `A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT` — `tests/test_correction_loop.py` — a fixture participant that first returns an unknown name under `realises` and then a corrected draft is asked once more and the person sees only the corrected draft; counter-proof: with the loop switched off, the person sees the error.
- `AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED` — `tests/test_correction_loop.py` — a justified warning ends the loop; an unfixed error does not.
- `WHAT A PERSON DECIDES IS NOT SENT BACK` — `tests/test_correction_loop.py` — a conflict finding appears in no message to the participant.
- `THE CORRECTION LOOP HAS A FIXED LIMIT` — `tests/test_correction_loop.py` — a participant that never fixes its error is asked exactly *limit* times, or once more than a round without change, and the person sees the remaining finding.
- `THE ROUNDS ARE COUNTED AND SHOWN` — `tests/test_correction_loop.py`
- `A FINDING READS LIKE A COMPILER MESSAGE` — `tests/test_correction_loop.py` — every finding of the fixture run matches the template.

From the postcondition of UC-019 (Change a specification or a use case by prompt), for the part this item builds:

> - Only what the author saved — or, through a CI agent, what its workflow committed for review (6b) —
>   was written: a use case as open, or a queue entry beside the current SPEC section; the SPEC itself is
>   unchanged.
> - No requirement was duplicated: a restated rule became a duplicate, a changed rule kept its name.
> - The record of the change names the instruction and the participant that drafted it.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-023 — definitions and findings

## Needs a person

No.

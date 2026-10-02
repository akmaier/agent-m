---
id: ITM-159
title: An approved proposal is written with its trailing blank lines — V1 settled
kind: implementation
level: 1
realises:
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - UC-006
modules:
  - MOD-review-core
depends_on:
  - ITM-017
origin: sprint 02 review (finding V1 of ITM-014, open since 2026-10-01)
---
# ITM-159 An approved proposal is written with its trailing blank lines — V1 settled

**REGISTER**

## Outcome

Both writers drop the blank lines that end an approved proposal (`replaceSection`: `proposal.replace(/\n+$/, "")`; the Python applier: `rstrip("\n")`), so the written section is not the approved text byte for byte. Soll: the section is written exactly as approved, its trailing blank lines included; the expected-to-fail mark of V1 in `tests/test_verbatim.py` comes off. The Product Owner may instead withdraw this item at planning with the reading that a section's trailing blank lines are separators and not part of the approved text — then the mark becomes a plain pass of that reading.

## Realises

- `THE APPROVED TEXT IS TAKEN VERBATIM`
- UC-006

## Where it came from

ITM-014 recorded V1 as the Product Owner's question; it had no item until the sprint 02 review. It waits for ITM-017, which retires the Python applier, so only the engine has to change.

## Modules

- MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs`
- `docs/assets/review-core/apply-approvals.mjs`
- `tests/test_verbatim.py`

## Kind and level

- Job kind: **implementation** — the first commit holds only tests, and CI on it is red (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

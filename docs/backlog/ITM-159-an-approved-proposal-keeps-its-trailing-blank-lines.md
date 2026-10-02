---
id: ITM-159
title: The blank lines that end an approved proposal are the separator, not its text — V1 settled as a reading, the mark comes off
kind: refactoring
level: 1
realises:
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - UC-006
modules:
  - MOD-review-core
depends_on: []
origin: sprint 02 review (finding V1 of ITM-014, open since 2026-10-01); re-cut at the sprint 03 planning
---
# ITM-159 The blank lines that end an approved proposal are the separator, not its text — V1 settled as a reading, the mark comes off

**REGISTER**

## Outcome

Both writers drop the blank lines that end an approved proposal (`replaceSection`: `proposal.replace(/\n+$/, "")`; the
Python applier: `rstrip("\n")`) and write the section with one line break at its end. ITM-014 marked this as finding V1,
expected to fail, "the Product Owner's call" (`tests/test_verbatim.py`,
`test_blank_lines_at_the_end_of_a_proposal_are_written`). **The Product Owner's reading, sprint 03 planning, 2026-10-02:**
the approved text is the proposal's content; the blank lines that end a proposal file are the separator between SPEC
sections — as the heading's position is the SPEC's own layout —, and `THE APPROVED TEXT IS TAKEN VERBATIM` ("what stands in
the approval field is exactly what is written to the specification; nothing reformulates it afterwards") is kept when the
content is written byte for byte and the section keeps its one separator. The other reading would write a second blank
line between two sections for a proposal that ends with one, so that the SPEC's bytes and the current text the next
proposal is shown against (`extractSection`, which normalises the section's end) would differ while no word changed —
against `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`. Soll: the case asserts the reading — a proposal ending in two
blank lines is written with its content and one line break, and a line break *inside* the content (two trailing spaces,
a line that ends the text before a blank line) is kept —, and the expected-to-fail mark comes off. No writer changes.

## Realises

- `THE APPROVED TEXT IS TAKEN VERBATIM` — the content byte for byte; the separator is the SPEC's
- UC-006 — Approve a specification change (step 4: the section replaced by the proposal)

## Where it came from

ITM-014 recorded V1 as the Product Owner's question; it had no item until the sprint 02 review, which filed it as the change
to both writers, waiting for ITM-017. At the sprint 03 planning the Product Owner took the reading the item offered instead
("the mark becomes a plain pass of that reading"), so that nothing waits for ITM-017; `akmaier` may overrule the reading, as
with S1 (ITM-128) — then the item is re-cut back to the writers.

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts

The pull request changes only test files that name this module (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`); no code
file changes.

Files it creates or changes:

- `tests/test_verbatim.py` (the V1 case: its expectation follows the reading, its mark comes off; the counter-proof that a line
  break inside the content is kept stays as it is)

## Kind and level

- Job kind: **refactoring** — the code is byte-identical and CI is green on every commit. The one expectation that changes
  is the Product Owner's reading recorded here, as case 26 (S1) of ITM-144 was changed in sprint 02 by one green commit of
  its author (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*); it is no behaviour change.
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_verbatim.py` — `THE APPROVED TEXT IS TAKEN VERBATIM`

## Acceptance criteria

- `tests/test_verbatim.py` has no `expectedFailure`; the V1 case is green on both writers and states the reading in its
  docstring with the sprint 03 planning as its source; `tools/apply_approvals.py` and `docs/assets/review-core.mjs` are
  unchanged.
- The twin comparison of ITM-016 (`tests/test_apply_approvals.py`) is unchanged; its F1–F3 marks stay until ITM-017.
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing — ITM-017 is no longer needed: no writer changes.

## Needs a person

No. The reading of a rule for an implementation is the Product Owner's, as S1 was (sprint 02); `akmaier` may overrule it.

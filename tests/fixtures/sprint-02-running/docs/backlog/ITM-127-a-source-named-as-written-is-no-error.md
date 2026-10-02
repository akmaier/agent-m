---
id: ITM-127
title: A requirement's source named as it is written is no error — no SRC- identifier is required
kind: implementation
level: 1
realises:
  - A REQUIREMENT HAS A REGISTERED SOURCE
  - A REQUIREMENT HAS FIVE FIELDS
modules:
  - MOD-artifacts
depends_on: []
origin: sprint 01 review
---
# ITM-127 A requirement's source named as it is written is no error — no SRC- identifier is required

**REGISTER**

## Outcome

`MOD-artifacts.requirementProblems(requirement, linkedSources)` (`docs/assets/artifacts/requirements.mjs`) no longer
reports a requirement whose source is named as it is written — for example `PO A. Maier, 2026-09-24` or `Vibe Coding,
ch. 7 §5` — as an error "the source names no registered source". A source does not need an `SRC-` identifier. What
stays an error: a missing source or a source without a date (`A REQUIREMENT HAS FIVE FIELDS`), a resource entry named
as source (`A RESOURCE'S TERMS ENTER AS A SOURCE`), and an `SRC-` identifier that is named but not linked to the product.
The fixture and the expectations of ITM-009 change accordingly; the comment at the top of `requirements.mjs` says the
same.

## Realises

- `A REQUIREMENT HAS A REGISTERED SOURCE`
- `A REQUIREMENT HAS FIVE FIELDS`

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 9). ITM-009 read `A REQUIREMENT HAS A
REGISTERED SOURCE` as "names an `SRC-` identifier"; on Agent M's own SPEC every requirement would then be an error.
akmaier, 2026-10-01: that reading was wrong — a requirement's source is named as it is written and needs no `SRC-`
identifier.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts/requirements.mjs` (`requirementProblems`, the header comment)
- `tests/fixtures/requirements/spec.md` (the fixture SPEC)
- `tests/test_requirement_has_source.py` (the expectations)
- `tests/test_requirement_fields.py`, `tests/test_single_statement.py`, `tests/test_requirement_names_check.py`, `tests/artifacts-checks.test.mjs` — the other readers of the fixture, only where an expectation rests on the fixture's sources (*From the sprint 02 planning*)

## Kind and level

- Job kind: **implementation** — its first commit holds only the changed tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_requirement_has_source.py` — `A REQUIREMENT HAS A REGISTERED SOURCE`
- `tests/test_requirement_fields.py` — `A REQUIREMENT HAS FIVE FIELDS`

## Acceptance criteria

- `A REQUIREMENT HAS A REGISTERED SOURCE` — `tests/test_requirement_has_source.py` — a requirement whose source is `PO A. Maier, 2026-09-24` yields no finding; counter-proofs: a named `SRC-` the product does not link, and a `RES-` entry named as source, are still errors.
- `A REQUIREMENT HAS FIVE FIELDS` — `tests/test_requirement_fields.py` — a requirement without a source, or with a source without a date, is still an error.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.

## Back from Release testing (2026-10-02) — finding C1

Finding **C1** of ITM-144 (`docs/measurements/2026-10-01_release-tests-sprint-02-c.md`, case 5, `{ todo }` in
`tests/release-sprint-02-c-artifacts.test.mjs`): a requirement written without any source — a bold name in capitals, the
rule, `*Occasion:*` and `*Check:*` lines, no `*(…)*` on the name line — passes `formatChecks("requirement", …)`, where this
item's own acceptance criterion says "a requirement without a source … is still an error". Path:
`artifacts/checks.mjs` `requirementChecks` → `artifacts/requirements.mjs` `parseRequirements` → `HEAD` requires the `*(…)*`
after the name → the name line is not read as a requirement → `requirementProblems` never runs for it. Ist: `[]`; Soll: one
error under `A REQUIREMENT HAS FIVE FIELDS`, "no source", at that requirement's line. `formatChecks` is what a drafting job's
correction loop sends back (ARC-007), so a participant that drops the source would not be told.

The Product Owner sends the item **back to Development** (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*;
the model's transition *Release testing → Development*): developer-opus-c takes it up on a new branch, red first — the
first commit removes the `{ todo }` mark of case 5 —, inside MOD-artifacts. What must hold: a bold name in capitals that is
followed, before the next blank line or heading, by an `*Occasion:*` or `*Check:*` line is a requirement without a source;
bold prose, a bold label and a quoted name stay no requirement (release case 6; ITM-128's fixture of bold prose); every
other release case of strand C and every existing test keeps its result — `parseRequirements` returns the same map for
every text that has sources. The reader is shared (the link graph, the SPEC browser, the queue entries read through it), so
the counter-proof covers a SPEC with a bold sentence between two requirements.

## From the sprint 02 planning

The callers of what this item changes were checked at planning (sprint 01 retrospective, P7). `requirementProblems`
is called by `docs/assets/artifacts/checks.mjs` (same module, signature unchanged) and read by five test files; four
of them share the fixture `tests/fixtures/requirements/spec.md` this item changes. All are MOD-artifacts, so the item
can change them; they are added to its list for the case that an expectation of theirs rests on the fixture's
sources. ITM-139 waits for this item, as before.

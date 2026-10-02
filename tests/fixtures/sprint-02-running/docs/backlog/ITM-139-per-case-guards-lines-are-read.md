---
id: ITM-139
title: A Guards line above a test case is read wherever it stands, not only among a file's first 20 lines
kind: implementation
level: 1
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
modules:
  - MOD-artifacts
depends_on:
  - ITM-127
origin: sprint 01 review
---
# ITM-139 A Guards line above a test case is read wherever it stands, not only among a file's first 20 lines

**REGISTER**

## Outcome

ARC-020 decision 2: "A test file with several cases may put `Guards:` per case in the comment directly above it." The
reader of test headers that ITM-011 built (`docs/assets/artifacts/headers.mjs`; MOD-artifacts `headerTags`) reads the
first 20 lines only, so a per-case `Guards:` line further down is not read, and the case's guarded names are lost to the
origin check and to the traceability derived from it. After this item, a `Guards:` line in the comment directly above a
test case is read for that case, wherever it stands; `Module:` and `Level:` stay file-level lines among the first 20.

## Realises

- `EVERY ARTIFACT NAMES ITS ORIGIN`

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 4, point 6 of the change request in pull
request #32). ARC-020 decides the form; MOD-artifacts' interface line for `headerTags` ("the first 20 lines") does not
carry it yet.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts/headers.mjs` (per-case `Guards:` lines)
- `tests/test_origin_links.py` and its fixture under `tests/fixtures/identity/` (a case-level `Guards:` below line 20)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`

## Acceptance criteria

- `EVERY ARTIFACT NAMES ITS ORIGIN` — `tests/test_origin_links.py` — a fixture test whose second case carries `Guards:` at line 40 has that name read for that case; counter-proof: the reader of today misses it, and a `Guards:` line not directly above a case is not taken as the case's.
- A `Level:` or `Module:` line below line 20 is still not read (the counter-proof of ITM-011 stays red when the limit is lifted for them).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-127 — MOD-artifacts' next change, so that two jobs do not change the module's tests at once

## Needs a person

Yes — `akmaier` accepts MOD-artifacts' interface line for `headerTags` changed to read per-case `Guards:` lines
(`docs/process.md`, *Boundary*). No open question: ARC-020 decision 2 decides the form.

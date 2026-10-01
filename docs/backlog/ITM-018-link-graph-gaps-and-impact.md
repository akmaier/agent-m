---
id: ITM-018
title: The link graph of one commit — coverage and module gaps, impact of a requirement change
kind: implementation
level: 1
realises:
  - THE TRACEABILITY MATRIX IS DERIVED
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
modules:
  - MOD-traceability
  - MOD-dashboard-app
depends_on:
  - ITM-009
  - ITM-010
  - ITM-011
  - ITM-133
origin: backlog refinement 2026-10-01
---
# ITM-018 The link graph of one commit — coverage and module gaps, impact of a requirement change

**REGISTER**

## Outcome

`linkGraph(snapshot)`, `tracesTo`, `coverageGaps`, `moduleRows`, `requirementImpact` and `architectureImpact` (the existing `impactList`, now over the graph) of MOD-traceability. Unknown names are kept with the note whether they were withdrawn. Nothing blocks on a gap.

## Realises

- `THE TRACEABILITY MATRIX IS DERIVED`
- `A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION`
- `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN`
- `MODULE GAPS ARE REPORTED, NOT FORBIDDEN`
- `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`
- `AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-traceability; ARC-006 (traceability is computed from one pinned commit).

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core
- MOD-dashboard-app (shells) — only for the two calls of the impact list in `docs/assets/dashboard/review-views.mjs` (*From the sprint 02 planning*)

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/traceability/graph.mjs` (new)
- `docs/assets/traceability.mjs` (impactList becomes architectureImpact)
- `docs/assets/dashboard/review-views.mjs` (its two calls of `impactList` become calls of `architectureImpact` over the graph; nothing else in the file)
- `tests/architecture-impact.test.mjs` (the renamed import and signature)
- `tests/test_matrix_derived.py`
- `tests/test_references.py`
- `tests/test_coverage_report.py`
- `tests/test_impact_list.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST`
- `tests/test_coverage_report.py` — `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN`; `MODULE GAPS ARE REPORTED, NOT FORBIDDEN`
- `tests/test_impact_list.py` — `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`
- `tests/test_matrix_derived.py` — `THE TRACEABILITY MATRIX IS DERIVED`
- `tests/test_references.py` — `A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION`

## Acceptance criteria

From the SPEC's checks:

- `THE TRACEABILITY MATRIX IS DERIVED` — `tests/test_matrix_derived.py`
- `A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION` — `tests/test_references.py`
- `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN` — `tests/test_coverage_report.py`
- `MODULE GAPS ARE REPORTED, NOT FORBIDDEN` — `tests/test_coverage_report.py`
- `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` — `tests/test_impact_list.py` — a change proposal touching an existing identifier carries the derived reference list.
- `AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST` — `tests/review-core.test.mjs`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-009 — requirements
- ITM-010 — use cases
- ITM-011 — code and test headers
- ITM-133 — the last item of sprint 02 that changes `docs/assets/dashboard/review-views.mjs` before this one

## Needs a person

No.

## Back from Release testing (2026-10-02) — finding D1, the graph's half

Finding **D1** of ITM-145 (`docs/measurements/2026-10-02_release-tests-sprint-02-d.md`, case 24, `{ todo }` in
`tests/release-sprint-02-d-traceability.test.mjs`; the view's half is ITM-134's): an open entry whose proposal states the
section without one of its requirements — TITLE renamed in place, or left out — draws no `proposes` edge to TITLE.
Path: `traceability/graph.mjs` `linkGraph` → `isQueueEntry` → `for (const r of parseRequirements(text(path)).values())` — only
the names the entry's text states → TITLE is not among them: no edge; the new name is not in the SPEC: `"add"`. Accepting
such an entry replaces the section byte for byte (UC-006 step 6) and takes TITLE out of the SPEC without a withdrawal note
while UC-001, UC-002, MOD-cover and `tests/title.test.mjs` still name it — the case the rule's occasion recalls. The
dashboard's own editor proposes a rename as a withdrawal plus an addition (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`);
an entry written by hand or by a CI agent need not be, and those are the entries a reviewer sees.

The Product Owner sends the item **back to Development** (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*):
developer-opus-d takes it up on a new branch, red first — the first commit removes the mark of case 24 —, inside
MOD-traceability, before ITM-134's re-opening. The graph learns which section an entry replaces from the files it is
given: the queue's `index.md` (`docs/spec-freigaben/<queue>/index.md`, read with `parseQueueIndex` of MOD-review-core,
which MOD-traceability uses) names each entry's anchor, and `extractSection`/`sectionForEntry` give the SPEC section it
replaces; every live requirement of that section the entry no longer states is an edge `proposes` with `change:
"withdraw"` (the name leaves the SPEC without a note) — or `"change"` where the entry states it under another name;
which of the two is the developer's reading, recorded with the change. Without the index among the files, the graph
behaves as today. `linkGraph(snapshot)`'s interface is unchanged: the index is one more file in `files`.

## From the sprint 02 planning

The callers of what this item changes were checked at planning (sprint 01 retrospective, P7). `impactList` is
imported by `docs/assets/dashboard/review-views.mjs` (two calls, the architecture view and the review page) — a
file of MOD-dashboard-app, which this item did not name; renaming it to `architectureImpact` with the graph as
input would have left the item unable to change its caller, as ITM-008 was (`AN IMPLEMENTATION JOB CHANGES ONLY
ITS MODULES`). MOD-dashboard-app is therefore among its modules for that one file, and the item waits for
ITM-133, the last change to `review-views.mjs` before it in sprint 02 (`docs/backlog/sprints/sprint-02.md`). The
other callers — `tests/architecture-impact.test.mjs` (MOD-traceability) and the assertion in
`tests/architecture-view.test.mjs` that the dashboard holds no implementation of its own — lie inside its modules.

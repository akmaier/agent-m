---
id: ITM-156
title: A requirement that names another requirement in its text is in that requirement's impact list
kind: implementation
level: 1
realises:
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - THE TRACEABILITY MATRIX IS DERIVED
modules:
  - MOD-traceability
depends_on:
  - ITM-018
origin: sprint 02 review input (the link graph's edges)
---
# ITM-156 A requirement that names another requirement in its text is in that requirement's impact list

**REGISTER**

## Outcome

`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`: "the artifacts that reference it are listed". `requirementImpact`
(`docs/assets/traceability/graph.mjs`) lists the use cases that realise a requirement, the decisions it forces, the modules
that realise it and the tests that guard it — the four kinds of `IMPACT` — and no requirement: the graph draws no edge from
a requirement to a requirement it names in its rule, occasion or check (for example `A RECORD IS EVIDENCE, NOT A PROPOSAL`
names `A GENERATED ARTIFACT IS A PROPOSAL` and `A RESULT RECORD IS NEVER REWRITTEN` in its occasion). Soll: `linkGraph`
draws an edge `names` from a requirement to every requirement whose name stands in its text in backticks — the form the
SPEC uses for a reference, which `requirementProblems` already tells from a conjunction —; `requirementImpact` lists
such requirements as artifacts of kind `requirement`, via `names`; `coverageGaps` keeps an unknown name among them as
unknown, with its withdrawal note, so that a withdrawn requirement still named by another is reported. The Product Owner's
reading: a requirement is an artifact of the SPEC, and the renumbering the rule's occasion recalls broke references
between requirements as much as references from files.

## Realises

- `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` — "the artifacts that reference it", requirements among them
- `THE TRACEABILITY MATRIX IS DERIVED` — the edge is read from the text, never stored

## Where it came from

Sprint 02 review input, raised by the Scrum Master at the gate decisions of 2026-10-02 and read in the code by the
Product Owner (`graph.mjs`: the SPEC's requirements become nodes without edges of their own; `IMPACT` names four kinds).
Not a release-test finding; no mark in any test.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/traceability/graph.mjs` (`linkGraph`: the `names` edge; `requirementImpact`: the kind `requirement`)
- `tests/test_impact_list.py` (a requirement naming another is listed; counter-proof: a name in prose, not in backticks, is not an edge)
- `tests/test_coverage_report.py` (a withdrawn requirement named by a live one is reported with its note)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_impact_list.py` — `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`
- `tests/test_matrix_derived.py` — `THE TRACEABILITY MATRIX IS DERIVED` (exists; holds)

## Acceptance criteria

From the SPEC's checks:

- `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` — `tests/test_impact_list.py` — a change proposal touching an existing identifier carries the derived reference list, the requirements that name it included.

Further:

- On a fixture SPEC where RULE TWO names `RULE ONE` in its occasion, `requirementImpact(graph, "RULE ONE")` lists RULE TWO as `{ kind: "requirement", via: "names" }` beside the use cases, decisions, modules and tests; counter-proof: a requirement whose prose mentions the words of RULE ONE without backticks is not listed; the SPEC entry page shows it (ITM-134's `KIND` and `VIA` gain the kind — one line each in `spec-changes-view.mjs`, or the view shows the kind as the graph names it).
- `coverageGaps(graph).unknownNames` carries a withdrawn requirement that a live one names, with `withdrawn: true` and what names it.
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-018 — built `linkGraph` and `requirementImpact` (sprint 02, strand D)

## Needs a person

No — `requirementImpact(graph, name) -> [artifact]` keeps its shape; a new kind among the artifacts is no change to the interface line. If the view's two lines are needed, MOD-dashboard-app is added for `dashboard/spec-changes-view.mjs` at refinement.

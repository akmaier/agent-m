---
id: ITM-022
title: The audit view of a release and its self-contained Markdown export
kind: implementation
level: 1
realises:
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - UC-030
modules:
  - MOD-traceability
depends_on:
  - ITM-018
origin: backlog refinement 2026-10-01
---
# ITM-022 The audit view of a release and its self-contained Markdown export

**REGISTER**

## Outcome

`auditRows(graph, outcomes, release)` — one row per requirement valid at the release, gaps included — and `auditMarkdown(audit)`, naming tag, commit, source versions with hashes and the blob SHAs of report and approvals.

## Realises

- `THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE`
- UC-030 — Audit the tests of a release

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-traceability `auditRows`, `auditMarkdown`; ARC-006 (export).

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/traceability/audit.mjs` (new)
- `tests/test_audit_view.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_audit_view.py` — `THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE`

## Acceptance criteria

From the SPEC's checks:

- `THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE` — `tests/test_audit_view.py`

From the postcondition of UC-030 (Audit the tests of a release), for the part this item builds:

> - The auditor holds, for one release, the evidence per requirement and every gap, as one Markdown
>   document that can be checked against the repository without Agent M.
> - Nothing was written, unless the export was committed on a person's click.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-018 — the link graph

## Needs a person

No.

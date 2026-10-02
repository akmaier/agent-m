---
id: ITM-050
title: Repository checks of the hard product rules — no server, Markdown artifacts, a self-sufficient product repository
kind: implementation
level: 1
realises:
  - NO SERVER
  - ARTIFACTS ARE MARKDOWN
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
modules: []
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-050 Repository checks of the hard product rules — no server, Markdown artifacts, a self-sufficient product repository

**REGISTER**

## Outcome

The three checks the SPEC names: the built site calls no origin besides the permitted ones and the hosts the page names before calling them; every artifact Agent M produces is Markdown with Mermaid diagrams; no artifact of a fixture product references a file or service that exists only inside Agent M. Each with a counter-proof.

## Realises

- `NO SERVER`
- `ARTIFACTS ARE MARKDOWN`
- `THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — SPEC §0 checks; ARC-001, ARC-006.

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `tests/test_no_backend.py`
- `tests/test_artifact_format.py`
- `tests/test_self_sufficient.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_artifact_format.py` — `ARTIFACTS ARE MARKDOWN`
- `tests/test_no_backend.py` — `NO SERVER`
- `tests/test_self_sufficient.py` — `THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`

## Acceptance criteria

From the SPEC's checks:

- `NO SERVER` — `tests/test_no_backend.py` — the built site contains no call to an origin other than the configured endpoints, the repository servers of the instance and its products, the mail provider's API and sign-in, the local bridge, the jump host's HTTPS address, and the package registries and resource hosts the page names before it calls them.
- `ARTIFACTS ARE MARKDOWN` — `tests/test_artifact_format.py`
- `THE PRODUCT REPOSITORY IS SELF-SUFFICIENT` — `tests/test_self_sufficient.py` — no artifact references a file or service that exists only inside Agent M.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — every module file carries its Module line and the tests their headers

## Needs a person

No.

## Notes

Rules whose check runs no single module (ARC-020 decision 5): the tests carry `Guards:` and `Level:`, no `Module:`.

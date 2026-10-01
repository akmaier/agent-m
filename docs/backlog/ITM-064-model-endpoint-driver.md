---
id: ITM-064
title: The model-endpoint driver from the browser, and a diagnosis that names why an endpoint cannot be called
kind: implementation
level: 1
realises:
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - UC-003
modules:
  - MOD-participants
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-064 The model-endpoint driver from the browser, and a diagnosis that names why an endpoint cannot be called

**REGISTER**

## Outcome

`endpointDriver(config)` for the OpenAI-compatible and the Anthropic Messages formats (with `anthropic-dangerous-direct-browser-access: true`), the key only in that endpoint's header, usage as reported; `diagnoseEndpoint(config)` names a refused cross-origin call and the CI route (and, for a server on the person's machine, the bridge route) that would work.

## Realises

- `AN UNSUPPORTED ENDPOINT SAYS SO`
- UC-003 — Configure a model endpoint

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-participants (takes over the withdrawn MOD-participant-endpoint); ARC-009 decision 1.

Architecture decisions its modules follow: ARC-003, ARC-009, ARC-011, ARC-012.

## Modules

- MOD-participants (adapters) — uses MOD-bridge-server

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/participants.mjs` (new)
- `tests/test_endpoint_diagnosis.py`
- `tests/participants.endpoint.test.mjs` (new)
- `tests/fixtures/endpoints/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_endpoint_diagnosis.py` — `AN UNSUPPORTED ENDPOINT SAYS SO`

## Acceptance criteria

From the SPEC's checks:

- `AN UNSUPPORTED ENDPOINT SAYS SO` — `tests/test_endpoint_diagnosis.py`

From the postcondition of UC-003 (Configure a model endpoint), for the part this item builds:

> - The configuration exists only in this browser.
> - The key has not appeared in a URL, a cookie, or any repository.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.

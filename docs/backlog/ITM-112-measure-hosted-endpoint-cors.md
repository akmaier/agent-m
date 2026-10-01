---
id: ITM-112
title: Measure the hosted model endpoints' answers to a page's request
kind: measurement
level: 1
realises:
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - AN UNSUPPORTED ENDPOINT SAYS SO
modules: []
depends_on:
  - ITM-064
origin: backlog refinement 2026-10-01
---
# ITM-112 Measure the hosted model endpoints' answers to a page's request

**REGISTER**

## Outcome

ARC-009's open measurement: a preflight from `Origin: https://akmaier.github.io` to `api.anthropic.com` (with and without `anthropic-dangerous-direct-browser-access`) and `api.openai.com` in the form of `docs/measurements/2026-09-30_gitlab-cors.md`, and one real browser call each with a test key; recorded before the endpoint driver is released.

## Realises

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`
- `AN UNSUPPORTED ENDPOINT SAYS SO`

## Where it came from

ARC-009 consequences (open measurement — hosted endpoint CORS).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_hosted-endpoint-cors.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **1** — browser and hosted CI; nothing installed.

## Checks of the SPEC this measurement bears on

- `tests/test_endpoint_diagnosis.py` — `AN UNSUPPORTED ENDPOINT SAYS SO`
- `tests/test_measurement_present.py` — `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`

## Acceptance criteria

From the SPEC's checks:

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` — `tests/test_measurement_present.py` — a released runtime has a dated measurement file.
- `AN UNSUPPORTED ENDPOINT SAYS SO` — `tests/test_endpoint_diagnosis.py`

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-064 — the endpoint driver to call with

## Needs a person

A person holding a test key for each provider makes the real browser call; the key never enters the repository.

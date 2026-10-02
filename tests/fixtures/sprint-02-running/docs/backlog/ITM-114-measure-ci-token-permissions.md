---
id: ITM-114
title: Measure what the CI writes need — Workflows on a workflow-file push, pipelines from a GitLab project token
kind: measurement
level: 1
realises:
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
modules: []
depends_on:
  - ITM-061
origin: backlog refinement 2026-10-01
---
# ITM-114 Measure what the CI writes need — Workflows on a workflow-file push, pipelines from a GitLab project token

**REGISTER**

## Outcome

ARC-015 open measurements 1 and 2: update a file under `.github/workflows/` with a fine-grained token without and with *Workflows*; push and open a merge request with a GitLab project access token on a test project and record the pipelines.

## Realises

- `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`
- `ONE GITHUB TOKEN SERVES EVERY FEATURE`

## Where it came from

ARC-015 consequences (open measurements 1, 2).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_ci-token-permissions.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **1** — browser and hosted CI; nothing installed.

## Checks of the SPEC this measurement bears on

- `tests/test_runtime_levels.py` — `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`
- `tests/test_token_scope_documented.py` — `ONE GITHUB TOKEN SERVES EVERY FEATURE`

## Acceptance criteria

From the SPEC's checks:

- `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET` — `tests/test_runtime_levels.py` — the generated job workflow authenticates its pushes and pull requests with the named secret; counter-proof: a workflow that uses `GITHUB_TOKEN` for them fails.
- `ONE GITHUB TOKEN SERVES EVERY FEATURE` — `tests/test_token_scope_documented.py` — the prefilled link asks for exactly these permissions.

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-061 — the generated workflows that push

## Needs a person

A person who can create the tokens and test repositories (the PO's account); no token enters the repository.

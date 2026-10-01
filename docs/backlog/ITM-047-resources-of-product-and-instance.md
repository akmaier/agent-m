---
id: ITM-047
title: Resources of a product and of the instance — pins, licences, maintainers, routes, secrets by name
kind: implementation
level: 1
realises:
  - A PRODUCT DECLARES ITS RESOURCES
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
  - THE RESOURCE KIND IS ONE OF A CLOSED SET
  - A RESOURCE IS PINNED TO AN EXACT STATE
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
  - A RESOURCE DECLARES ITS LICENCE
  - A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED
  - A RESOURCE NAMES ITS MAINTAINER
  - A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
  - A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
  - A RESOURCE DECLARES WHERE IT PROCESSES DATA
  - A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
  - THE INSTANCE DECLARES ITS OWN RESOURCES
  - INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
  - A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES
modules:
  - MOD-source-library
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-047 Resources of a product and of the instance — pins, licences, maintainers, routes, secrets by name

**REGISTER**

## Outcome

`parseResources`, `validateResource`, `reachableRoutes` and `newerState` of MOD-source-library over `docs/resources.md` of a product or the instance.

## Realises

- `A PRODUCT DECLARES ITS RESOURCES`
- `A RESOURCE IS USED, A PARTICIPANT DEVELOPS`
- `THE RESOURCE KIND IS ONE OF A CLOSED SET`
- `A RESOURCE IS PINNED TO AN EXACT STATE`
- `A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT`
- `A RESOURCE DECLARES ITS LICENCE`
- `A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED`
- `A RESOURCE NAMES ITS MAINTAINER`
- `A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE`
- `A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE`
- `A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER`
- `A RESOURCE DECLARES WHERE IT PROCESSES DATA`
- `A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE`
- `THE INSTANCE DECLARES ITS OWN RESOURCES`
- `INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT`
- `A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-source-library (takes over the withdrawn MOD-resources).

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-source-library (features) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/source-library/resources.mjs` (new)
- `tests/test_resources.py`
- `tests/review-core.d/resources.test.mjs`
- `tests/test_no_secret_written.py` (created here with the resource cases)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT`; `A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE`
- `tests/test_no_secret_written.py` — `A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE`
- `tests/test_resources.py` — `A PRODUCT DECLARES ITS RESOURCES`; `A RESOURCE IS USED, A PARTICIPANT DEVELOPS`; `THE RESOURCE KIND IS ONE OF A CLOSED SET`; `A RESOURCE IS PINNED TO AN EXACT STATE`; `A RESOURCE DECLARES ITS LICENCE`; `A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED`; `A RESOURCE NAMES ITS MAINTAINER`; `A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER`; `A RESOURCE DECLARES WHERE IT PROCESSES DATA`; `A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE`; `THE INSTANCE DECLARES ITS OWN RESOURCES`; `INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT`
- guarded at review only: `A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES`

## Acceptance criteria

From the SPEC's checks:

- `A PRODUCT DECLARES ITS RESOURCES` — `tests/test_resources.py` — a product with a declared resource has it in `docs/resources.md`; counter-proof: a resource entry written anywhere else is not found and fails.
- `A RESOURCE IS USED, A PARTICIPANT DEVELOPS` — `tests/test_resources.py` — a resource entry carrying participant fields (capabilities, role) is rejected; counter-proof: the same entry without them is accepted.
- `THE RESOURCE KIND IS ONE OF A CLOSED SET` — `tests/test_resources.py` — an unknown kind is rejected; counter-proof: each of the six is accepted.
- `A RESOURCE IS PINNED TO AN EXACT STATE` — `tests/test_resources.py` — a `model` entry without revision or hash fails; counter-proof: the same entry with a 40-hex revision passes, and a `compute` entry without a pin passes.
- `A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT` — `tests/review-core.test.mjs` — a newer upstream commit is reported and `docs/resources.md` is unchanged; counter-proof: after the *Move* click it carries the new commit.
- `A RESOURCE DECLARES ITS LICENCE` — `tests/test_resources.py` — such an entry without a licence field fails; counter-proof: the same entry with `MIT` passes.
- `A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED` — `tests/test_resources.py` — declaring a restricted resource commits only `docs/resources.md`; counter-proof: a fixture that adds a file from the resource fails.
- `A RESOURCE NAMES ITS MAINTAINER` — `tests/test_resources.py` — an entry with neither a maintainer nor `unknown` fails; counter-proof: `unknown` passes.
- `A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE` — `tests/test_no_secret_written.py` — a configured resource credential written into `docs/resources.md` fails the run; counter-proof: the secret's name alone passes.
- `A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE` — `tests/review-core.test.mjs` — a request to any other origin carries no resource credential; counter-proof: the request to the resource's own server carries it.
- `A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER` — `tests/test_resources.py` — a `compute` entry without a route, or with another route, is rejected; counter-proof: `bridge` and `runner:<label>` are accepted.
- `A RESOURCE DECLARES WHERE IT PROCESSES DATA` — `tests/test_resources.py` — such an entry without a processing place fails; counter-proof: `NHR@FAU, Erlangen` passes.
- `A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE` — `tests/test_resources.py` — a job needing a `runner:gpu` compute resource is not offered on a GitHub-hosted runner; counter-proof: it is offered on the runner with label `gpu`.
- `THE INSTANCE DECLARES ITS OWN RESOURCES` — `tests/test_resources.py`
- `INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT` — `tests/test_resources.py`
- `A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES` — no automatic check; at review.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — adds its checks under tests/review-core.d/

## Needs a person

No.

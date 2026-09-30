---
id: MOD-resources
title: Keeps a product's and an instance's resources, their pins and routes, and the due diligence of reused libraries
realises:
  - A PRODUCT DECLARES ITS RESOURCES
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
  - THE RESOURCE KIND IS ONE OF A CLOSED SET
  - A RESOURCE IS PINNED TO AN EXACT STATE
  - A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
  - A RESOURCE DECLARES ITS LICENCE
  - A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED
  - A RESOURCE NAMES ITS MAINTAINER
  - A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
  - A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
  - A RESOURCE DECLARES WHERE IT PROCESSES DATA
  - THE INSTANCE DECLARES ITS OWN RESOURCES
  - INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - A PRODUCT DECLARES ITS LICENCE
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - UC-022
  - UC-040
follows:
  - ARC-003
  - ARC-006
uses:
  - MOD-git-host.readSnapshot
provides:
  - parseResources
  - validateResource
  - reachableRoutes
  - newerState
  - dueDiligence
  - licenceCompatibility
---
# MOD-resources Keeps a product's and an instance's resources, their pins and routes, and the due diligence of reused libraries

## Responsibility

What a product (or the instance) is built with and runs on, and what it reuses: resource entries,
their pins, routes and processing places, and the fetched due diligence of reuse candidates against
the product's licence (book ch. 6 §5). Pure core; the fetchers for registries and hosts are passed
in by the caller.

**Current state.** No code exists. The due diligence tables in ARC-002, ARC-009, ARC-011, ARC-013,
ARC-014 and ARC-016 were fetched by hand for this architecture; `dueDiligence` is what produces them
in a derivation job (UC-022 step 7).

## Interfaces

- `parseResources(text) -> [resource]` — `docs/resources.md`: kind, address, pin, licence, maintainer, route, processing place, secret by name; a row with participant fields or a secret value is an error.
- `validateResource(resource) -> [problem]` — a pin for `repository`, `data`, `model`, `endpoint` and `agent` (none for `compute`, whose environment is pinned in the job's own files), licence and maintainer where the kind requires them, a route `bridge` or `runner:<label>` for compute.
- `reachableRoutes(resources, runtimes) -> Map(runtime -> ok | reason)` — on which runtimes a job needing these resources can run.
- `newerState(resource, upstream) -> { current, newer } | null` — a newer commit, revision or served model, shown; the pin changes only by the person's *Move*.
- `dueDiligence(candidate, fetchers) -> record` — existence, licence, release dates, open and closed issues and adoption, each fact with the address and date it was read; a package not found is reported as possibly invented.
- `licenceCompatibility(candidateLicence, productLicence, table) -> "compatible" | "marked"` — the table is data; an unknown pair is marked, never passed.

Uses, as declared above: `MOD-git-host.readSnapshot`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*

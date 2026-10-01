---
id: MOD-source-library
title: The registers — requirement sources with their versions and links, resources with their pins and routes, and fetched due diligence of reused libraries
realises:
  - A SOURCE DECLARES ITS AUTHORITY
  - A LIVING SOURCE IS PINNED
  - THE SOURCE KIND IS ONE OF A CLOSED SET
  - THE INSTANCE KEEPS THE SOURCE REGISTER
  - A PRODUCT LINKS THE SOURCES THAT APPLY
  - A LINK NAMES THE PART THAT APPLIES
  - A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY
  - A SOURCE DECLARES ITS LICENCE
  - RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - A SOURCE VERSION IS NEVER OVERWRITTEN
  - A STANDARD IS REGISTERED BY ITS DESIGNATION
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - A PRODUCT DECLARES ITS LICENCE
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
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
  - UC-004
  - UC-015
  - UC-016
  - UC-040
follows:
  - ARC-003
  - ARC-006
uses: []
provides:
  - parseSource
  - validateSource
  - parseSourceLinks
  - hashFiles
  - contentLabels
  - parseResources
  - validateResource
  - reachableRoutes
  - newerState
  - dueDiligence
  - licenceCompatibility
  - fetchLegalText
---
# MOD-source-library The registers: sources, resources, due diligence

## Responsibility

Feature. Both registers of a product and of its instance: requirement sources — the instance's register
under `docs/sources/`, each product's links in `docs/sources.md`, versions with identifiers and hashes,
where restricted content may live and which places its content may go to — and resources — entries in
`docs/resources.md` of a product or the instance, their pins, licences, maintainers, routes, processing
places and secrets by name. It also holds the due diligence of a reuse candidate, every fact fetched with
the address and date it was read, and the compatibility of a licence with the product's. It labels the
content it owns for the one rule of where content may go (ARC-007); it does not decide that rule. The
fetchers for registries, resource hosts and the EU's publication repository are passed in, each bound by
its caller to one origin and that origin's credential.

## Interfaces

- `parseSource(text) -> source` — `docs/sources/SRC-<slug>.md`: kind (one of the closed set), authority, licence, permitted processing places, versions with identifier or designation, date and the SHA-256 of every file.
- `validateSource(source, existing) -> [problem]` — a missing field, an unknown kind, a standard without its full designation, a changed existing version, the same bytes as an existing version, restricted content placed in the public instance.
- `parseSourceLinks(text) -> [{ source, version, hash, part }]` — a product's `docs/sources.md`.
- `hashFiles(files) -> [{ name, sha256 }]` — computed in the browser without sending the files anywhere; a zip is hashed as a file and listed by its members.
- `contentLabels(source) -> [label]` — the label of a source's content: the processing places its register entry permits, for `MOD-job-harness.mayReceive`.
- `parseResources(text) -> [resource]` — `docs/resources.md`: kind, address, pin, licence, maintainer, route, processing place, secret by name; a row with participant fields or a secret value is an error.
- `validateResource(resource) -> [problem]` — a pin for `repository`, `data`, `model`, `endpoint` and `agent` (none for `compute`, whose environment is pinned in the job's own files), licence and maintainer where the kind requires them, a route `bridge` or `runner:<label>` for compute, a processing place where the kind requires it.
- `reachableRoutes(resources, runtimes) -> Map(runtime -> ok | reason)` — on which runtimes a job needing these resources can run.
- `newerState(resource, fetch) -> { current, newer } | null` — a newer commit, revision or served model, shown; the pin changes only by the person's *Move*; the resource's credential goes only to the fetcher of the resource's own origin.
- `dueDiligence(candidate, fetchers) -> record` — existence, licence, release dates, open and closed issues and adoption, each fact with the address and date it was read; a package not found is reported as possibly invented.
- `licenceCompatibility(candidateLicence, productLicence, table) -> "compatible" | "marked"` — the table is data; an unknown pair is marked, never passed.
- `fetchLegalText(celexOrEli, fetch) -> { text, retrieved, versionId, sha256 }` — the fetch workflow's step: the official text from the EU's publication repository, run in CI because the browser cannot read it.

## Testing

Unit tests over fixture registers and resource lists, with one broken entry per rule and its expected
problem (`tests/test_source_register.py`, `tests/test_resources.py`). Component tests for `dueDiligence`,
`newerState` and `fetchLegalText` with fake fetchers that record every request: a candidate the registry
does not know is reported as possibly invented; a resource credential reaches only its own origin's
fetcher. The seams are the fetchers. No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): both registers in one module, taking over MOD-resources; fetchers passed in; open until accepted.*

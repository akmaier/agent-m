---
id: MOD-resource-list
title: What a product and the instance are built with and run on
folder: src/resource-list/
realises:
follows:
  - ARC-045
uses:
  - MOD-documents.loadSchema
  - MOD-documents.Schema
  - MOD-text-tools.finding
  - MOD-text-tools.Finding
  - MOD-job-runner.Strategies
  - MOD-job-runner.JobContext
  - MOD-job-runner.Part
provides:
  - Resource
  - Pin
  - CheckPlan
  - resourceSchema
  - resourceFindings
  - readPin
  - checkPlan
  - newerState
  - paidServices
  - reachableBy
  - resourceStrategies
---
# MOD-resource-list What a product and the instance are built with and run on

## Responsibility

It belongs to Sources and resources (ARC-045). It defines the list of resources a product is built with, tested on or
calls at runtime — `docs/resources.md` of the product (`A PRODUCT DECLARES ITS RESOURCES`) — and the instance's own list
of the same form, independent of it (`THE INSTANCE DECLARES ITS OWN RESOURCES`, `INSTANCE AND PRODUCT RESOURCES ARE
INDEPENDENT`): each entry pinned to the exact state used, with its licence, maintainer, route and processing place as
its kind requires, whether a service the product calls is paid, and the name of a secret, never its value. It checks what
a schema cannot, says how a resource is checked, finds a newer state upstream without moving the pin, lists the services
a product calls, paid or free, says which routes reach a resource, and offers the recipe of a check job on a runner. It
runs in a browser and in Node, and keeps nothing.

## Parts

- `index.mjs` — the interface.
- `resources.schema.md` — the schema of the list, in the schema language of MOD-documents.
- `rules.mjs` — the checks a schema cannot express.
- `strategies.mjs` — the recipe `resource-check`.

## Data

**The list `docs/resources.md`**: a title, a sentence, and one table with one row per resource.

| Column | Holds | Required |
|---|---|---|
| Name | unique in the list | always |
| Kind | one of `repository`, `data`, `model`, `compute`, `endpoint`, `agent` (`THE RESOURCE KIND IS ONE OF A CLOSED SET`) | always |
| Address | where it is: a repository's address, a Hub identifier, a host name, an endpoint's base address | always |
| Pin | a commit of 40 hexadecimal digits for a repository; a revision or the SHA-256 of every file for data and a model; the identifier of the served model for an endpoint and an agent; `—` for compute, whose software environment is pinned in the job's own files (`A RESOURCE IS PINNED TO AN EXACT STATE`, `A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES`) | except for compute |
| Licence | the licence or terms of use and redistribution, `unknown` counting as restricted (`A RESOURCE DECLARES ITS LICENCE`) | for repository, data, model |
| Maintainer | an account, an organisation, a collaborator who consented to be named, or `unknown` (`A RESOURCE NAMES ITS MAINTAINER`) | for repository, data, model, agent |
| Route | for compute `bridge` or `runner:<label>` (`A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER`); for an endpoint or an agent the route jobs reach it by; for the others how it is read | always |
| Processing place | where the data given to it is processed (`A RESOURCE DECLARES WHERE IT PROCESSES DATA`) | for compute, endpoint, agent |
| Paid | for a service the product calls, `yes` when it charges per call and `no` otherwise (`COMMIT TESTS CALL NO PAID SERVICE`); `—` for data that is downloaded rather than called, and for the other kinds | for endpoint, agent, and data the product calls as a service |
| Secret | `ci:<NAME>` for a CI secret, `browser` for a key kept in a browser, or `—` (`A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE`) | always |

An entry holds no capabilities and no role: whatever works on the product is a participant (`A RESOURCE IS USED, A
PARTICIPANT DEVELOPS`); a system in both roles is one entry here and one in the participant register (`ONE SYSTEM IN TWO
ROLES IS TWO ENTRIES`). A restricted resource is referenced by its address and pin, never copied into the repository
(`A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED`). A rule a resource imposes enters as a source (`A RESOURCE'S TERMS
ENTER AS A SOURCE`), not here.

```markdown
| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |
|---|---|---|---|---|---|---|---|---|---|
| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |
| local-llm | endpoint | http://workstation.example.org:8000/v1 | example-model | — | — | bridge | the group's workstation | no | — |
```

## Interfaces

- `Resource` — `{ name: string, kind: "repository" | "data" | "model" | "compute" | "endpoint" | "agent", address:
  string, pin: string | null, licence: string | null, maintainer: string | null, route: string, place: string | null,
  paid: boolean | null, secret: string | null }`: one row as MOD-documents reads it with this module's schema.
- `Pin` — `{ kind: "commit" | "revision" | "files" | "served model", value: string | Record<string, string> }`.
- `CheckPlan` — `{ how: "read on its host" } | { how: "probe through the Bridge", probe: "served models" | "partitions"
  | "answers" } | { how: "check job on a runner", label: string }`.
- `resourceSchema() -> Schema` — the schema of the list.
- `resourceFindings(resources: Resource[]) -> Finding[]` — what the schema cannot express: the pin's form for the kind —
  a full commit, not a branch name such as `main` —, the columns its kind requires, a compute route other than `bridge`
  or `runner:<label>`, an endpoint or agent without its Paid mark, an entry that carries a participant's capabilities or
  role, a secret's value where its name belongs, and, as a warning, a maintainer who is a single person.
- `readPin(resource: Resource, readers: { repositoryHead: (address: string) => Promise<string>, hubRevision: (id: string)
  => Promise<{ revision: string, licence: string | null }> }) -> Promise<Pin>` — the current state upstream, read through
  the readers the caller hands in: the repository host's head, or the Hub's revision. It crosses the network through them
  and fails as they fail; a Hub that does not answer a browser is named, and the person pastes a full revision instead.
- `checkPlan(resource: Resource) -> CheckPlan` — how a resource is checked: read on its host for a repository, data or a
  model; a harmless probe through the Bridge for compute reached by it and for an endpoint or agent — its served models,
  a cluster's partitions —; a check job on the runner's label for compute reached by a runner (UC-040).
- `newerState(resource: Resource, upstream: Pin) -> { newer: boolean, upstream: Pin }` — whether a newer state exists. It
  moves nothing: a pin changes only when a person moves it and the list is committed (`A PINNED RESOURCE MOVES ONLY WHEN
  A PERSON MOVES IT`).
- `paidServices(resources: Resource[]) -> { name: string, kind: "endpoint" | "agent" | "data", address: string, paid:
  boolean }[]` — every service the product calls — each endpoint and agent, and data with a Paid mark —, each marked paid
  or free, for MOD-result-records' recipe `test-selection` (UC-026), so that no commit-level test reaches a paid one
  (`COMMIT TESTS CALL NO PAID SERVICE`).
- `reachableBy(resources: Resource[]) -> { resource: string, route: "bridge" | string }[]` — for the resources a job
  needs, the routes that reach them — called by MOD-progress-measures for a product's facts, and by the test and the
  maintenance pages —, which their callers hand to MOD-runtimes' `routesFor`, so that only those routes are offered
  (`A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE`).
- `resourceStrategies` — `Partial<Strategies>` with the recipe `resource-check`: the resource a job names and the harmless
  request to make on the runner, as one part.

## Files

It reads its own schema file. The lists `docs/resources.md` of a product and of the instance are read and written by its
callers through MOD-documents with `resourceSchema`, and committed through Access.

## Uses

- `MOD-documents.loadSchema`, `MOD-documents.Schema` — the list's schema.
- `MOD-text-tools.finding`, `MOD-text-tools.Finding` — the findings of `resourceFindings`.
- `MOD-job-runner.Strategies`, `MOD-job-runner.JobContext`, `MOD-job-runner.Part` — the recipe it offers.

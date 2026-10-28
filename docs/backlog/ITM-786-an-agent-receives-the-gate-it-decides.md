---
id: ITM-786
title: An agent that decides a gate receives the gate and its artifacts
level: module
realises:
  - UC-034
  - A GATE NAMES WHAT IT CHECKS
  - A JOB STOPS AT EVERY GATE
modules:
  - MOD-product-process
builds_on:
  - ITM-632
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-786 An agent that decides a gate receives the gate and its artifacts

**REGISTER**

## Outcome

UC-034 step 7, for an agent. The kind `decide-gate` names the recipe `gate-inputs` and the writer `gate-record`
(`src/job-catalogue/kinds/decide-gate/kind.md`); MOD-product-process states `processStrategies` and does not build it.
This item builds `processStrategies` with the recipe `gate-inputs` — the gate, what it checks and its condition, the
texts of the artifacts to examine, and the job waiting there — and registers it, as the module's file states it.

## Acceptance

- `prepareJob` of a `decide-gate` job no longer fails on the recipe, and its parts hold the gate, its condition, the
  artifacts' texts at their blobs and the waiting job.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (a), answered by the texts

The question sprint 86 left for akmaier (`docs/backlog/sprints/team2/86.md:86-89`): which parameters does a `decide-gate`
job carry? A job's `## Parameters` hold "the parameters the kind's recipes read" (MOD-job-ledger.md:83-85), so the recipe
names its own, as `implementation-inputs` names `params.steps` and `params.items` with no module text naming them
(`src/run-planner/inputs.mjs:37`, MOD-run-planner.md:116). The gate record's own fields give the names
(MOD-product-process.md:116): `gate`, `job` ("the job waiting there") and `on` (`<path>@<blob>` per artifact).

**The reading:** `gate-inputs` reads `params.gate` — the gate as `workflowOf` gives it, with what it checks and its
condition (MOD-product-process.md:131-133) —, `params.on` — the paths of the artifacts, each read from the product's
snapshot with its blob (`blobSha`, in the Uses) —, and `params.job`, the waiting job's identifier; the module's header
names them. The writer `gate-record` takes the same keys. MOD-job-ledger is not needed: the job's identifier is enough.

Who starts a `decide-gate` job is no part of this item (its Acceptance asks for `prepareJob`). The item is buildable as it
stands. While team 1's sprint 87 runs, MOD-product-process is used by MOD-settings-pages and MOD-trace-pages, so the
item is held.

**Stopped at its stop clause (sprint team1/92, developer-sonnet-a).** `prepareJob` reads each part's `sources` to check
the participant's place (`src/job-runner/prepare.mjs:34-45`, `:70`). A gate's artifact under a `context.places.contents`
path must carry its source, which MOD-job-runner's `sourcesOf` gives (MOD-job-runner.md:313-315). `sourcesOf` is not
built (ITM-632), and MOD-product-process.md does not name it in its uses. The draft for akmaier adds it. This item waits
for that acceptance and for ITM-632, as ITM-615 and ITM-618 did at sprint team1/61.
- **On main now:** `sourcesOf` is built (`src/job-runner/tools.mjs:79`, `b4d8b4722`), and MOD-product-process.md names it
  in its uses (`:39`, `:243`). `processStrategies` is not built:
  `src/product-process/` holds no `strategies.mjs` (MOD-product-process.md:86), and a `decide-gate` job's `gate-inputs` and
  `gate-record` are registered nowhere (the probe of `tests/places-prepare-every-offered-kind.test.mjs` finds them built by no module).
- **Read at its start:** no item adds `processStrategies` to the composers' strategy lists
  (`src/workflow-entries/compose.mjs:233-237`, `src/desktop-shell/compose.mjs:22-26`, `src/prompt-bar/hand-over.mjs:50-51`).
  Whether this item or another registers it is read against those modules' texts when it starts.


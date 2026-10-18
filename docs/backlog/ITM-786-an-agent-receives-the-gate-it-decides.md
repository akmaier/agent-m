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

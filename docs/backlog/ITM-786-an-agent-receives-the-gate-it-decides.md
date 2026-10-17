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

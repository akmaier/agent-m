---
id: ITM-609
title: The planned grid of requirements and phases
level: module
realises:
  - A PLAN COVERS THE WHOLE SPECIFICATION
modules:
  - MOD-model-catalogue
builds_on:
  - ITM-215
tests:
  - unit
origin:
  - MOD-model-catalogue, Interfaces: planGrid
  - ITM-215 and tests/model-catalogue.test.mjs explicitly leave planGrid outside catalogue loading
---
# ITM-609 The planned grid of requirements and phases

**REGISTER**

## Outcome

Implement the accepted pure interface planGrid(requirements: string[], model: Model) ->
{ entries: Array<{ requirement: string, phase: string }>, count: string } of MOD-model-catalogue.
For a planned model, return every supplied accepted requirement once in every model phase and the
human-readable count in the contract's form: N requirements × P phases = N*P plan entries. With no
requirements there are no entries; for a pulled model report the accepted NotPlanned error.

Only src/model-catalogue/ and new owned unit tests naming MOD-model-catalogue change. Use the existing
Model and result shape; the accepted Parts already places this responsibility in plan.mjs. Do not change
catalogue loading, model validation, schemas, shipped model/practice data, modelDiagram, TLA, a plan writer,
or page integration. Do not introduce a new public type or interface. Existing expected results change:
none. Preserve the existing model-catalogue tests, including TST-472408 and TST-472409: no shipped model
names are hardcoded into module code and catalogue reads remain as specified.

One responsibility stays in its existing module, using the supplied model instead of duplicating model
data; no caller integration is built without a selected need (AGENTS.md section 2: one responsibility,
nothing twice, YAGNI/KISS).

## Acceptance

- Public calls with literal requirement and phase fixtures give every required pair once, the stated count,
  the empty-requirement result, and NotPlanned for a pulled model.
- Expected results are written in the test, not derived from a requirements document, model file, or production helper.
- The normal implementation-job tests-first and counter-proof requirements apply; no extra release case is selected.

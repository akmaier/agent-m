---
id: ITM-630
title: The process model as Mermaid
level: module
realises:
  - UC-031
  - THE MODEL DETERMINES THE PHASES AND THE GATES
modules:
  - MOD-model-catalogue
builds_on:
  - ITM-215
tests:
  - unit
origin:
  - MOD-model-catalogue, Interfaces modelDiagram
  - UC-031, the live diagram of phases, verification pairs and gates
---
# ITM-630 The process model as Mermaid

**REGISTER**

## Outcome

Implement the accepted public modelDiagram(model: Model) -> string of MOD-model-catalogue: Mermaid text
representing the supplied model's phases, transitions, verification pairs and gates. Planned and pulled
models use their supplied data, not model-name-specific code paths. Transition endpoints and kinds,
verification-pair endpoints and gate endpoints, artifacts, conditions and deciders remain visible in
the diagram's meaning. No additional serialization or exact layout is prescribed.

This is the existing diagram.mjs responsibility, exported by the module's public index. It adds no
public type or interface. Only src/model-catalogue/ and new owned unit tests naming MOD-model-catalogue
change. Catalogue loading, validation, schemas, shipped model and practice data, planGrid, TLA, page
integration and writers are outside this item. Existing expected-result changes: none. Preserve all
old case bodies and assertions, including planGrid's cases and TST-554001's no-code-read expectation;
the ITM-538 source and six branch-privacy cases are untouched.

## Acceptance

- Unit cases reach the public interface with valid planned and pulled Model inputs, first showing
  the existing catalogue and validation as positive controls. Literal inputs and expected facts are
  stated before execution; no expected result is obtained from runtime document text or implementation.
- The Mermaid text represents every supplied phase and transition, each verification pair and each
  gate with its endpoints and stated artifacts, condition and role/check decider. Distinct literal
  fixtures exercise sequence, alternative and back transitions, and changes to the supplied facts
  change those represented facts without a model-name-specific implementation.
- Tests check semantic facts rather than demanding an undocumented node-id, ordering or layout.
  Existing assertions and expected results remain unchanged; no existing case is duplicated or
  relabelled as an independent release test.
- The implementation job follows the existing tests-first job rules: a tests-only first commit with
  an actual intended CI failure, then source assignment; every new case has the actual source-fault
  counter-proof, failure at its assertion and exact restoration required by the SPEC. Existing CI stays green.
- Only the selected module's source and its owned unit tests change. No SPEC, use case, architecture,
  process, workflow, dependency, model data or other module changes; no whole-UC completion is claimed.

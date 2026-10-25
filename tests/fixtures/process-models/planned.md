---
name: fixture-planned
kind: planned
measure: plan entries per phase
---
# A planned model — fixture

A complete model definition of MOD-model-catalogue's schema (src/model-catalogue/model.schema.md), for
tests/test_model_validation.py and tests/test_gate_definition.py. The whole accepted specification runs through every phase; each decomposition step is
paired with the phase that verifies it. No flow control: a planned model has no backlog to pull from.

## Phases

| Name | Role | Produces |
|---|---|---|
| Concept | Owner | requirements |
| Design | Architect | ARC, MOD (the module files) |
| Implementation | Builders | MOD (the code), TST |
| Testing | Tester | TST (system tests) |
| Acceptance | Owner | — |

## Transitions

| From | To | Kind |
|---|---|---|
| Concept | Design | sequence |
| Design | Implementation | sequence |
| Implementation | Testing | sequence |
| Testing | Implementation | back |
| Testing | Acceptance | sequence |

## Verification pairs

| Phase | Checked by |
|---|---|
| Concept | Acceptance |
| Design | Testing |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Design → Implementation | the requirements, an ARC for each, and the MOD files | the design is accepted | Architect |
| Testing → Acceptance | the TST of the requirements | every test is green | check: system-tests |

## Roles

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Owner | person | one | read the repository, write to the repository |
| Architect | either | several | draft text, read the repository, write to the repository |
| Builders | agent | several | read the repository, write to the repository, run code and tests |
| Tester | either | several | read the repository, run code and tests |

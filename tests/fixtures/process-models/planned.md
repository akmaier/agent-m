---
name: fixture-planned
kind: planned
measure: plan entries per phase
---
# A planned model — fixture

A complete model definition in the format of ARC-019 decision 1, for tests/test_model_validation.py and
tests/test_gate_definition.py. The whole accepted specification runs through every phase; each decomposition step is
paired with the phase that verifies it. No flow control: a planned model has no backlog to pull from.

## Phases

| Name | Role | Produces |
|---|---|---|
| Concept | Owner | requirements |
| Design | Architect | ARC-, MOD- |
| Implementation | Builders | code, TST |
| Testing | Tester | TST (system tests) |
| Acceptance | Owner | a record of the acceptance |

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
| Design → Implementation | an ARC- for every requirement, and the MOD- files | the design is accepted | Architect |
| Testing → Acceptance | the TST of every requirement | every test is green | CI check `system-tests` |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Owner | person | read the repository, write to the repository |
| Architect | either | draft text, read the repository, write to the repository |
| Builders | agent | read the repository, write to the repository, run code and tests |
| Tester | either | read the repository, run code and tests |

---
name: fixture-v-model
kind: planned
measure: plan entries per phase
---
# A planned model — fixture

A complete model definition in the format of ARC-019 decision 1, for the tests of MOD-work-items: a planned model works
from its plan, not from a backlog, so a job without a backlog item is not refused for want of one. No flow control.

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

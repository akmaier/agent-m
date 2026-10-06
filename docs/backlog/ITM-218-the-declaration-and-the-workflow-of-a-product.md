---
id: ITM-218
title: The declaration and the workflow of a product
level: module
realises:
  - UC-002
  - THE PROCESS MODEL IS DECLARED PER PRODUCT
  - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - A PROCESS REQUIREMENT ADDS TO THE MODEL
  - A PRACTICE IS NOT A MODEL
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - A PRODUCT DECLARES ITS DEFINITION OF DONE
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
  - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET
modules:
  - MOD-product-process
builds_on:
  - ITM-214
  - ITM-215
  - ITM-216
  - ITM-217
  - ITM-227
tests:
  - unit
origin:
  - UC-002
---
# ITM-218 The declaration and the workflow of a product

**REGISTER**

## Outcome

MOD-product-process' interface, as its file states it, for UC-002: `Workflow`, `declarationSchema` —
`declaration.schema.md` —, `declarationFindings` and `workflowOf`, in `src/product-process/`. Gates, their records and
decisions, the Definition-of-Done check of a pull request and `processStrategies` are not part of this item.

## Acceptance

- Unit tests that name MOD-product-process state, before the code exists, for a fixture product: a declaration read by its schema, and each finding `declarationFindings` names against the `Catalogue` at the commit
the declaration's `model_version` names — a model that catalogue does not hold at `model_file`, or whose findings in it
hold an error, a role that needs a person and has none, a holder lacking a capability, a practice the catalogue does not
hold or whose `fits` does not name the model, a branch for a phase the model lacks, a gate whose requirement the SPEC
does not hold, a holder at a place a linked source does not permit —; `workflowOf` giving the model's phases,
transitions, pairs and gates, the practices' additions and the gates the process requirements add, each with its
requirement and source, and nothing else; and the job rules as the Definition of Done when the declaration adds none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/product-process/` and the tests that name MOD-product-process change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

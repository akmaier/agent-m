---
id: ITM-369
title: Specification and design together, for the kinds that draft their artifacts
level: subsystem
realises:
  - UC-007
  - UC-019
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES
modules:
  - MOD-approvals
  - MOD-spec-changes
  - MOD-artifact-edits
integrates: ARC-041
builds_on:
  - ITM-332
  - ITM-336
  - ITM-337
  - ITM-338
  - ITM-328
  - ITM-330
  - ITM-329
  - ITM-387
tests:
  - component
origin:
  - UC-007
  - UC-019
  - ARC-041
---
# ITM-369 Specification and design together, for the kinds that draft their artifacts

**REGISTER**

## Outcome

Component tests of the strategies with which Specification and design drafts its artifacts: `derive-use-cases`,
`change-use-case` and `change-requirements` prepared and run through MOD-job-runner with the three modules' strategies,
the source register's chapters and the built-in checks registered, `candidate-classes` among them (ITM-387), a fixture
participant and a fixture repository host. A fault the tests find is fixed in the folder of the module it names.

## Acceptance

- Component tests run each kind from preparation to its writer's commit, with the parts each recipe gives, the
  candidates classed against the artifacts the parts carry, a finding sent back and fixed, and the provenance lines on
  the commit; each states its input, precondition and expected result readable without running it.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only the tests that name MOD-approvals, MOD-spec-changes or MOD-artifact-edits change, and, for a fault a test finds,
  the folder of the module it names.

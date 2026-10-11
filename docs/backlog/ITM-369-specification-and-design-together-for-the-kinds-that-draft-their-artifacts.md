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
the source register's chapters and the built-in checks registered, a fixture participant and a fixture repository host.
The check `candidate-classes`, which two of these kinds name and the runner does not register, is stood in by a fixture
check of that name. A fault the tests find is fixed in the folder of the module it names.

## Acceptance

- Component tests that name the three modules state, before they run: a drafted use case naming an unknown requirement
  sent back once and written open under the next identifier after its correction; a drafted change of an existing use
  case written into its file; a changed requirement held for the person's *Save* and then written as a queue entry
  beside its section, `SPEC.md` byte-identical; the provenance lines of each commit.
- Every new test's counter-proof is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only the folders of the three modules and the tests that name them change.

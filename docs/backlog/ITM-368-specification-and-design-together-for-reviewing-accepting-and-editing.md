---
id: ITM-368
title: Specification and design together, for reviewing, accepting and editing
level: subsystem
realises:
  - UC-006
  - UC-008
  - UC-018
  - STATUS IS DERIVED FROM THE RECORDS
  - AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL
  - A STALE APPROVAL IS NOT APPLIED
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
modules:
  - MOD-approvals
  - MOD-spec-changes
  - MOD-artifact-edits
integrates: ARC-041
builds_on:
  - ITM-333
  - ITM-334
  - ITM-335
  - ITM-339
  - ITM-340
  - ITM-341
tests:
  - component
origin:
  - ARC-041, its offered interface
  - the postconditions of UC-006, UC-008 and UC-018
---
# ITM-368 Specification and design together, for reviewing, accepting and editing

**REGISTER**

## Outcome

Component tests of the interface ARC-041 offers, with its three modules together, against a fixture repository behind a
fake repository host: a requirement edit proposed (`proposeSection`), shown (`entryView`) and accepted
(`acceptEntries`), after which the SPEC holds exactly the proposal, and `applyApproved` writes the same bytes for a
record committed without the dashboard; a use case saved (`saveFile`) and then changed, and once accepted
(`acceptShown`) accepted with the saved text as its last accepted text; a save or an acceptance on a text that moved
meanwhile refused across the modules. A fault such a test finds is fixed in the module it names.

## Acceptance

- Each component test states its input, its precondition and its expected result before it runs, and names the module
  it exercises and what it guards.
- Every new test's counter-proof is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only the folders of the three modules and the tests that name them change.

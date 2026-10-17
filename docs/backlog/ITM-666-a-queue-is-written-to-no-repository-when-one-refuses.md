---
id: ITM-666
title: A queue is written to no repository when one refuses
level: module
realises:
  - A GENERATED ARTIFACT IS A PROPOSAL
modules:
  - MOD-spec-changes
builds_on:
  - ITM-636
tests:
  - unit
origin:
  - ITM-636's gate on pull request #707 (docs/gates/20261017-0814-development-release-testing-4a9c.md), from developer-sonnet-a's finding
---
# ITM-666 A queue is written to no repository when one refuses

**REGISTER**

## Outcome

The writer `queue-entries` writes a queue to the product's repository and to the instance's. Since ITM-636 it composes
both before the first commit, so a `TwoChanges` writes nothing. Other refusals of the second repository still come after
the first is committed: `RationaleInvalid`, `NoHost` and `Moved`. They leave the first repository's queue written and the
second's not. Every refusal it can know before writing is checked for both repositories before the first commit.

## Acceptance

- A refusal of the second repository that can be known before writing leaves neither repository written.
- Its counter-proof: the per-repository order planted back writes the first repository and fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

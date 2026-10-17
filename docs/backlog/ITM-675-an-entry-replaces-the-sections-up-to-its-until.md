---
id: ITM-675
title: An entry replaces the sections up to its until
level: module
realises:
  - A QUEUE IS ACCEPTED IN ITS ORDER
modules:
  - MOD-spec-changes
builds_on:
tests:
  - unit
origin:
  - ITM-648's gate on pull request #715 (docs/gates/20261017-0930-development-release-testing-91e4.md), from developer-sonnet-d's finding
---
# ITM-675 An entry replaces the sections up to its until

**REGISTER**

## Outcome

An entry's `until` (MOD-spec-changes, `Queue`: "`anchor`, `until`") is the heading before which its proposal ends.
`queues` and `entryView` read an entry's span by its anchor alone and ignore `until`, so an entry that replaces several
sections is shown as replacing one, and its impact misses the requirements of the others. Which functions read the
span, and how `acceptEntries` already reads `until`, is read at the start, so that one reading serves all (nothing
twice).

## Acceptance

- An entry with an `until` is read as spanning every section from its anchor up to `until`, and its impact names their requirements.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

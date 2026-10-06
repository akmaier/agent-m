---
id: ITM-231
title: A holder's capabilities and place among the declaration's findings
level: module
realises:
  - UC-002
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
modules:
  - MOD-product-process
builds_on:
  - ITM-218
  - ITM-230
tests:
  - unit
origin:
  - UC-002
---
# ITM-231 A holder's capabilities and place among the declaration's findings

**REGISTER**

## Outcome

The two findings of `declarationFindings` that ITM-218 left out, as MOD-product-process' file states them, in
`src/product-process/`, through MOD-participant-list's `eligible` over the participants its reader gives (ITM-230):
- an error: a holder that lacks a capability its role needs, naming it;
- a warning: a holder at a processing place a linked source does not permit, naming the source and the role.

A place is judged only for a holder that declares one. A person is judged by capabilities alone: MOD-participant-list's
file calls a person no driver of a job, and the warning concerns "a holder at a processing place". `sources` are the
linked entries the caller gives. The item waits for akmaier's decision on part 1 of the change request in sprint 06's
record.

## Acceptance

- Unit tests that name MOD-product-process state, before the code changes, for a fixture product:
  - a holder lacking a capability its role needs, named with the capability;
  - a holder at a place a linked restricted source does not permit, warned of with the source and the role;
  - a person holding a role while the same source is linked, not warned of.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- An existing test whose fixture now yields one of these findings changes with it, named in the pull request with the
  expected result it changes. Every other test stays green with no expected result changed.
- Only `src/product-process/` and the tests that name MOD-product-process change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

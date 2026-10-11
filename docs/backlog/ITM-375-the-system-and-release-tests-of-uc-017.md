---
id: ITM-375
title: The system and release tests of UC-017
level: system
realises:
  - UC-017
modules:
  - MOD-settings-pages
  - MOD-participant-list
  - MOD-bridge-client
  - MOD-bridge-jobs
  - MOD-agent-processes
builds_on:
  - ITM-326
  - ITM-349
  - ITM-352
  - ITM-353
  - ITM-354
  - ITM-405
tests:
  - system
  - release
origin:
  - UC-017
---
# ITM-375 The system and release tests of UC-017

**REGISTER**

## Outcome

UC-017 checked as a whole through the participants page, once ITM-352, ITM-353 and ITM-354 and the change between jobs
by which the dashboard reaches MOD-settings-pages' route `participants` are merged: a system test that walks the main
flow for each type — a CLI agent by the Bridge it runs on, chosen among this browser's Bridges, and one of the agents
that Bridge offers — and the alternative flows 3a, 3b, 5a, 6a and 7a, with GitHub replaced by a fixture server and the
Bridges by their handlers with fixture agent executables; and release tests, one or more for each requirement UC-017
realises. A self-hosted runner's explanation on the page is part of it; its refusal for a public product's job is tested
with `routesFor` (ITM-318). The tests are written by a Developer who implemented none of ITM-320, ITM-324, ITM-326,
ITM-349, ITM-352, ITM-353 and ITM-354, nor that change (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-017 realises has a release test, and the system test walks the main flow and each alternative
  flow named; each test states its input, precondition and expected result where they can be read without running it,
  and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the page and UC-017 disagree, the test follows UC-017 and the disagreement is named as a finding.
- Only new test files change.

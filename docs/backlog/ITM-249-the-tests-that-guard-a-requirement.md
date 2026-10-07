---
id: ITM-249
title: The tests that guard a requirement
level: module
realises:
  - UC-013
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
modules:
  - MOD-trace-graph
builds_on:
  - ITM-248
tests:
  - unit
origin:
  - UC-013
---
# ITM-249 The tests that guard a requirement

**REGISTER**

## Outcome

MOD-trace-graph's `TextSource`, `Graph`, `Traces`, `traceGraph` and `tracesTo`, as its file states them, in
`src/trace-graph/`, as far as the release test report needs them: `traceGraph` reads, of the files its Data lists,
`SPEC.md` through MOD-spec-document and the test files through MOD-test-document, so that its graph holds every
requirement and every test with what it guards, and lists a file it cannot read with the reason; `tracesTo` gives a
requirement the tests that guard it. The release test report names every requirement with the tests that guard it by
them (MOD-release-evidence). The other files of its Data, the checks across artifacts and every other derivation are not
part of this item. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-trace-graph state, before the code exists, on a fixture repository: the requirements of its
  `SPEC.md` and the tests of its test files as nodes, with an edge `guards` from each test to what it guards; a file that
  cannot be read listed in `unread` with the reason; the tests that guard a requirement, and none for a requirement that
  no test guards.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS
  MODULES`).

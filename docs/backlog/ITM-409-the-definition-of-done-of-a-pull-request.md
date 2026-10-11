---
id: ITM-409
title: The Definition of Done of a pull request
level: module
realises:
  - UC-034
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST
  - A REFACTORING JOB BEGINS WITHOUT A FAILING TEST
  - A REFACTORING JOB CHANGES NO EXPECTED RESULT
  - AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
modules:
  - MOD-product-process
builds_on:
  - ITM-296
tests:
  - unit
origin:
  - UC-034
  - MOD-product-process, Interfaces: doneCheck
---
# ITM-409 The Definition of Done of a pull request

**REGISTER**

## Outcome

MOD-product-process' `doneCheck(facts, workflow, modules, gates, job)`, as its file states it: every condition of the
product's Definition of Done the pull request does not meet, as findings, empty when it holds — the job rules: CI green;
the first commit only tests with CI red on it, or for a refactoring job CI green on every commit and no test's expected
result changed; every changed code file in the folder of one of the job's modules; every new test naming a requirement
and a module; every gate before the merge recorded —, and the conditions the declaration adds. `facts` are
MOD-repository-hosts' pull-request facts (ITM-296). The entry `onDoneCheck` that runs it in CI is not part of this item.

## Acceptance

- Unit tests that name MOD-product-process state, before the code exists, with fixture pull-request facts: a pull
  request meeting every rule passing; each rule broken alone giving its finding; a refactoring job with a red commit and
  one that changes an asserted value refused; a declared added condition checked.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/product-process/` and the tests that name MOD-product-process change.

---
id: ITM-365
title: The job workflow's entries that take and run a job
level: subsystem
realises:
  - UC-010
  - ONE DEFINITION, THREE DRIVERS
  - A RUNTIME IS INTERCHANGEABLE
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - NO SECRET IN THE REPOSITORY
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
modules:
  - MOD-workflow-entries
integrates: ARC-039
builds_on:
  - ITM-364
  - ITM-312
  - ITM-321
  - ITM-316
  - ITM-317
  - ITM-322
tests:
  - component
origin:
  - UC-010 steps 1 to 4, 3a
---
# ITM-365 The job workflow's entries that take and run a job

**REGISTER**

## Outcome

MOD-workflow-entries' `product.mjs`, with the product's part of `main.mjs` and `compose.mjs` that ITM-364 began, as its
file states them, for the entries of UC-010. `CiEnvironment` is read from the CI's environment; a secret that is missing
ends the entry at once, `not run`, naming it, before anything is written (UC-010 3a). The product's and the instance's
checkouts are connected through the local clone (ITM-312) with the person's token from `AGENT_M_TOKEN`, every secret's
value given as a secret no commit may hold; the participants and the declaration are read; the strategies of the modules
that offer them when this item is built are registered. `onRecordsChanged` takes each queued job whose route is this CI
service (ITM-317) and runs it from its record alone — kind, parameters, pinned inputs — with its participant's driver,
an endpoint (ITM-316) or a coding agent (ITM-321), and its key from its secret, unattended: its kind's writer writes at
once, open, and its end is appended. `onDispatch` writes the start record from the inputs given on the server's own page
and runs it the same way. Resuming after a gate, a kind that names gate points, the runs' next actions, `onDoneCheck`,
`onPullRequestClosed`, `onCheckCompleted`, `onSchedule` and `onTestsFinished` are not part of this item.

## Acceptance

- Component tests that run the entries in Node in a temporary checkout of a bare product repository and of the
  instance, with a fixture endpoint answering constructed replies and the strategies a fixture registers: a queued job
  of the CI route taken, run and ended with its results, its artifacts committed open on the default branch; a job of
  another route left alone; a missing secret ending the entry `not run`, naming the secret, with nothing written; a
  start from the server's page giving its start record and its run; no commit holding a secret's value. Nothing
  reaches a real network.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.

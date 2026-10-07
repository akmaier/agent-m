---
id: ITM-253
title: A job queued on CI
level: module
realises:
  - UC-013
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-runtimes
builds_on:
  - ITM-252
tests:
  - unit
origin:
  - UC-013
---
# ITM-253 A job queued on CI

**REGISTER**

## Outcome

MOD-runtimes' `Route` and `queueJob`, as its file states them, in `src/runtimes/`, for the CI route: the job's start
record committed on the head that was read, as the person's commit, whose push starts the product's job workflow;
`WorkflowMissing`, naming the files, for a product without Agent M's job workflow; and the failures the host names — the
branch moved, a refused token, a used-up rate limit. The complete run of a release candidate is queued with it
(MOD-release-evidence). The tab's and the Bridge's routes, a job of a run, and running, following, cancelling and retrying
a job are UC-010's, UC-011's and UC-036's and not part of this item. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-runtimes state, before the code exists, with the host replaced by a fake: the start record
  committed at its path on the head that was read, in one commit; a moved head refused, with nothing written;
  `WorkflowMissing` naming the job workflow's files for a product without them; the host's failures by name.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/runtimes/` and the tests that name MOD-runtimes change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

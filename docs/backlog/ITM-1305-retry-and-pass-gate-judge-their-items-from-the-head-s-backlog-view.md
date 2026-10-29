---
id: ITM-1305
title: Retry and Pass gate judge their items from the head's backlog view
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-main-page
builds_on:
  - ITM-1264
tests:
  - component
origin:
  - developer-opus-e's stop on ITM-1264 (PR #1415), and po-opus-c's ruling, docs/backlog/sprints/team1/113.md, "ITM-1264's stop"
---
# ITM-1305 Retry and Pass gate judge their items from the head's backlog view

**REGISTER**

## Outcome

*Retry* (`src/main-page/jobs.mjs:338`) and *Pass gate* (`jobs.mjs:440`) on the job page read the whole scope `work` to
judge one or two items: `facts.plan.states`, `facts.held`, `facts.assignments`, `facts.sprints`, `facts.participants`,
`facts.workflow` and `facts.snapshot`. MOD-main-page's job interface says they "read besides only the declaration, the
declared model's file and the role assignments", beside the head's backlog view.

To read those without the scope `work`, the page needs:
- `MOD-documents.readDocument`;
- `MOD-participant-list.participantSchema` and `participantsOf`;
- `MOD-product-process.declarationSchema`, `roleAssignmentSchema`, and `workflowOf` or `productWorkflow`.

MOD-main-page's Uses name none of them (MOD-main-page.md:26-35 name `productFacts`, `storedView`, `mayDecide` and
`recordGateDecision` among others). TST-106805 refuses such an import (run 40836149164 on `bcd05b1a`).

## Not ready: a draft for akmaier

A draft of MOD-main-page.md names these functions among its Uses, each with what it is read for. This item is built once
the draft is accepted.

## Acceptance

- Once the draft is accepted, `tests/main-page-job-stored-view.test.mjs` (MOD-main-page, component):
  - the page of a failed job offers *Retry* with the holders that `tests/main-page-job-retry.test.mjs` expects;
  - that of a job waiting at a gate offers *Pass gate* for the role's holder, as `tests/main-page-job-gate.test.mjs`
    expects;
  - each reads one file of `overview-cache`, and no file under `docs/gates/` or `docs/jobs/` other than the job's own
    record.
  - Counter-proof: with the head's view not stored, neither is offered, and the page says why.
- The first commit holds only the tests, and CI is red on it.
- Only `src/main-page/` and the tests that name MOD-main-page change.
- Tests of other modules this Outcome changes: none known; to be named before selection.

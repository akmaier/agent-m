---
id: ITM-295
title: Derived item states and every reason a job cannot start
level: module
realises:
  - UC-002
  - UC-032
  - STATUS IS DERIVED FROM THE RECORDS
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
modules:
  - MOD-work-plans
builds_on:
  - ITM-209
  - ITM-292
tests:
  - unit
origin:
  - UC-002
  - UC-032
---
# ITM-295 Derived item states and every reason a job cannot start

**REGISTER**

## Outcome

Implement exactly MOD-work-plans' accepted public itemStates and startable, with ItemState in the accepted shape.
Derive states in the supplied order from Document items/order, approval statuses, queues, JobRows, supplied
PullRequests or "unknown", workflow and gate states. No state is stored and no repository is fetched here.
Use the delivered MOD-product-process public role/gate interfaces and supplied declaration, sprint and participant
records. Both functions are ready on controlled accepted inputs independently of live pull-request collection.

Name every accepted state and start refusal: acceptance and changed/withdrawn requirements, unfinished prerequisites,
running jobs/open requests including review, failed/person-waiting jobs, merged requests, unknown request facts,
phase gates, selection, WIP and implementing role holders with the role's needs. Preserve the accepted ItemState
fields, result shapes and reasons; a ready item can still be refused by startable's current context.

This is one MOD-work-plans source scope. Existing backlogOrder remains unchanged. Plan/sprint schemas, save/findings/
strategies, public dashboard composition, doneCheck, job scheduling/execution and continuation after author Save are
separate outcomes. The bounded producer does not deliver the whole UC002 postcondition.

## Acceptance

- Public module cases consume original accepted Document/JobRow/PullRequest/Workflow/Participant shapes and the
  existing public declaration/workflow/gate APIs. They establish known ready/startable positives before refusal and
  unknown cases, derive every accepted item state in supplied order and name every accepted reason a start is refused.
- Waiting review still occupies WIP. Missing/unread request facts are not guessed; gate/role/dependency/acceptance
  reasons identify the relevant record. Changed inputs change derived results without a stored state or network write.
- Existing backlog-order schema cases keep their expectations. Only src/work-plans/ and tests naming MOD-work-plans
  change; no prerequisite module, caller, accepted document or process declaration is authored.
- The implementation job's first commit contains only tests and its own product CI is red before source is written.
  Final numeric canonical declarations, relevant guarded-code fault/SAME-case failure/exact restoration/SAME-case
  pass, complete exact-head Ubuntu CI within each job's 120-second bound and independent gates follow the declared
  process. No additional per-assertion fault quota is imposed.

---
id: ITM-292
title: The process role and gate reading foundation
level: module
realises:
  - UC-002
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - A GATE NAMES WHO DECIDES IT
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
  - THE GATE IS RECORDED
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-product-process
builds_on:
  - ITM-218
  - ITM-231
  - ITM-281
tests:
  - unit
origin:
  - UC-002
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
---
# ITM-292 The process role and gate reading foundation

**REGISTER**

## Outcome

Implement exactly MOD-product-process's accepted holdsRole, gateSchema with gate-record.schema.md, gateStates and
mayDecide through its public index.mjs. These are necessary bottom-up producers for MOD-work-plans.startable and
itemStates and the model-governed continuation after UC002's saved declaration. They use the already-delivered
Document/schema and declaration/workflow inputs; no missing job-runner strategy or runtime continuation is needed.

holdsRole reads the product's actual role assignment. The gate schema reads the accepted once-written record of the
gate, job, decider, role, passed/rejected decision, checked artifact blobs or commit, date and reason. gateStates derives
all the contract's states from the supplied workflow, records and current checked texts: current passed, passed on an
earlier text with its difference, rejected, pending with what it needs, and not reached. No status is persisted. A
record by the wrong decider does not establish a pass. mayDecide admits the named role holder or named automated check
as the workflow permits and refuses someone who did the checked work, with the accepted reasons and holders.

Keep existing declarationFindings, workflowOf, practices, capability/place behavior and author Save unchanged.
No filledBy filter or changed author expectations. recordGateDecision, resumeJob, doneCheck, processStrategies,
work-plans states/saves, planner, job execution, dashboard continuation and restricted-source job delivery remain later
work, ordered after their actual producers. This foundation does not claim the whole UC002 postcondition.

## Acceptance

- Public unit cases state the accepted role-membership results, including absent role/holder and several holders;
  gate-record schema read/write through MOD-documents with every accepted field; all gateStates outcomes against
  concrete current/changed artifact texts; named-role/named-check decisions and each accepted refusal in mayDecide.
- Known positives precede wrong-holder/stale-text negatives. Cases consume the existing public declarationSchema and
  workflowOf with controlled documents/model data, rather than fabricated replacement workflow logic.
- Existing declaration, workflow, practice and author Save cases remain positive without changed expectations.
- New cases have numeric IDs first in actual titles and contiguous lowercase canonical declaration fields, unique in
  the whole repository with real testDeclarations/traceGraph/tracesTo. Every final new case records its relevant
  guarded-code fault, SAME-case failure, exact restoration and SAME-case pass; no extra per-assertion quota.
- The first commit contains only tests, with actual product-red CI read before source implementation. Final exact-head
  complete Ubuntu CI and independent release verification satisfy the declared gates and each job's 120-second bound.
- Only src/product-process/ and new tests naming MOD-product-process change. No strategies, network writer, job
  continuation, caller, accepted document or process declaration is authored under this item.

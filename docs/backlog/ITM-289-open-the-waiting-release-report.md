---
id: ITM-289
title: Open the waiting release report
level: module
realises:
  - UC-013
  - UC-047
  - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
  - THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
modules:
  - MOD-test-pages
builds_on:
  - ITM-239
  - ITM-271
  - ITM-254
  - ITM-256
tests:
  - unit
origin:
  - UC-047
  - UC-013
---
# ITM-289 Open the waiting release report

**REGISTER**

## Outcome

Make the existing release route reopen the actual already-waiting release candidate/report, using the delivered reportsAwaitingAcceptance, job record and candidate/tag/result data through public interfaces. The notification’s actual #release address need not carry a candidate id: resolve the selected product’s pending report at render time. Reconstruct the tested candidate and changelog from its recorded run; show the existing rendered report/levels/rates/requirements and missing outcomes, with Accept and release only as the existing service permits. Reopening creates no candidate/job/commit/tag. With no pending report retain the new-version form; an unreadable/refused pending read names the problem rather than silently offering a new release.

## Acceptance

Controlled actual route cases reopen a done candidate run with its tested commit/report and every original acceptance limitation; opening/refreshing writes nothing. Different products/no pending candidate and incomplete results use the accepted outcomes. Only a person’s explicit existing Accept and release action reaches acceptAndRelease, with reasons and the shown report hash, preserving existing refusal and candidate-start cases. Do not duplicate pending-report detection, notifications, transport or report generation; no real release/tag/human approval occurs.

Own src/test-pages/ and new tests only. Actual dashboard-app addresses notifications to #release but does not yet load testPages: after the module source merge root needs a separately bounded between-jobs public caller composition under a fresh Start. Prove that actual dashboard landing reaches this module/report with the selected product host before claiming UC-047 postconditions or selecting ITM-257. Isolated route evidence alone does not supply that public flow.

## Verification boundary

Only the declared owned source and new module-named tests change. The first writing commit contains only failing new tests with actual red CI; final exact-head complete Linux CI is green, with existing expectations preserved. Each new case has a readable unique numeric TST, level/module/guard declarations, precondition/input/expected result and its actual relevant guarded-code fault, failure and byte-exact-restored positive under SPEC §12. Canonical testDeclarations → traceGraph → tracesTo proves the guards. Independent release writing follows the approved source merge; module readiness, public composition and aggregate release remain distinct.

No local broad/glob/full or native desktop/browser tests, Mac apps, clipboard/focus/settings/device state, personal export, external SSH/webserver or paid service. Explicit controlled nonnative files only; full/native integration runs on GitHub Linux. No SPEC/use-case/architecture/process change or human acceptance is implicit.

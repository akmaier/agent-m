---
gate: Development → Release testing
job: JOB-20261007-2129-d899
decider: po-sol
role: Product Owner
decision: passed
on:
  - f8770ea5e80e75f291615a54e916bf4bc907109d
  - https://github.com/akmaier/agent-m/pull/187
date: 2026-10-07 21:45 UTC
---
# Development → Release testing: corrected dashboard migration

**REGISTER**

## Reason

Passed: merge only this exact corrected head into sprint/09. po-sol implemented none of the migration or tests.
Original developer-terra-b authorship and developer-terra-d continuation remain; the earlier rejected gate187e
is unchanged. This is the current recorded continuation's bounded between-jobs decision, not a claim of complete
historical process compliance or full UC-001 delivery. Scrum Master executes the exact-head merge.

Read the original accepted UC-001/UC-042, module/store/frame contracts, SPEC delegation and job requirements,
Team 2 declaration, live complete PR evidence/history and correction files. Rechecked the original routing/test
scope with the correction: only the unowned adapter and its named component tests differ from rejected a02a0fa.
The adapter now delegates existing Settings methods to public readSetting/writeSetting/clearSetting; no owned
module, SPEC, architecture or unrelated existing assertion changes in this correction.

Failure-node verification: Settings clear listeners at settings-view.mjs:628/686 now reach adapter:104–107/121–124,
which remove the canonical token before calling the legacy clear. Settings Remove at :716 now reaches adapter:136–141,
clearing that token and writing the filtered canonical products list, or removing its empty entry, before legacy
removal. Independently reproduced the previous known-positive → Clear → reload sequence at this exact head: both
canonical and adapter token are now absent, with no legacy resurrection. Removing the GitHub product retains the
GitLab address, token and expiry; removing the latter leaves neither address nor token after reload. A separate
instance's canonical token remains unchanged. Verification uses fabricated values, never a real credential.

Actual tests-only correction33ee7cd0fd12e5801bda87e88bbb44ccc6b54d96 changes only the migration test file. Directly
read red run37690695287: TST-269 retains the canonical GitHub token instead of null and TST-270 retains the canonical
product list instead of null. Fix04dcd16 delegates removal; finalf8770ea adds guards and single-product preservation
without changing earlier expected results. Live final run37691252222 is completed SUCCESS on the exact head,
Node113031702049 and Python113031701732. All six individual executed/restored faults are recorded in the live body:
expiry merge, GitLab discovery, public-route dispatch, synthetic authority guard, missing canonical clear and missing
product-removal override. TST-269/270 have module/guards/component/precondition/input/expected metadata; latest fetched
refs place these new identifiers only in tests/dashboard-product-store-migration.test.mjs.

Independently ran the six migration cases and14 unchanged add-product cases, all20 pass without skip/todo. Ran the
retained dashboard/release suites:147 cases,143 pass,0 fail,0 skip,4 existing TODO findings. UC-042 settings/export/import,
UC-008 acceptance, expiry and Backlog read-only assertions remain exercised; this decision does not erase their
pre-existing recorded TODO limitations. Backlog's before/after storage equality and zero-write assertion remain;
its known initial configuration includes both legacy and canonical token keys after migration. TST-268 observes
synthetic-zero at the real public dashboard route and accepted add-product trusted positives still commit/remember.

The complete between-jobs scope stays within SPEC WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS: dashboard-app and
unowned home call the accepted public settings/store modules; product-store-adapter translates existing callers;
site/views and dashboard/built register the delegated route; app-harness reaches the module DOM; dashboard-shell,
dashboard-review-flows, release-sprint-01 and release-sprint-02-a/b/d plus review-core.d authority/dashboard tests
replace old-route inputs or remove tests of the replaced implementation. Deleted legacy add-product-view and its
separate dashboard/system/release-sprint-04 UC-001 tests are replaced by module coverage and selected independent
ITM-245. Neither src/home nor src/site is an accepted module folder. No unrelated behaviour or check allowlist changes.

JOB-20261007-2129-d899 records this continuation, its inputs/runtime/limit and truthful resume after the rejected gate.
Earlier starts remain unrecorded: this new decision does not retrospectively satisfy that missing evidence, invent
start times or amend old gates. Future job-end/results remain to be appended when observed. This approves corrected
migration into sprint/09 only; main delivery needs its own green exact-head promotion gate and independent ITM-245
remains selected. Sprint09 is open and no architecture/process acceptance is implied.

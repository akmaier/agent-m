---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - b063a7f653be1f6cac378ab1c1b9599e1893a1f4
  - https://github.com/akmaier/agent-m/pull/1288
date: 2026-10-21 20:31 UTC
---
## Reason

ITM-1175 passes on this exact head under JOB-20261021-2004-a18f. Independent po-sol authored none
of its Source, tests or proof executions. Original Start/Source assignments, published Selection and
refined1175 REGISTER, relevant accepted ProgressMeasures/WorkflowEntries contracts, process/DoD,
SPEC/original readings, existing callers/tests, full PR description/commits/diff and actual evidence were read.
The separate PO planning refinement is not Source/test/proof authorship or formal acceptance.

Fresh native Host.pullRequestFacts at2026-10-21T20:30:38.426Z gives exactb063 headCI success and all23
required head checks success. Automatic39669145196 succeeded without a new PO run. First724906d90e53d9a64a51a52f4441c5cdd1914211
contains only tests and has actual CI failure; corrected tests-only2dd5cb1f072496aec9984646f3171ae8463818cd
also failed. Actual39666210788/node6 job119451823358 fails001 at raw work: ITM1000 waiting for acceptance
instead of done, with existing ITM001 done and missing-rule1001 still blocked. The loop stops at that first
variant.002's earlier configuration-pattern/manual-fetch method was incomplete, not native component proof.

All six changed files are within the two assigned modules and precise old-test boundary:
- src/progress-measures/facts.mjs: internal acceptance context combines actual SPEC names and reviewed
  statuses for itemStates, in all/work/build and stored/raw paths; public Facts.statuses remains unchanged.
  Unstored SPEC is prefetched through readMany before read; known/stored text is reused, not read twice.
  Empty reviewed approvals do not skip accepted rules. Public scope-excluded fields remain unknown.
- .github/workflows/main-changed.yml: WorkflowEntries' named platform file fetches existing test-results
  before onMainChanged; genuine absence stays absent and non-absence failures propagate. No empty result
  branch, cache/schema/public API, extra producer, trigger or permission change.
- tests/progress-measures-product-facts.test.mjs: new unit1175001 covers positive/missing inputs, both
  storage paths, all three scopes and no accepted reviewed-file entries; literal expectations precede execution.
- tests/workflow-entries-main-changed.test.mjs: new component1175002 actually executes the owned workflow
  run block in its native git fixture, then runEntry and the stored Tests share1/detail. It executes absence
  and inaccessible-origin branches too. The fixture declaration has actual newlines. No helper modification.
- tests/progress-measures-batches.test.mjs: only826002/003's published expected counts/descriptions change
  to17 requests/12 batches10x100+2x1/sole facts-cache single, and1007 requests/1003 singles without a token.
- tests/main-page-progress-no-graph.test.mjs: only873004's build row/description changes to the exact queued
  ITM0001/JOB20261014-0900-0001/null participant/0 elapsed/reachable true. Stages, current stage and250 waits
  remain unchanged. All-scope20/22, no duplicate reads and no work-scope test-file reads remain asserted.

Native declarations001/002 each name one correct module and level, their guarded requirement and literal
inputs/expected result. Actual d61 run39667321530/node0 job119455680145 preserves17vs16/1007vs1006 failures
and all-scope/dedup positives; node4 job119455680318 preserves the queued-row failure. The later68ee empty-map
bypass and cancelled hook remain history, not justification to weaken those inputs or claim aggregate green.

Both new cases have effective owned-code faults and exact restoration, read from the actual raw captures:
- /private/tmp/itm1175-1175001-fault.json:20:18:23.055-23.407Z, exit1,38 pass/1 fail. Replacing accepted-name
  iteration with[] makes1000 wait for its accepted rule at product-facts.test.mjs:861. Exact restoration
  at20:18:27.277-27.629Z exits0 with39 passes, including raw/stored and empty-reviewed variants.
- /private/tmp/itm1175-1175002-fault.json:20:18:31.642-42.681Z, exit1,9 pass/1 fail. Replacing the workflow
  fetch with: leaves the local branch absent at main-changed.test.mjs:224. Exact restoration at20:18:49.820-
  20:19:02.568Z exits0 with10 passes, including actual stored share, absence and access-error checks.

Actual remote test-results0a38184ae202549402981a19e4236638ab647dfa holds append-only corrected receipts
under runs/b063a7f653be1f6cac378ab1c1b9599e1893a1f4/:2027-on-demand-d64f,2028-on-demand-ff43,
2028-on-demand-152e,2028-on-demand-eaaa and2028-pull-request-ba29 (all with20261021 prefix/.md suffix).
All five new records have schema findings[], bare TST IDs and empty deterministic Runs cells. Fault/local
restoration variants stay uncommitted:true and are read separately; native resultsAt correctly excludes them.
Canonical ba29 records both IDs passed from39669145196; native resultsAt returns passed1/notRun0 for unit
and component. The same reader's correctly keyed1165 records were the positive control for the earlier
not-run finding. Earlier title-valued/Capture-section records remain immutable and are not treated as native
passes or new executions; metadata correction reuses actual captures, not a replay or guessed execution clock.

Exact blobs: facts5bedf80e0a49a78b7faa7fe58ad5a3f9fbdec0e4; workflow936650c2a0d21552e8f0b72a5eb5200956c8bbeb;
product-facts2128de4277ef1f21a878957d755bbd00c0d4d28f; main-changed89608e743568daeebb278cd2708057d386f99bc8;
batches5954b7ce32161218f94abe4937196640a1434c5e; no-graph6c28afbb669f3578cc28a67b86885666fdacf2d1.
Native/remote packet:/private/tmp/agent-m-po108-a18f-1175-evidence-1792614640034.json.
SM publishes this decision unchanged and freshly guards only this exact head before sprint integration.
No merge/default delivery,684 Start, formal acceptance or whole-UC/independent release coverage is asserted.
PO ran no tests/probes/faults and changed no Source/tests/SM closure.1165's initial rejection is separate;
its permitted rework requires a fresh gate assignment and is not decided by this record.

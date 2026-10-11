---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - 05ef5324f36742740af89d22c0f0ee0506c4e8f3
  - https://github.com/akmaier/agent-m/pull/417
date: 2026-10-11T20:26:01Z
---
## Reason

PR417 passes the independent release-battery Source gate for ITM-320/321 under JOB-20261011-2015-e36b. I implemented none of the behavior or tests checked. I personally read the original job, item/contracts/approvals/use cases, current process/model/roles/instructions, public interfaces and working caller, full source participant history, published Source gates/actual deliveries, E's complete receipt and checkpoint, complete PR body/history/new battery and relevant guarding originals. Own completed readings were retained only at verified unchanged identities; current AGENTS92de3725 and SPEC7a309483 remain unchanged. Current Team1/20 selection345396422425426441455456 clears the module conflict rule; Team1/19's actual main merge released its old holds.

The only changed path is new tests/release-itm-320-321-agent-processes.test.mjs, a MOD-agent-processes release battery. Source, existing tests and expected results are unchanged. Both release-only commits cb3d796e and05ef5324 remain present; the first release-only commit need not be red. Complete guarded source-changing commit trailers identify developer-terra-b; E implemented none of that behavior. The four cases have contiguous module/requirement/level and readable given/input/expect declarations. They exercise public installedAgents/testAgent and agentDriver through controlled fixture executables, without private cross-module imports or real vendor/account calls.

The final cases establish registered-agent discovery/harmless public answer, local own-login versus named-key CI with an installed but locally unlogged agent, cancellation before a ready ignoring descendant's delayed write, and the named failure boundary including AgentFailed exitCode/lastOutput. Actual source faults reach those public failure nodes:

| Case | Source/data-flow fault → assertion failure | Exact restoration |
| --- | --- | --- |
| TST-320321901 | index.testAgent success becomes answered:false → public answer assertion test:89 | Same selected case passes |
| TST-320321902 | processes.environmentFor returns inherited environment → local constructed credential appears at test:110 | Same selected case passes |
| TST-320321903 | stop changes group SIGKILL to parent-only SIGTERM → ready descendant writes its marker, exclusion test:141 fails | Same selected case passes |
| TST-320321904 | local login guard returns AgentMissing → AgentNotLoggedIn predicate test:157 fails | Same selected case passes |

I personally read all four complete canonical/raw failure and restored-positive records published on main9fccad59 before this decision. Decoding the original log's TAP payload once matches the saved four proof records. Independent reconstruction verifies unique source needles, fault SHA-256, exact source restoration, unchanged selected test bytes, ordered times/invocations, status1 AssertionError at the named case followed by status0 at the same complete case, and null signals/runtime errors. Source hashes are index a18a520bdfead0399337756da32b2b5f1ede654bd66831cc92153efbc782aace and processes99bf03ba1db5901bda517b31ee240252718e10f84f36b57635369f639d1cd5a4; battery hashdf7fb3a23bc2c82a4e19c6c99a085676ffa6235d10fb9d7a1dc137d1bdcb7fb4. No import/hook failure substitutes for behavioral proof.

Ubuntu CI38171730178 is successful: Node1536 passed, zero failed, eight existing TODO; Python441 successful with existing skips/expected failures. Jobs68/89 seconds are within120. Actual checkout54f5498ae2f246968d346efaf3b1c258d6740e05 has parents08919c27340b99254c74cd9fbd55f1c68985bfdd and the exact candidate; independently verified complete tree2e9b15ba54ada8e7590aadf45b0037ac9746317b equals candidate. Live PR417 is open at05ef5324 with both successful checks. Complete1985 outcomes and13 original proof receipts are immutable at test-results ec2435620d28dfb57461d6af5764ac8a4a93a042, runs/54f5498ae2f246968d346efaf3b1c258d6740e05/20261011-2019-pull-request-95e6.md. I reviewed original checkout pins, selected outcomes, runner totals/status/durations and all four complete new proofs; complete unchanged raw artifacts remain retained, without claiming every log line was personally read.

The late-input finding is retained: two guards already delivered by Team1/19 were omitted before release generation. E read repository-hosts-ci-pages9fa1133 and settings-pages-bridges-by-name1b5e117 after generation and recorded that timing honestly. I personally read both full originals and compared their repository-navigation/Settings Bridge expectations with this bounded public AgentProcesses battery. No accepted expectation or source changed to accommodate that omission. This pass confirms final Acceptance/default DoD evidence, not initial reading-order compliance; source-stage late reads and earlier invalid proof dispositions also remain recorded.

This is selected module release coverage, not whole-use-case, Bridge/window/caller/workflow completion or human artifact acceptance. Windows remains source-reviewed only. Root must publish these exact gate bytes before its independent comment and exact-head merge. Aggregate Release testing → Sprint review is a separate decision after actual release-battery sprint merge.

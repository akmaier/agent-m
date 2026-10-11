---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on: 2a9d5fcf3f35c8c896fbf91d07c256489c2e4039
pr: https://github.com/akmaier/agent-m/pull/401
date: 2026-10-11T20:06:59Z
---
## Reason

ITM-321 passes the independent Source gate under JOB-20261011-1858-05d0. I implemented none of this behavior. I personally read the original item, accepted module/architecture and approvals, affected UC-010/011, public interfaces and working caller, current binding/process/role/instruction inputs, required textbook originals, complete PR description and commit history, all changed files, author receipt/checkpoints and relevant guarding batteries. Retained full originals were verified by unchanged identities; AGENTS is 92de37251471b1211f936b732c0444e6fe7094bc and SPEC is 7a309483c1edbb7f622f8f2b249f08a02863ac30. Current Team1/19 holds do not conflict with MOD-agent-processes or its used Documents, JobRunner and ParticipantList modules.

The first commit eb12adfe9b24b37ca5dc9ad9af58406c551fbd27 contains only the new test battery. Its actual tests-only CI38166881506 and corrected tests-only CI38167499237 were red at the missing public agentDriver export. The four declared cases did not run there; these import failures are not behavioral counter-proofs. All pushed commits remain present. The unpublished metadata correction to 96055662 produced 2a9 with the same parent and complete tree, not a rewrite of pushed history.

Every changed path is in scope: src/agent-processes/index.mjs composes the accepted public Driver with private shared register/parsing/environment helpers; src/agent-processes/processes.mjs implements its process lifecycle; src/agent-processes/agents.md adds owned task/output register data; tests/agent-processes-321.test.mjs is the new module-named unit battery. Existing 320 tests and their expected results remain unchanged. The four new cases declare module, guarded requirements, level and readable given/input/expect descriptions. DRY retains one register/helper implementation; the accepted parts keep one responsibility each; KISS/YAGNI limit the change to the selected Driver.

Public index.agentDriver → private processDriver.send (processes.mjs:85) → local-login-or-CI-key guard (:88) → register task arguments/workdir (:91) → spawn (:46) → stdout forwarding (:66) → reported answer/Usage (:105). The assembled prompt is sent once; usage is reported rather than guessed, with unknown cost/minutes null. Local environment filtering excludes declared credential names before reading retained ordinary values. CI inherits its supplied environment without this module reading, logging or passing a secret value; the installed CI fixture with no saved local login now starts. Named errors retain their required data.

Cancellation follows cancel (:53) → stop (:22) → SIGKILL of the owned detached POSIX group (:26) → owned-child close (:73) → finish awaiting stop (:57) → Cancelled (:99). The strengthened fixture's descendant ignores SIGTERM and confirms readiness before cancellation. It wrote the marker in the retained red CI38169644363; the final exact same marker assertion now passes. Windows uses taskkill /PID /T /F, waits for completion, and rejects spawn/nonzero failures through stopError → AgentFailed before Cancelled. This Windows branch was source-reviewed against the accepted contract and primary taskkill documentation; Ubuntu CI does not measure Windows execution.

Final CI38170185335 is successful on actual checkout 246033e3fecb9b07326ce6d403c7afee3936e21e, parents ee9ac162c75e6476faef35d6fc500647393fbb4b and the exact approved head. Git independently confirms its complete tree 5dad6f816cc7a73f4611ba4875ac79f671392a03 equals the candidate. Node reports 1532 passed, zero failed and eight existing TODO; Python reports 441 successful with existing skips/expected failures. Jobs took 103 and 91 seconds, within 120. Live PR401 remains open at the exact named head with both checks successful.

Complete immutable evidence is test-results d00a48013a3be05a1c73a1d76d1a0e4ae5a13b43, runs/246033e3fecb9b07326ce6d403c7afee3936e21e/20261011-1957-pull-request-db51.md: 1981 outcomes and four original fault receipts. Canonical TST-321001–004 and the final implementation checkpoint were published on main bbc9118c05c9b2608018d0888247acca27e12fdf before this decision. I personally reviewed checkout pins, runner totals/status/durations, selected outcomes and all four complete raw/canonical proofs; the complete unchanged log/result is retained, without claiming every log line was personally read.

| Case | Relevant planted fault and observed assertion | Exact restoration |
| --- | --- | --- |
| TST-321001 | Empty final text; answer assertion at test:138 fails | Same case passes |
| TST-321002 | Local environment exposes inherited constructed credentials; exclusion at test:176 fails | Same case passes |
| TST-321003 | Group SIGKILL becomes parent-only SIGTERM; unchanged marker exclusion at test:219 fails | Same case passes |
| TST-321004 | Local login error becomes AgentMissing; AgentNotLoggedIn predicate at test:237 fails | Same case passes |

I independently decoded the original TAP proof payload once and compared it with the saved full proof JSON. For each case the unique source needle occurs once, the reconstructed fault hash matches the measured fault, failure is status 1 at the same selected AssertionError, exact restoration precedes status 0 at that case, and timestamps/signals/errors agree. Original/restored source SHA-256 is 99bf03ba1db5901bda517b31ee240252718e10f84f36b57635369f639d1cd5a4; test SHA-256 is 01ca3a0d63abaa021d621e8cf4a75e34d9b5edacb564680b612341f70de9ae02. These match the exact candidate bytes. No import or proof-hook failure substitutes for these behavioral failures.

The recorded generation-input deviations remain findings: the initial unsupported UC-017 guard and omitted Settings inputs were corrected after generation, and source3227983f/proof generation preceded the later expanded guarding-body reads. I reviewed those later originals and honest timing receipts; I do not certify that the initial reading order was correct. Earlier missing restored positives and stale fault-target outcomes remain preserved as invalid/partial proofs. The final source, declarations, complete inputs and valid four-case evidence satisfy this item's Acceptance and current default Definition of Done; this pass does not erase the process findings or claim whole-use-case, Bridge/caller/workflow integration or live-vendor completion.

Root must publish these exact gate bytes on main before its independent review comment and exact-head merge. This is only Development → Release testing, with release testing still independent.

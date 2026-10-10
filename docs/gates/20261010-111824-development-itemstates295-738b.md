---
gate: Development → Release testing
job: JOB-20261010-0835-8f4a
decider: po-sol
role: Product Owner
decision: rejected
on: 738b627aa1d9f0280a5841210af7b71af8a4b8af
date: 2026-10-10 11:12:48 UTC
---
# HOLD — ITM-295 supplied-record item states and startability

**MEASUREMENT**

## Reason

PR298 head `738b627aa1d9f0280a5841210af7b71af8a4b8af` against approved Sprint19 base
`7b43f33a3f00780787fb6eb5c39c17401655971f` is held. Its own CI38047118423 is green, but the supplied-record
phase-gate and complete-refusal behavior below does not meet the accepted MOD-work-plans contract.
This is a source gate for selected ITM-295 only. It permits no merge of this head.

## Authority and original read receipt

The original `docs/process-models/scrum-wip.md` gate says: “CI is green on it and the Definition of Done holds”,
with the item's code/TST pull request as its artifact and Product Owner as decider. Original
`docs/process_team2.md` declares: “The job rules hold for every pull request; no condition is added.”
SPEC's `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES` requires green CI, first tests-only red,
assigned modules, new tests naming their requirements/modules, and all pre-merge gates recorded.
SPEC's `A JOB STOPS AT EVERY GATE` says the job waits until its gate decider's decision is recorded.
`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS` applies to this independent decision.

The fresh original review Start `JOB-20261010-1104-a12d`, AGENTS.md, and full original 2135-line SPEC.md were personally
read before actual Taken `2026-10-10 11:07:11 UTC`. Root then assigned fresh
`.agent/worktrees/agent-po-sol-process295-gate-19`, branch `codex/p19-process295-gate`, from published `c2429be`.
The remaining original reads include README; Team2 process/participants and original instance declarations;
Scrum-WIP; current PRIMARY Sprint19, its UC0326a selection, order, ITM295 and implementation Start0835;
full affected UC002/032 and MOD-work-plans/product-process contracts, their exact approval records; original
Document/item/order, Queue, approval-status, JobRow, PullRequest, Participant and Workflow formats;
public work-plans source, existing backlog-order caller/tests, candidate source/tests, delivered public role/gate/workflow
callers and participant/predecessor commit provenance; own first-red logs; earlier and exact-current CI originals;
current canonical metadata caller, whole-tree receipt and original fault/restoration stream.

Exact candidate contract blobs were read and matched their approval records:
MOD-work-plans `f80e3bf00a415e1a2b90169e1761459472dd1653`;
MOD-product-process `457809097e0b31c3c55e18865f42922d9861d67e`;
UC002 `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4`;
UC032 `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc`.
Current PRIMARY planning/selection is read independently of the older planning records on the sprint branch;
those records are not treated as a new selection or an implementation diff.

No source, test, helper, caller, workflow, accepted document, model, process, DoD or selection was authored here.
No local product runtime, test, fault, native/browser/device/OS or user-state interaction was performed.
The findings are deterministic static data-flow reviews at the named nodes, not claims of newly executed failing tests.
Unknown usage/cost: null.

## Failure paths and bounded correction conditions

### 1. The accepted plan-order phase is discarded

MOD-work-plans Data defines a plan order as rows `Step`, `Phase`. Its item documents use MOD-documents' item schema,
whose stated front matter has no `phase`. Its Data requires: “A plan step that waits for the gate before its phase is
`waiting` with that gate named.” The public `itemStates` contract consumes those Documents and supplied gate states.

Exact path: `src/work-plans/states.mjs:12–22` → `orderedItems` reads `row.cells.Step` at17 but discards `row.cells.Phase`
→ `itemStates` at84–85 → `state` at60 → `gateBefore` at33 reads only `item.fields.phase` → empty phase returns null at34
→ state reaches ready at75 when acceptance/prerequisites are met and jobs/requests are empty.
For a valid plan step with an order row `{Step: ITM-295, Phase: Development}` and a pending gate into Development,
actual branch result is ready; expected is waiting with that gate named, followed by a start refusal.
Verification at the failure node is the explicit phase read/early return: no later path recovers the order's Phase.

Known positive is retained: original TST295003 at121–126 and current CI's passing node exercise one pending gate, but
its fixture at45–46 puts `phase: Development` into item fields and at48–49 supplies only an Item order row.
That is not the accepted plan-order phase path. Correct the bounded producer and its public cases to consume the
accepted Step/Phase path without inventing an item schema or changing accepted documents; establish the ready positive
and pending/rejected/stale gate refusals at this actual path in the authorized Ubuntu CI.

### 2. Only the first gate before a phase can block

MOD-product-process Workflow owns an array of gates; public `workflowOf` at candidate `workflow.mjs:97–107` appends
model gates and requirement-added gates. Both may lead into the same phase. SPEC's `A PROCESS REQUIREMENT ADDS TO THE MODEL`
and `A JOB STOPS AT EVERY GATE` require those added gates to remain effective.

Path: supplied workflow gates and gateStates results → `states.mjs:35` uses `.find(candidate.to === phase)`
→ at37 reads only that gate's state → at38 returns null when the first is passed. A second pending/rejected/
passed-on-an-earlier-text gate into that phase is never examined; the ready/allowed path then remains open.
Expected: any applicable unpassed gate refuses starting, naming each relevant gate and its decider.
The single-gate current positive above verifies the comparison direction; the failure node is the first-only selection,
not absence of any gate API. Correct all applicable pre-phase gates using the supplied accepted records, with public
known-positive and refusal verification on the corrected candidate. No new gate or architectural obligation is added.

### 3. Complete refusal reasons and gate deciders are lost

Accepted MOD-work-plans `startable` requires “every reason a job for this step or item cannot start”, naming each
unaccepted requirement/use case, unfinished prerequisite, and “the gate before its phase not recorded, naming it and its
decider”. Its accepted result is `{startable:false,reasons:string[]}`. A ready item can also be refused by current
selection, WIP or role needs.

Path: `states.mjs:54` finds only the first unaccepted artifact and returns at55 before prerequisite/gate evaluation;
57 similarly finds only the first unfinished prerequisite and returns at58; 61 emits only `${gate.name} is not recorded`;
`startable` at101–103 forwards only that one current.reason. Its subsequent selection/WIP/role checks cannot recover
other acceptance/dependency/gate facts already discarded. For an item naming two unaccepted artifacts plus two unfinished
prerequisites and a pending phase gate, the actual result names only the first artifact (plus any independent contextual
selection/WIP/role reasons). Expected: every relevant named refusal, including that gate's decider.
Even the existing passing gate case at124–126 proves the current output's gate name while never asserting its decider;
source61 and startable103 explicitly demonstrate the omitted decider at the failure node.

Correct the information loss within the accepted ItemState fields and startable result shape; retain all required
refusals without storing state or fetching a repository. Public cases must verify simultaneous blockers, multiple named
artifacts/prerequisites and gate deciders, while preserving existing ready/allowed positives and backlog-order expectations.
A bounded correction addresses these accepted conditions; no extra per-assertion fault quota or fixed rework limit is imposed.

## Evidence and what passes already

Scoped `7b43f33..738b627` diff is exactly `src/work-plans/index.mjs` (+5/−3), `src/work-plans/states.mjs` (+120),
and module-named `tests/work-plans-states.test.mjs` (+166). Backlog-order source/schema/tests and their expectations
are unchanged. Public exports exist. Current cases cover single acceptance/open/changed/absent-withdrawn waits,
prerequisite order, open review, failed/person-wait jobs, merged and unknown requests, selection, review WIP and missing
role holder/needs. These positives do not establish the missing accepted phase/refusal paths above.

Own first commit `a86f5d9fedeb45daf4901df54c2bda5b964b75aa` changes only tests (+118).
Original CI38039055126 node log at6979–6988 records public import → ModuleJob._instantiate →
SyntaxError: no export named itemStates; its failed file node is retained. Source follows that own red.
Later candidate source742b406 CI38046772770 passed (Node69s/Python43s), but it is not substituted for current-base CI.

Current [CI38047118423](https://github.com/akmaier/agent-m/actions/runs/38047118423) checks synthetic merge
`0eb454f9333cb4b91a25995ec6f44ced9ef545b3`, parents `[7b43f33,738b627]`, tree
`2c6bc96d8cdb7680d5f21023d191b4c136ff6759`, equal to the exact candidate tree.
Original checkout and API commit metadata independently pin it. Node ran11:04:32–11:05:36 UTC (64s), Python
11:04:32–11:05:28 (56s), both success within120s. Original Node summary:1127 tests/1119 pass/0 fail/8 inherited TODOs; those TODOs remain unfinished and are not passes;
Python396 tests, OK with5 skipped/6 expected failures. Top-level known-positive257001 is ok430;
295001/002/003 are ok1125/1126/1127. Native notification delivery remains human-confirmed.

The original current counter-proof at node log6998 records the isolated production acceptance comparison changed
from accepted to faulted. Same295001/002/003 child cases fail normally (status1, no signal/error), then the exact source
is restored and the same cases pass (status0, no signal/error). Fault11:05:29.482–.603 UTC;
restored11:05:29.604–.722. Named failure nodes are assertions71,89,124: actual waiting for acceptance against expected
ready, ready and waiting. This relevant production fault is retained and accepted as evidence; it is not a demand for
a separate fault for every assertion.
Source original/restored SHA256 `1988bf084274c126a96a9cf81b4a1afe5e3a24ad9adf3d5fa9ddd118b7219dfe`;
fault `c6766bb35bc8f0762d5912e1f92519efe4e55042c21caf5087058082e06019f9`;
test `14270732937618df7d3ae9ffa01861caa48bb322db3cdf377d83b8482a00792b`.
The receipt preserves full argv/cwd/environment/stdout/stderr. Nested TAP doubled backslashes prevent full JSON decoding;
valid header/scalars and raw named nodes were read, with no claim that this makes the proof missing or that secret masking caused it.

Original canonical caller `p19-295-738b-trace.mjs` uses public testDeclarations/traceGraph over2095 tracked paths:
194 declarations,583 nodes,336 edges,duplicateIds[]/unread[]. Known-positive257001 and295001–003 are recognized;
numeric level/module/guard/given/input/expect declarations and derived requirement traces are retained.

Participant independence comes from original provenance, not the shared Git account: new source/tests and base integration
are developer-terra-b/gpt-5.6-terra; prior209 was developer-sonnet-a; delivered292 source developer-terra-c.
Team2 maps Sol/Terra predecessors without erasing authorship. po-sol and its po-opus predecessor authored none of those
implementations or tests. This PO decision does not replace the separate independent Release testing gate.

## Immutable original evidence receipt

All paths below are original local evidence retained by root under `/private/tmp/`; SHA256 pins follow.

|Original|SHA256|
|---|---|
|root-p19-ci-38047118423-api.zip|a2247b65bec06711cd0c3bde8abd1c13dda060cec101cdc214ba0ec45d49e63b|
|root-p19-ci-38047118423-node-api.log|26ac1e185a48c22deaf4f02daadee0557ce17524ed297177d47f4a8fefcd4195|
|root-p19-ci-38047118423-python-api.log|16941d87673d9ffbc061140ddef861af78641afcfcbe5818c109c233584c1269|
|root-p19-ci-38047118423-checkout.log|10a10c6a86a0a19fb8475dab8a01e9763a1da07cc0e1d85679383973735ff8f5|
|root-p19-ci-38047118423.json|33913818314427eeff43307ff1f74b1388b37ae580bcb99e6dc7a2936e969edb|
|root-p19-ci-38047118423-commit.json|4c347203e2f242a41e60b57229d0a7cb621393fe1e4918cd4878d2dcd81141de|
|root-p19-ci-38047118423-295-proof-raw.txt|ac5e7fc66bf86966ec99b271f5891a11854a61079a2c5da3c39a68ab1b5d3940|
|root-p19-ci-38039055126-node-api.log|840c5b8a245319186f71b1fee2825ad4c08813d3ff19849be31738adc4c05a20|
|root-p19-ci-38039055126-failed-nodes-only.txt|cd8882ef798117537caf9dfd99e923805e9270235f420edf03ebc15006a5f455|
|p19-295-738b-trace.mjs|bfa11cf4012e9734f6860908dadff45358eff297637c0e299f3833c1c684c638|
|p19-295-738b-trace-paths.txt|e97d667f1127e840e057d4ca90a68fdb724c662f2bb70f9eb27e27a94d83b675|
|p19-295-738b-trace.raw|7e3fa80ea89e64b92b86c3d6c0a40744ff12ed9c9c1de0ee72fc75c4b88de2c9|
|p19-295-738b-trace.json|8efe0799ba0b9b7e5e2ff8e05cd23cf6fda2c5c91299263bb913e65bce8fb536|

## Consequence

Root publishes this immutable HOLD and returns the bounded correction conditions to the assigned Developer.
A corrected candidate needs its own complete exact-head/base CI, public failure-node verification and a fresh source gate.
Independent Release testing remains necessary afterward. This decision accepts no SPEC/UC/architecture change or release
report and completes neither the whole item nor UC002/032. Those human acceptances remain with akmaier.

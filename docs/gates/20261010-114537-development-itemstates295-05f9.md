---
gate: Development → Release testing
job: JOB-20261010-0835-8f4a
decider: po-sol
role: Product Owner
decision: passed
on: 05f923e7133b8597d682eaf153d19160aafe263f
date: 2026-10-10 11:45:37 UTC
---
# PASS — corrected ITM-295 supplied-record item states and startability

**MEASUREMENT — 2026-10-10 11:45:37 UTC.** Method: independent original-document/exact-blob data-flow review and original current GitHub Ubuntu CI, including actual same-case fault/restoration streams and existing public declaration/trace metadata. No new product runtime or fault experiment was run here.

## Exact decision and boundary

**PASS** for PR298 head `05f923e7133b8597d682eaf153d19160aafe263f` into approved Sprint19 base `7b43f33a3f00780787fb6eb5c39c17401655971f`, [PR298](https://github.com/akmaier/agent-m/pull/298), Development → Release testing only. This permits root's exact source merge after publishing this gate. Independent Release testing, completion of selected295, aggregate and closing gates remain. Whole UC002/032, live fact collection, continuation, job execution, DoD enforcement and any human artifact/release acceptance are not delivered by this decision.

Original `docs/process-models/scrum-wip.md`, Gates: “CI is green on it and the Definition of Done holds”, on the item's code/TST pull request, decided by Product Owner. Original `docs/process_team2.md`, Definition of Done: “The job rules hold for every pull request; no condition is added.” SPEC's `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES` requires green CI, the job's first tests-only red, assigned module source, new tests naming requirements/modules and all gates before merge recorded. `A JOB STOPS AT EVERY GATE` leaves the job waiting until its decider's decision is recorded; `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS` requires this independent decision.

Review job `JOB-20261010-1139-b14f`, po-sol / gpt-6.1-sol. Dedicated actual Taken `2026-10-10 11:41:45 UTC` followed personal original Start/AGENTS reads and unchanged retained-full-read verification, before root supplied fresh `.agent/worktrees/agent-po-sol-itemstates295-corrected-gate-19`, branch `codex/p19-itemstates295-corrected-gate`, from published `b772f6c`. Usage/cost:null. No source/test/helper/caller/workflow/accepted-document/process/selection change was authored here. Root alone publishes, pushes, comments, merges and records End.

## Original read and independence receipt

I personally read the fresh published Start/Taken and original AGENTS. My own earlier full original SPEC/README, full affected UC002/032/work-plans/product-process and supplying format contracts were retained only after verifying their original bytes unchanged c2429be→28f57ab/b772f6c. Twelve retained originals agree, including Documents, Approvals, Spec-changes, Job-ledger, Repository-hosts and Participant-list. I reread the full affected work-plans contract, current item295, implementation Start0835 including actual Gate reached11:36:40, prior immutable HOLD, complete candidate states/index/tests, full base-scoped and correction-scoped diffs, inventory, public workflow/gate/role/approval/job state paths and original CI/proof/metadata. Current PRIMARY declaration, participants, Scrum-WIP, Sprint19/order were personally read or unchanged-byte-verified against my own retained full reads. Current Sprint19 remains eight selected entries, four done and four in progress290/294/295/296; review counts under WIP4,294's independent Release remains. Candidate-era sprint records are not substituted for current primary selection.

Actual approval records and original current contract blobs agree: work-plans `f80e3bf00a415e1a2b90169e1761459472dd1653`, product-process `457809097e0b31c3c55e18865f42922d9861d67e`, UC002 `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4`, UC032 `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc`. Supplying public shapes agree: Document id/fields/sections/row.cells; Item `realises`/`builds_on`; backlog order Item and plan order Step/Phase; approval Map keyed by path with value.id/status; Queue entries; JobRow record.worksOn/state; PullRequest branch/title/state; workflow gates name/to/decider and phase/role/capabilities; declaration Roles rows; Participant name/capabilities. `job-ledger/states.mjs:16–18` turns an unresolved question or gate into “waiting at a gate”; supplied failed/person-wait rows therefore map to blocked. State derivation consumes supplied controlled facts, not an unfinished repository collector.

All33 inventory hash rows were independently checked against original bytes:30 candidate originals match exact05f923e; historical primary Start hash matches `1b7077e7fe381da3c39e0d3b134c8915401e4eb3` before later Gate reached append, item hash matches `f0f338c99c9894644bd4e35e2d66f7a67a986467`, prior HOLD hash matches `0b28c1e784089b8cbcd502710b4d83cd18f508f8`. Current Start/Gate reached is separately pinned below; the historical inventory is retained unchanged.

Original history identifies source/tests/correction/integration as developer-terra-b / gpt-5.6-terra, including05f923e after738b627. Existing209 foundation is developer-sonnet-a; delivered292 producer source is developer-terra-c. Current Team2 predecessor mapping includes Sol↔Opus and Terra↔Sonnet without erasing authorship. Neither po-sol nor po-opus authored guarded source/tests, prerequisite producers or their implementation corrections. The shared Git account is not used to infer participant independence. This review is independent of B; future independent Release remains a separate assignment.

## Concrete correction verification at the prior failure nodes

Original accepted MOD-work-plans Data requires a Step/Phase plan order and a step waiting at its pre-phase gate to be waiting with that gate named. `startable` requires every refusal, including every named unaccepted artifact/unfinished prerequisite and a gate's decider. The prior738b HOLD remains immutable; this is a new finding on corrected05f923e.

1. **Actual plan phase survives.** `states.mjs:17–19` reads Step/Phase into `{item,phase}` →88–89 passes phase to state →55 calls `gatesBefore(phase,...)` →34–37 compares the actual phase. No invented item.fields.phase is required. Public TST295003 fixture51–52 provides real Step/Phase rows;120–122 establishes ready/allowed when both gates pass;127–132 makes the actual Development row wait for a pending gate and refuses starting. This verifies the formerly discarded Phase node through the public interface.

2. **All applicable gates remain effective.** `gatesBefore:36–37` filters every workflow gate with `to===phase`, retaining every supplied non-passed state, including absent/pending/rejected/stale. The delivered public workflow producer retains model gates plus requirement/practice additions; supplied gateStates gives the original accepted names/states. TST295003:127–132 first gate passed/second gate pending is waiting and names Architecture→Development/Architecture Owner;133–136 rejected first gate names Planning→Development/Product Owner;137–140 stale passed-on-earlier-text remains waiting. It no longer stops at the first passed gate.

3. **Simultaneous reasons and deciders are retained.** `state:53–55` filters all unaccepted artifacts and unfinished prerequisites plus gates before any priority-state return →56–61 forms the complete reason including every gate.decider →62/64/65 retains that complete string in ItemState →`startable:105–107` forwards it into reasons. TST295003:141–152 supplies two unaccepted artifacts, two unfinished dependencies and two blocking gates, then asserts all eight artifact/item/gate/decider names in the public refusal. This is the exact information-loss node the prior HOLD identified. Accepted result shapes remain unchanged; a complete ItemState reason may contain several named blockers.

## Remaining accepted states and current-context refusals

Public index19 exports only the assigned two functions. `orderedItems:12–24` preserves supplied Item/Step order; states87–92 derives without a store or request. StatusMap path/id lookup27–31 feeds acceptance53/62; TST295001:71–82 establishes accepted ready then open/changed/absent-withdrawn waits with the artifact named. Requirements/status entries are controlled supplied inputs; this source gate does not claim unfinished live collection or broader approval production.

Prerequisites54/64 use earlier supplied ordered states; TST295002:91–111 establishes ready before unfinished dependency, open review, failed/person-wait blocked, merged prerequisite/done and dependent ready, then unread pull facts unknown. Source67–72 handles failed/waiting-at-gate and queued/running/cancelling JobRows;75 leaves unknown only when the state needs requests;76–79 derives merged done, open in-progress and no current work ready. The current cases execute failed/person-wait, open/merged and unknown paths; queued/running/cancelling branches were independently read at their source nodes, not claimed as separately executed new tests. Public record fields remain ItemState item/state/reason/job/pullRequest.

Ready is not by itself permission to start: startable109–110 checks current sprint selection,112–114 counts every in-progress item including open review and names them at WIP,117–121 requires a current declared implementing-role holder with every needed capability, using the public holdsRole path. TST295003:122 is the eligible positive,123–126 checks selection/WIP including review,153–154 checks missing holder and named role needs. No holder bypass, stored state, network write or new phase/gate/role is added.

The exact base→head scope is only `src/work-plans/index.mjs` +5/−3, `src/work-plans/states.mjs` +124 and `tests/work-plans-states.test.mjs` +192. Existing backlog-order schema, producer and tests/expected results remain byte-identical. The old working MOD-documents readRegister caller and backlog-order tests are retained. No schema/save/findings/strategy/caller/planner/runner or whole-use-case outcome is claimed.

## Own first red, current CI and same-case proof

Own first tests-only commit `a86f5d9fedeb45daf4901df54c2bda5b964b75aa` precedes source. Original38039055126 node log6979–6988: tests/work-plans-states.test.mjs:14 public import →ModuleJob._instantiate →SyntaxError absent itemStates export; failed file node153 remains. This correction is within the same implementation job; no extra first-red or per-assertion fault quota is invented. Prior738b green and HOLD are preserved, never substituted for current evidence.

Current [CI38048499075](https://github.com/akmaier/agent-m/actions/runs/38048499075) is SUCCESS on exact head. Original checkout/API commit `7805da5b8c830fdaab20f2780e29ecdcda61909e` has parents `7b43f33a3f00780787fb6eb5c39c17401655971f`, `05f923e7133b8597d682eaf153d19160aafe263f`, tree `71f7ff9fa4d0f051ca0f1274b0258b9d727f7a45`; that tree equals the exact candidate tree. Node11:28:01–11:29:14,73s; Python11:28:01–11:29:04,63s, both within120s. Node1127/1119pass/0fail/0skip/8inheritedTODO; Python396 successful with5skip/6expected failures. Known-positive TST257001 is actual ok430; TST295001/002/003 actual ok1125/1126/1127.

The eight inherited TODO outcomes are unfinished, not passes:493 UC0064c/R2 product SPEC fallback without token;505 UC0421a/R3 missing renewed-token paste field;537 ITM133/A3 refused batch lacks record GitHub paths;538 ITM133/A4 refused Save lacks editor path;612 G1 job record counted open;613 G2 job record accepted as use-case;810 G1 record counted as proposal;811 G2 handed job record receives use-case approval. Existing notification delivery remains human-confirmed.

I read the actual whole9593-byte current raw proof, including named assertion failures and restored child stream, without claiming full nested JSON decoding. Source acceptance comparison53 changed from accepted to faulted. Fault11:29:06.795Z–11:29:06.901Z, status1 with no signal/error and empty stderr:295001 assertion77 actual waiting-for-acceptance versus ready;295002 assertion95 same mismatch;295003 assertion122 actual startable:false/UC032 not accepted versus startable:true. Three named child failures,0pass. Fault SHA `fa3f6aee3bda9cd415297caa58a976e0b8f998f8aa46798b05e4a44643e03dea`.

Exact source restoration precedes the same-case pass: original/restored SHA `1ca5068cc9526035236f988189200beec7f561988eaef30f490e0d5905fde451`, same test SHA `6d44c4ddf53e73921c8ec0d6a424ceecd484efd21e54de137af26ed7f6c7fad8`; restored11:29:06.901Z–11:29:07.033Z, status0/no signal/error, empty stderr, all3 named cases pass. Argv is `/opt/hostedtoolcache/node/22.23.3/x64/bin/node --test --test-name-pattern TST-295001|TST-295002|TST-295003 /home/runner/work/agent-m/agent-m/tests/work-plans-states.test.mjs`; cwd `/home/runner/work/agent-m/agent-m`; child source `/tmp/agent-m-295-fault-seDZfx/src`, child marker1, NODE_TEST_CONTEXT deleted. Original doubled TAP escaping is retained; it is neither a missing-proof finding nor a fabricated decoded result. This relevant production fault satisfies the same-case counter-proof; correction assertions above are read in the current passing case.

Existing public metadata caller uses testDeclarations/traceGraph/tracesTo across actual2095 tracked paths:194 declarations,583nodes/336edges, duplicateIds[]/unread[]. Actual selected IDs include257001 known-positive and295001–003; each295 test has canonical numeric title/level/module/guard/given/input/expect and derived requirement traces. Recognition is metadata evidence, not an additional behavioral test or proof of whole UC002.

## Original inputs — actual blob and byte hashes

| Original input | Git blob | SHA-256 |
|---|---|---|
| `05f923e7133b8597d682eaf153d19160aafe263f:AGENTS.md` | `7e8f20ca35cd48a5250d143b07a469d46986f123` | `1a0429c5f2a1fc219be2595dfb79a8411ad0d301817467cdf428cd2604ba96cb` |
| `05f923e7133b8597d682eaf153d19160aafe263f:SPEC.md` | `1de56e76de63bfe5f3f4bb98820adad801041def` | `676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594` |
| `05f923e7133b8597d682eaf153d19160aafe263f:README.md` | `37284376636ddf07efa58b63be4ff8a2ea12300a` | `f0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/backlog/sprints/19.md` | `0899c6ae32c682f1e0ce25411f0bf21c1cb9081c` | `23c2bd22a4325f9da0945e27daa754ac40e6449dec5f97c755b3d8e2d92eff01` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/backlog/order.md` | `4ac9dfa234d0664e7d6428e6f745b22d3aabac4c` | `088ecc392911cf63dde3db89e4840e8098171ea279db5851fbc6ac879613e3db` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/use-cases/UC-002-choose-a-process-model.md` | `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4` | `013580bcacab443155dd2b42a2079bb6b345ecf95df51c0c3c6fbdb9a11c07e5` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/use-cases/UC-032-maintain-the-backlog.md` | `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc` | `d9144b49cf3212b7e38c8377ea7e50b8598c32138480e47789ef947ec509486b` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-work-plans.md` | `f80e3bf00a415e1a2b90169e1761459472dd1653` | `f80467ac2f0af81b94ea6a0a63100f6dc870064c2917f4bb2cfe9edfab908045` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-documents.md` | `01ec416ad20bbd91e026e9b7447422828dd58a34` | `d16a5aad99610eb53292ec084d82a1277088dc5dff5c2260d48d356aade4002a` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-product-process.md` | `457809097e0b31c3c55e18865f42922d9861d67e` | `b0188bd6eed6afa0f61720e1ef63f507f7e53cedbb15bf6dce7c38bd422a3a27` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-approvals.md` | `2f849f73c508e331d0a587b2580e5cd62762b531` | `c01470dee13fc097f51c5d49c966374010d18276a46f67d17c65864a708f2b74` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-spec-changes.md` | `36353254ff2cfdc1cc8f157878759dca3bc3cc93` | `7f970b73511409c0dfb5c99a31a25aaee055a52729bd036340f9f211a6e9420b` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-job-ledger.md` | `1b474ae13499388cf949be8d44c13be90a4c26cc` | `bbbe4010c5036a93c21d31aa48f3314d7d703cfea9f3af9c1094e9f9cc52360d` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-repository-hosts.md` | `25d0f9f517ea45fbce3262468b652bff6d172b55` | `7034c7adaeaf874c54969885cb64a3af2e972e4de9be010298e2617a187a6e0f` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/architecture/MOD-participant-list.md` | `a2b797b9b3bb8298c6048bbc7edd3ac00252106a` | `9c1dab71de372d3b3307ca2b037e5bfe0e16314ba624e9c1f7a2e94e3c0acad9` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/process_team2.md` | `eb772d456a24c145fe3f98778509f207e34e172d` | `81618a69c5c3a441af8130f9491697b59e2196bcbef80ea008101bd92021025d` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/participants_team2.md` | `aba8b680f7df66e2807701294c960a3c29fb0148` | `1fe68a22412236b5b52ee7aa294a868cad88a519f345ee3ec3bdcddce5fcfccc` |
| `05f923e7133b8597d682eaf153d19160aafe263f:docs/process-models/scrum-wip.md` | `72fdea87d0c468ffcd53ae3a6d564623c686e22d` | `a128652d9d9e4cfea1f0ca8ca3d631aeedd91ebe99f232c9a223a950fa919b5f` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/work-plans/index.mjs` | `bc03ab60323dbb786202342fefd2f72c0ce22f48` | `6f949fd73d8a04ca7bc0e9b34cc51c0e4354468ebde8f6f54cb9c7ab9cf172fe` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/work-plans/states.mjs` | `9dbc8705642d4b0c08e7e9f2ed7f346f775d9e25` | `1ca5068cc9526035236f988189200beec7f561988eaef30f490e0d5905fde451` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/work-plans/backlog-order.schema.md` | `de99ca12feb7689e8e5f654856efc66224a293d1` | `ea468a316c96cb69d7e08615582cb1c28392b9162c63e9f733c4c866dc28a7a2` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/product-process/index.mjs` | `c2f0b31492ace8c3a405e0ed225b3a6b5918e576` | `dda1711d41bad9400cce96f0ae636b5aa322e12ccba59c9fb47051d255e91ab8` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/product-process/gates.mjs` | `824764fe15564ebb927307cebe7a898b86c43319` | `9126c01f578dc8d0c177103a2ac3d02d131285a6d7ba6d47d031e1a87762980f` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/product-process/workflow.mjs` | `2bd49976711ab6c574ba9a4e8b3fae7ab329e06c` | `9d7dd852a7cc49c4fc868ad64b302c3980d448a20756ae12486792b7e2d81307` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/product-process/declaration.mjs` | `6c89b749ae208437a23420461310f3e34be45f4e` | `b997ca64d805b7ce3ddff7ca6d4ad7d341537c2e678630d55924ae1039265f80` |
| `05f923e7133b8597d682eaf153d19160aafe263f:src/approvals/status.mjs` | `47a91584c5ec451df9df30771083e1fa0921d88d` | `63d8380846154e40fb1c40cc4397d246a9e8745cfecb675b8e74c456d4792b6a` |
| `05f923e7133b8597d682eaf153d19160aafe263f:tests/work-plans-states.test.mjs` | `5ee28b18f6bced669ee225c6627b4012d856585a` | `6d44c4ddf53e73921c8ec0d6a424ceecd484efd21e54de137af26ed7f6c7fad8` |
| `05f923e7133b8597d682eaf153d19160aafe263f:tests/work-plans-backlog-order.test.mjs` | `fc2f92ef5b3f4aca0aa21452644bc309bb12d634` | `9655231b88466480d704e6caa8cd91909ca2e94030e21dd1f9c3349fc921ade9` |
| `05f923e7133b8597d682eaf153d19160aafe263f:tests/approvals-status.test.mjs` | `33f3481aefdd08d7e25692549ff1f9b819b8e54c` | `5e03e862b77b6e832b455562f99363c3c65c20adcdfe93dd736d43937ef5513f` |
| `05f923e7133b8597d682eaf153d19160aafe263f:tests/product-process-gates.test.mjs` | `a995543acb80e63700c01fbf579d1c877d2969b9` | `d61223b0abafe805326858818e69c4ebf2a576022bd58d489f240e84239aaa1c` |
| `b772f6c:docs/backlog/sprints/19.md` | `481551d59c27930c232411dc2352f29ea5ea3b29` | `f938535c77934961ca02248309fd7a9d7e7e16a538386567dc7a67c6e6dec67f` |
| `b772f6c:docs/backlog/order.md` | `7f244424a4633139b1eef3a86ea019be298a6a00` | `eb948d586ef9062ff97689c60c878295e2f9ec217102edf708d65b9303f828b2` |
| `b772f6c:docs/jobs/JOB-20261010-0835-8f4a.md` | `83a6935e4a989a197d236625cd5ac3aa874dec06` | `4eedd4d0cfb3dad5eeabfc4066ca42a8da410915872e65365eb6f04869071950` |
| `b772f6c:docs/jobs/JOB-20261010-1139-b14f.md` | `33f7d55e2751527b18c650978e758d3d9f0766a2` | `509bd71216bf7d5417b17f99016492721917cd9b59f2261e0f81e2719fc53d98` |
| `b772f6c:docs/backlog/ITM-295-derived-item-states-and-startability.md` | `608236ef0ab9f1df28187ae495999421e8890b32` | `3c0bf1c07f670ded3db4d4305a6e67d2823aaa2f8493fcb227d866688a20072b` |
| `b772f6c:docs/gates/20261010-111824-development-itemstates295-738b.md` | `183abc9b56cd9367c977a29d338bb85fee0256a2` | `d74741172c6f2b7e28f7a6a28af44c9b495ce771af68c0b3f36910b3f335638b` |
| `b772f6c:docs/approvals/MOD-work-plans-f80e3bf00a41.md` | `4123ad5dd37471150422b5eba7dda840dccf5539` | `751038c97d1d439da7365dc6960449872ad27eb26042b5e921c48a382bfd34eb` |
| `b772f6c:docs/approvals/MOD-product-process-457809097e0b.md` | `1662069fd91160ac4434cc698df7172137e4949d` | `f34b28df9c0c2423322b1555b7cd4e1478a0b9f46a87f4c796691ccaea61b6c0` |
| `b772f6c:docs/approvals/UC-002-48fd22da0bf3.md` | `d8505396f515f58ecd42ba69c165da93b4c78c84` | `f269d492b604df00d54f6e1d178081e0ff8c8beff46b539c6f231c65fbb2e746` |
| `b772f6c:docs/approvals/UC-032-caa2f8e393cd.md` | `d0638958c2473a2b79c6e80dcf8ccf4b22dfb6b4` | `ee1a0d0b9e025e5d758a8fe5a4e356135e6b19b1cba9232de1e51d5438753dc4` |

## Original evidence — complete preserved files

| Original evidence | Bytes | SHA-256 |
|---|---:|---|
| `/private/tmp/root-p19-ci-38048499075-api.zip` | 354226 | `1ef0c5ba763888a31b19cbe3db2006d9c54a52edcd64d09065f7bdadf9a0f023` |
| `/private/tmp/root-p19-ci-38048499075-node-api.log` | 846858 | `17f2a04d81ded6d5779abe7f0da87ac9a48c837f75bcbbc46672c6a6e85286bd` |
| `/private/tmp/root-p19-ci-38048499075-python-api.log` | 75447 | `3016f69b55306f005d049b789e097f53da3a29f2c804686a265c59f594fd01d9` |
| `/private/tmp/root-p19-ci-38048499075.json` | 2938 | `ab3e3ad0d2f6b8cdbadd911588bd65d82be06faf46c61ca2907d5d5ce31ef62e` |
| `/private/tmp/root-p19-ci-38048499075-checkout-api.log` | 6800 | `370bd676aeacee1fde7ed3f5086f5ddf0f52417ae70fdc10676b94674406ec23` |
| `/private/tmp/root-p19-ci-38048499075-commit.json` | 2582 | `5fa72e59a5711afd35ae2c16c22336f22910193f4f517f8c031fc9fbd9cf11d5` |
| `/private/tmp/root-p19-ci-38048499075-295-proof-raw.txt` | 9593 | `641cbb9812ad44443ad2fde896a005270c4fabc91f6a31f3bcb2d3c70c5dad23` |
| `/private/tmp/root-p19-ci-38039055126-node-api.log` | 599324 | `840c5b8a245319186f71b1fee2825ad4c08813d3ff19849be31738adc4c05a20` |
| `/private/tmp/root-p19-ci-38039055126-failed-nodes-only.txt` | 684 | `cd8882ef798117537caf9dfd99e923805e9270235f420edf03ebc15006a5f455` |
| `/private/tmp/p19-295-05f9-trace.mjs` | 2306 | `9894903a95619ccb1a67384cf5669680e35c3ef19b3a705789dd82064bc69038` |
| `/private/tmp/p19-295-05f9-trace-paths.txt` | 113305 | `e97d667f1127e840e057d4ca90a68fdb724c662f2bb70f9eb27e27a94d83b675` |
| `/private/tmp/p19-295-05f9-trace.raw` | 2157 | `33c30f9ef6be175a7dd259924dbf86230a74997547145d8e87d5ae35a99b56dc` |
| `/private/tmp/p19-295-05f9-trace.json` | 275795 | `ca396fa3a51452868a95f2f222798ed1f5be308b737f3d04639c0f165efe7aa2` |
| `/private/tmp/itm295-05f923e-inventory.tsv` | 5097 | `7ec3277bbbc985b2e105dc54d2643509f1903d525dd43839f6d8c0af5da25495` |
| `/private/tmp/itm295-05f923e-scoped.diff` | 23864 | `259ccbe7df63a03c873e2bb217fdea678070a0ee7e0fec4c8d4e040fd5cd219a` |

## Authorized consequence

Root may publish this exact PASS and merge only `05f923e7133b8597d682eaf153d19160aafe263f` into `7b43f33a3f00780787fb6eb5c39c17401655971f`. If either immutable pin changes, this decision does not cover the changed combination. Start independent Release testing through its separately published job; selected295 is not marked complete by this source gate. No SPEC/use-case/module/process/DoD/participant change, human release acceptance, End, tag or deployment was made by this reviewer.

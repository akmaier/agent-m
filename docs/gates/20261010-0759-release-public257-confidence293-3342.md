# Independent public Release gate

**MEASUREMENT — 2026-10-10 08:05:13 UTC**

**PASS** only PR293 head `3342cdb5d414402fe983b5864bc96b4c1bd2f195` into approved sprint/19
`93b5218cdbab2bf7d527c22686519bdfae91e078`, independently decided by po-sol.
This exact tested combination may merge. After that approved merge, selected ITM257 and the bounded ITM293
confidence-finding outcome have their assigned independent public Release verification complete.
This does not decide other selected items, an aggregate/closing gate, whole UC003/002/047, or human release acceptance.

## Binding gate and selected boundary

The declared scrum-wip Release testing → Sprint review gate requires release tests “written by a participant other
than the implementer of the behaviour they test, green on the sprint branch”. SPEC §12, **RELEASE TESTS ARE NOT
WRITTEN BY THE IMPLEMENTER**, requires: “A test of level `release` is generated or written by a participant other
than the one that implemented the behaviour it tests.” SPEC §13 states: “A gate's decision recorded by the participant
that did the work the gate checks does not pass it.” Team2 retains the default DoD without extra conditions.
The source implementation's own tests-first red and source gate remain separately recorded; this independent
write-tests job changes only its new test file and introduces no production behavior.

Original ITM257 selects the dashboard Release main flow and every alternative with a repository fixture and a
fixture-completed run/result route, plus release coverage per UC013 requirement. Actual public composition is tested;
the external GitHub service, UC010/011 execution, UC036 general job dashboard and UC030 standalone audit are not
implemented or accepted by these fixtures. No real person acceptance, real release tag or deployment occurs here.
Bounded293 additionally requires the public lower-rate finding with method, confidence level, numeric bounds and
the person's reason/decision. All selected panel flows1a/2a/3a/3b/4a/4b are exercised; no broader system delivery is inferred.

## Original cases and requirement evidence

Relative to93b, only `tests/release-itm-257-public-flow.test.mjs` is added,312 lines, SHA256
`efb12fe4726119d5dfed2c69501dc8b27e3e696ecd41bfbc6099b3138b917317`.
Personally read all312 lines and diffed against original bafd4c7: original001–007/022 assertions are preserved;
only imports, the additional006 numeric Wilson assertion and901 counter-proof are added.

| Public case | Actual selected evidence |
|---|---|
|257001|Selected product distinct from instance; complete guarded report/changelog reopen and refresh without writes.|
|257002|Editable changelog/person, one Start click, selected-head candidate reference, one recorded queued complete run, pending-result panel.|
|257003|One explicit green-report decision commits report/approval/changelog together and tags the tested candidate.|
|257004|Calendar reset1a and independent-runner refusal2a, with no queued write on refusal.|
|257005|Red3a refuses acceptance without every reason, then records the reason and known limitations on the explicit decision.|
|257006|Lower6of10 versus8of10 finding, generic confidence wording, two-sided95% Wilson31.3%–83.2%, and recorded person reason.|
|257007|Existing-tag4a refuses without write/move; advanced-default-branch4b still tags the tested candidate.|
|257022|One selected-product Start→pending→all controlled levels/evidence→acceptance flow, then all six alternatives.|

Original canonical declarations explicitly name their requirements, module, level, given/input/expect before execution.
The union covers all fourteen requirements named by accepted UC013. Folded-level/independent-runner/immutable-version
explanations are retained in the production route and original test-pages-release/site-frame cases; no new quota is imposed.
Current exact3342 static metadata at08:04:23 uses the existing public testDeclarations/traceGraph/tracesTo caller:
2092 tracked paths,190 canonical declarations,579 nodes/324 edges, duplicate IDs[] and unread paths[].
All001–007/022/901 declarations are present; actual public UC013 and rate traces include006/293003.
I personally read the caller, raw result and all selected declaration records; the retained full2092-entry input inventory
has SHA256 `b1c550f14d2b31d951d46b715bb50f57401891a03e9563fde02d41337bbe5c03`, raw result SHA
`9177e3801ac17d329bb4f8feb5ef1f02a36dd1404745f1098a98212b1335ca44`. SPEC, parser, trace producer,
formatter, caller and owned-test inventory hashes were independently matched to exact3342 Git bytes.
This graph covers SPEC requirements/declared tests; it does not claim a full artifact/module trace implementation.
Original bafd4c7 metadata remains historical. This required static metadata adds no product test or fault quota.
The report's own Requirements table is the selected per-requirement evidence surface, not a claim to have implemented
the separate audit producer. Existing incomplete, moved-report, reason-missing, refused-host and immutable-tag guards remain.

## Public failure node and delivered correction

Actual path: `docs/assets/dashboard-app.mjs:546` dispatches the loaded public view →
`docs/assets/dashboard/release-view.mjs:7–11` connects the selected product and renders the public route →
`src/test-pages/release.mjs:122–124` reads candidate/results and renders releaseReport text →
`src/release-evidence/report.mjs:211–216` reads declarations/results/rateComparison → limitationsText143–147
selects worse rows/guards → rateFindingText128–140 formats the guarded interval → public panel.
Previously retained actual red38032899567 fails006 at its generic-wording assertion and022 through rateFlow:
the public finding had guard/rates/Wilson bounds but omitted “confidence interval”. Delivered C2c009 adds that
parenthetical at formatter140, after its own tests-only first-red f687. Source merge93b at07:48:03 follows
independent published source gate320ba17; E's integration3342 imports that exact approved source without authoring it.

Current public006 asserts lower rate196, generic wording197–198 and numeric/method bounds199–200, then supplies
reason and checks its committed record203–204.022 calls the same rateFlow at273. These actual output/decision boundaries
pass in current CI and after exact restoration. `src/test-pages/release.mjs:80–100` reads the person's name/reasons and
calls acceptAndRelease; report.mjs recomputes/checks the shown blob, refuses missing reasons before writes, commits
report/approval/changelog together, and tags candidate.commit. The finding makes no automatic acceptance verdict.

## Actual relevant fault and same-case restoration

Original901 faults only a temporary copy of release-view.mjs7 by adding the named public-render throw.
Actual Ubuntu command uses Node22.23.3 `--test --test-name-pattern` selecting001|002|003|004|005|006|007|022,
test `/tmp/agent-m-257-fault-43JdgV/repo/tests/release-itm-257-public-flow.test.mjs`, cwd that copied repo.
The child removes inherited NODE_TEST_CONTEXT, marks AGENT_M_257_FAULT_CHILD=1 and has40s timeout.
Fault07:52:20.229–07:52:21.452 UTC ends status1, null signal/error, empty stderr; all eight named cases fail.
001/004/006 see the named rendered fault;002/003 lack their known-positive form/acceptance controls;
005/007/022 have normal named TypeError nodes because the fault prevented their queried controls from existing.
007 stack is immutableAndMovedFlow220,022 stack259, not an unexplained launcher failure.
Restoration07:52:21.453–07:52:24.150 ends status0, null signal/error, empty stderr; the same eight pass, none skipped/TODO.

Source original/restored SHA256 `868a15ba667df3b4dc5fa127b109a3c9fa4f208763c6241fe834aceea1be0344`
equals actual unchanged caller bytes; fault SHA `9eb50b8502838e6f634ef821e847aa9a7e5a460990e2280df903024ab2c1da62`;
test hash equals current312-line file. Full fault/restored stdout/stderr, argv/cwd/times/statuses/hashes are retained
in original archive Node TAP. I personally decoded/read both full streams after removing exactly the TAP comment escape
layer; decoded receipt SHA256 `044e2bbe135c3ee6500904fc7b1e750ac64065db63c4d3753ea3141459b7a602`.
Earlier red and its901 wrapper finding remain historical; no prior evidence is fabricated and no same-head rerun is requested.

## Exact complete CI

Live PR293 independently read OPEN, exact3342/93b, both checks SUCCESS. Own CI38035880309 completes:
Node07:51:51–07:53:06 UTC,75s,1123 total/1115 passed/0 failed/8 inherited TODO;
Python07:51:51–07:52:55,64s,396 tests/5 skipped/6 expected failures. Both jobs satisfy120s.
Current257001–007/022/901,293003, inherited293001/002 and289 routes, Settings290109–113,286903 and E291901 are positive.
Both original archive checkout steps name `d82761f9d5757121aaea73efadf3ca05869ed7d0`; retained GitHub commit API
parents `[93b5218cdbab2bf7d527c22686519bdfae91e078,3342cdb5d414402fe983b5864bc96b4c1bd2f195]` and
tree `0762cd530fe5642311ebfa1290400e15fcd3c984` match the reviewed source/test head tree.

Authoritative complete original `/private/tmp/root-p19-ci-38035880309-api.zip`,266493 bytes, SHA256
`d4927ed8e5e45384bfac83a0c927f4580423516ca66d942677bdaa9bea2a1ec9` holds full aggregate and per-step logs.
Extracted Node600692 bytes SHA `dd718da26b8d1215299e20050c125b509a87cc3cc762e0415ed1305a4e94a103`;
Python75447 bytes SHA `4d363cd010d95dcef8eeb58dff3c99c6a76e387ff9e4c2d4778996c1521f2003`;
metadata SHA `b64770efec8b9624f5f1cbdf6d4a8b4a04a8a4e16b427030e14d3b9a462ee87a`;
checkout API SHA `c8d88e2db29bc553831071a1c76f141641fbb43356601a4885c4a42d95ae3e5c`.
Metadata, archive inventory/setup/checkout/completion, all assigned named outcomes, full counter-proof streams and final
summaries were personally inspected. I do not claim every unrelated raw-log line was personally read; incomplete CLI
acquisition is not substituted for these original archive streams.

## Originals, provenance and independence

Full published original0752 Start was read at ac3c9e6 before dedicated Taken07:55:04 UTC and fresh assigned isolation.
Previously personally full-read AGENTS/SPEC2135/README/process/Team2/participants/model/affected contracts/ARC043
were retained only after exact unchanged blob comparison against9d11549; SPEC blob remains1de56e76de63bfe5f3f4bb98820adad801041def.
Fresh current PRIMARY Sprint19 all220 lines/order118, selected257/293, full acceptedUC013, MOD-test-schedule,
original E0605 Start/Taken and immutable input/integration receipts were read. Receipt integration SHA256
`2ecf8ff6287e66cb3329f403d5b5bba561c1eb3b4ea2917a81084bbf7f9c4a6c` agrees with actual source/test/caller hashes.
Full actual public route/current312-line test and relevant dispatcher were read; formatter/result producer originals
remain retained after byte verification. Original same-guard release-evidence/test-pages-release/result-records/declarations
and fresh pending-report/dashboard/system/release notification, schedule/runtimes/trace-graph/job-ledger/tag/site-frame
tests were personally read, including legacy Module/Guards declarations and recovered truncated spans.
Input receipts classify literal parser fixture hits; inventories are evidence receipts, never substitutes for originals.

Fresh actual guarded git history and predecessor bodies identify SonnetD247/250/256, SonnetB248/249/252,
SonnetA251, SonnetC253/254/255; TerraD public caller, TerraC289/293 and TerraB pending ordering.
E's50ef591 merge imports guarded source byte-identically from its second parent: actual guarded-path diff against
that parent is empty, while the first-parent diff contains those imported known-positive source files.
Current3342 likewise imports approved93b; relative to93b only the new independent test file changes.
E/predecessorSonnetE authored none of the guarded implementation; owning these independent tests is not source authorship.
Sol/predecessorpo-opus authored none of it either; predecessor gate references are not implementation provenance.
The shared Git account is not participant authorship. Guarded history receipt SHA256
`d14d0bfe91b468475c58616f784c7a6fa7999b34daf0e0c6806a50079dd167c6` is retained privately.

Only this gate document is committed. Root alone publishes its byte-identical comment, performs the exact approved
merge and records Ends. No source/test/accepted artifact/selection/process/model/participant/DoD edit, product runtime
or native/UI/device action occurred locally. Usage:null; cost:null.

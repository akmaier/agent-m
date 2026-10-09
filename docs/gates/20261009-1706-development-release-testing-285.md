# Development → Release testing — ITM-285

**MEASUREMENT**

Decision: **PASS** for [PR257](https://github.com/akmaier/agent-m/pull/257), exact source
`14c68b05611a463e037053585d54999a36133990`, into actual `sprint/17` currently
`1f76b1657e8d8a7511268dbb5a6dae580cd0fe54`. Decider: po-sol, independent of developer-terra-a.
Fresh job JOB-20261009-1700-p283285, actual Taken clock2026-10-09 17:04:15 UTC; decision clock
2026-10-09 17:06:23 UTC. Usage/cost:null. This is the first separate decision; the two-gate job continues.

## Original contracts and isolated scope

Read the published new Start before the new isolated `.agent/worktrees/agent-po-sol-283285-gates-17`,
branch codex/p283285-source-gates-17, from current main6a9c94a. Previously personally read full original
AGENTS/SPEC/README, process_team2/participants and pinned scrum-wip remain byte-identical to df81829:
AGENTS7e8f20ca35cd48a5250d143b07a469d46986f123, SPEC1de56e76de63bfe5f3f4bb98820adad801041def,
README37284376636ddf07efa58b63be4ff8a2ea12300a, process eb772d456a24c145fe3f98778509f207e34e172d,
participants aba8b680f7df66e2807701294c960a3c29fb0148, model72fdea87d0c468ffcd53ae3a6d564623c686e22d,
pinned commit ef33e2f501289930960f13b55936e9b557003993. Original Sprint17, item285 and source Start,
accepted UC003/011/044, ARC037/040, MOD-bridge-http/desktop-shell/tunnels, existing protocol/server/pairing,
owned new test, existing unit/release guards, actual source history and original developer fault receipt were read.
Current MOD-bridge-http blob2792f1d3a1a66eec9750fac85949ee78874e2956 matches its human approval record.
No original contract is replaced by a summary or changed here.

Team2 adds no DoD conditions to SPEC's job rules. SPEC §11 tests-first/module ownership, §12 canonical
readable cases/own relevant counterproofs and §13 independent Product Owner gate/DoD apply. The pinned
model declares this source gate on the item PR, green CI and DoD. No human artifact is accepted.
Actual history of guarded bridge-http source names developer-terra-a and predecessor work, not this reviewer;
reviewer wrote none of this source/tests. No child, external write, source/test edit, contract edit, Mac native
interaction, browser/clipboard/focus/system change, personal audit, real SSH or paid provider occurred.
Only selected nonnative temporary loopback tests were executed; full native/integration evidence is Linux CI.

## Concrete consumer and production node

Accepted MOD-desktop-shell Start composes handlers; MOD-tunnels.tunnelHandlers supplies MOD-bridge-http's
BridgeHandlers.tunnels. Its actual accepted boundary is method/path route map → handler `{params:{},body:{}}`
→ `{tunnels:[{name,kind,state,reason}]}`. This item uses explicit constructed handlers, not automatic tunnels.
Current shell composition still supplies only jobs; this source gate does not deliver its later integration.

Actual path: src/bridge-http/server.mjs:12 refuses non-loopback → :20 origin refusal → :21–25 allowed
preflight → :27 reads current persisted token for each request → :28 pauses only POST → :30 protocol route
lookup by method/path → :32 supplied tunnels handler → :33 named absent-handler404 or :34 await/reply exact
handler result → :36–38 accepted error mapping/generic502. :19 logs only method/path/status/duration.
Protocol.mjs supplies GET/v1/tunnels data; :44 selects the old probe route by method/path/kind, not position.
Before this source, server dispatch refused every non-pair GET at its404 node; the new route tests reach
that actual failure after the working same-origin/current-token path. Pair/probe remain positively verified.

## Actual tests-first, full logs and checkout identity

Parent chain:1860e880c2dd972cdc80700f61487620ea3952ca → tests-only
`e4c3f6e11d0318f360bb80bb741e7cfecc760a5e` → source14c68b05611a463e037053585d54999a36133990.
First writing commit adds only the new tests/bridge-tunnel-state-route.test.mjs. Full PR changes only that
new module-named test plus owned src/bridge-http/protocol.mjs and server.mjs. No old test or expectation,
helper, other module, workflow, manifest or accepted file changes.

[First red CI37961161211](https://github.com/akmaier/agent-m/actions/runs/37961161211) actually tests
e4c3f6e11d0318f360bb80bb741e7cfecc760a5e. Actual checkout in both jobs is
`b9b79f9a62c9f459f91451b03b39eae7658fe408`, actual GitHub commit parents1860e880 ande4c3f6e,
tree9fae5cd8be60b347fe8eef991d988f93bc826dcb equal to tests-first head tree.
All six new cases fail:285001 at missing route declaration;285002 gets404 instead of200 for its supplied
empty handler;285003 gets404 instead of422;285004/005/006 get404 instead of200. Existing cases retain outcomes.
Python399 tests OK,5 skips/6 expected failures,55.918s. Node1046,1032 pass,6 fail,8 TODO,
0skip/cancel,51.341s. Both actual logs and all outcomes were retrieved/read, not inferred from local red.

[Final complete CI37962832353](https://github.com/akmaier/agent-m/actions/runs/37962832353) is SUCCESS
at exact14c68b05611a463e037053585d54999a36133990. Actual checkout in both jobs is
`643897d1a0e9344acc9ca4346a46f3931c0f53ac`, actual parents1860e880 and14c68b0,
tree74703e888084e656b5892b8dc8fc1cb125673f6a equal to reviewed head tree.
Node113929719167 succeeds:1046 tests,1038 pass,0fail,8TODO,0skip/cancel,54.082s; full job63s.
Python113929719318 succeeds:399 tests,388ok,5skip,6expected failures,40.662s; full job51s.
Native276001–006 and independent276901 remain executed/passing in Linux. Workflow's two-minute limits persist.
Complete final log7200 lines/732330 bytes SHA2568f00a6d5147b8a7d7d766d30cc27205a6a13cf586e8177757b4f4e6748b6ea80;
red7291 lines/740247 bytes SHA2561deb5883a74e824d76582fd6016247c452c4b8e3b61189b0bb799ca5b2d440b5.
All399 Python/1046 Node named outcomes matched across runs: precisely the six new outcomes changed.
Private logs /private/tmp/p285-{red,final}-ci.log; complete case ledgers p285-{red,final}-every-outcome.txt.

Live PR257 remains OPEN at exact14c68b0 with both completed SUCCESS checks. Its GraphQL baseRefOid still
reports original1860e880; a separate actual branch API read confirms target1f76b165. Diff original tested
base→actual target adds only src/tunnels/index.mjs and tests/tunnels-key.test.mjs from approved284.
Guarded bridge-http files, pairing/probe dependencies and existing route tests are unchanged; supplied-handler
285 source/test imports no tunnels source. New284 test identifiers are disjoint. This permits this bounded
source decision; old CI is not claimed to have tested newly merged284 code, nor to be combined integration CI.
Aggregate sprint CI/release/closing gates remain separate, and root rechecks the actual target before merge.

## Independently executed own faults and exact restored positives

Read original /private/tmp/a285-original-developer-fault-receipt.txt. Exact-head archive
/private/tmp/p285-po-disposable supplied isolated real production bytes. Each targeted command was
`node --test --test-name-pattern=TST-28500N tests/bridge-tunnel-state-route.test.mjs`.
Known-positive31-case selected route/server/declaration/trace suite passed before faults.

| Case | Relevant recorded source transformation → verified failure node | Exact restored positive |
|---|---|---|
|285001|protocol GET/v1/tunnels removed → test:47 lookup actualundefined expectedtrue|case1pass/0fail|
|285002|server:33 absent handler invented successful empty list → test:69 actual200 expected404|case1pass/0fail|
|285003|server:36 force upstream-failed code → test:83 actual502 expected422|case1pass/0fail|
|285004|server:20 exempt tunnels from origin refusal → test:107 actual200 expected403|case1pass/0fail|
|285005|server:28 pause GET too → test:127 actual503 expected200|case1pass/0fail|
|285006|server:19 log request headers/token → test:152 actualtrue expectedfalse for token presence|case1pass/0fail|

Each fault is an actual exit1/fail1; each same own case after byte-exact restoration is exit0/pass1,
0fail/skip/TODO/cancel. Temporary source restoration verifies protocol SHA256
2cdf63609a27286e2048deeaa61fb61e6b92e971037165845b6213aa9c9a0e31/blob
dbad4ccd8f2a051e081371500f1ab6ff7509ea57 and server SHA256
92dfefe364e4144bfb75fe81921a80d2d3654bc29291346990fe37b7d1bdcf86/blob
8267638e79cccdf18d96dadab889731d1876d8bf equal the source head; test blob
8c7e10333095a66e077326b49efcbc3e05ace37b unchanged. Private actual logs
/private/tmp/p285-po-TST-28500N-{fault,restored}.log retain each result.

Selected nonnative key-independent route/server/declaration/trace checks31/31 pass,0fail/skip/TODO/cancel,
182.596ms (/private/tmp/p285-po-positive.log). Canonical testDeclarations independently reads six unique
numeric TST285001–006, unit/MOD-bridge-http, lowercase fields, nonempty given/input/expect and UC044 guards,
paid:null; lines36/54/73/92/116/135. Actual canonical graph positively returns five token-guarding new cases,
then no case for an unguarded signature requirement. Each new fixture registers real close/removal cleanup.
The own counterproofs suffice without another broad suite run.

## Limitations and disposition

Old five Python skips and six expected failures remain exactly as recorded: groups, nightly SPEC scans,
sprint-record checks; CR/CRLF approval twins, backlog order, outside-section SPEC bytes and trailing blanks.
Eight Node TODOs remain R2/R3/A3/A4 and release/core G1/G2 record-as-proposal cases. They are limitations,
not passed product outcomes. Manual reviews have no invented fixed-round cap or extra quota.

Root may publish/comment/recheck and merge this exact source on this decision. Item-wide independent release,
aggregate review, sprint closing and human report acceptance remain open. E/predecessorE remains reserved for
independent later release writing. No SSH state, running tunnel, shell/HTTPS/browser integration, deployment
or distribution is inferred. The job continues to the separate283 decision.

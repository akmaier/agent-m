# Between-jobs dashboard Bridge caller — ITM-280

**REGISTER**

Decision: **PASS / APPROVED** only for PR246 head `b9ac420ef1697ab76e8a030e24b6bf404190ef51` into `sprint/16`.
Decider: po-sol. Actual Taken: 2026-10-09 10:46:50 UTC. Decision: 2026-10-09 10:50:51 UTC.
Review job: JOB-20261009-1044-p280c. Caller author: developer-terra-a.
PR: https://github.com/akmaier/agent-m/pull/246

## Authority, originals and independence

Read the published Start at main026e579 before creating the new isolated worktree. Read original AGENTS.md117lines,
SPEC.md2135lines in complete chunks and README; binding blobs are `7e8f20ca35cd48a5250d143b07a469d46986f123` and
`1de56e76de63bfe5f3f4bb98820adad801041def`. Read Team2 process/participants and the pinned scrum-wip original at
`ef33e2f501289930960f13b55936e9b557003993`, Sprint16, ITM280, JOB0853 and JOB1044; accepted UC003/044 originals,
MOD-settings-pages/browser-store/site-frame originals, source280 gate, original working endpoint caller, dispatcher,
settings route, public Bridge Route, app-harness and the relevant existing focused endpoint/direct/settings/notification
cases before probes. Current accepted blobs: UC003 `82081a084479172f2f8f704211351b052edea8e6`, UC044
`6c80417a691b105488b2426c25245ae7f39a33a7`, settings-pages `6357592c6ff7a2dd528ae959c918ad4ec1a903a4`,
browser-store `058fd3b05cc14cb361575f16a2059f174417e8ac`, site-frame `4349b0b66830d8f07fab12616677cbfd86ef61a3`;
each has a matching approval record in docs/approvals. No accepted text is changed or accepted by this decision.

AGENTS §6a says “First read the existing, working caller — then probe”; §2 requires the concrete data-flow path and
verification at the failure node. SPEC §11 WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS says an unowned file “is changed
between jobs, by a pull request of its own that only makes old code call a module in place of its own code”. This
bounded caller delegates to the accepted public settings-pages Route. JOB0853's write-tests End10:33:54 precedes the
separate caller delegation and source commit10:39:32. No implementation job kind is invented for unowned callers.
SPEC §12 A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT requires the recorded guarded-code fault and own-case failure;
EVERY TEST HAS ONE LEVEL and A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS require declared metadata/results.
SPEC §9 requires code PR green CI and recorded exact-text gate; Team2's assigned PO decides merges, root executes them.

I authored none of these new tests or caller changes. Test job/provenance records identify TerraA; owned settings source
history identifies TerraA/C and their predecessor participants, not this decider or its predecessor. Existing dashboard
history includes other developer/predecessor contributions; this gate claims independence for the bounded new caller
work, never independent whole-dashboard authorship or release coverage. Preserve source280's independent gate and its
first tests-only evidence. E280's independent system/release coverage follows the actual merged public route.
Manual edits/reviews are not Agent M automatic draft/check rounds; no loop-limit reset or assertion mutation quota.

## Exact scope and data-flow proof

Against actual CI base `011e779574130f5f10103272e0c1742790b38a75`, only two unowned adapters and one new test differ:
`docs/assets/dashboard/settings/endpoints.mjs` adds6lines, `docs/assets/dashboard-app.mjs` adds9lines,
`tests/dashboard-bridge-settings-wiring.test.mjs` adds70lines. No owned source, helper, existing test/expected result,
workflow, manifest, section, parser, configuration/proxy/endpoint logic or accepted/process/participant/selection text changes.

Settings view's existing section discovery/mount → endpoints.renderSection:25 `box.replaceChildren(configure,slice)`
keeps the endpoint Configure control first and public settings slice second → :26 renders public settings Route →
:27–31 creates/configures/appends the Bridge control inside that slice. Click:30 → context.go:18 → `#bridge` →
dashboard-app route:530–538 selects settingsPages.routes.find(name===bridge) and calls its public render(main,context,{})
→ src/settings-pages/index.mjs:8/:11 provides the already approved Bridge Route → bridge.mjs:53 render reads the canonical
instance store at93 and renders “Connect a Bridge”/“Pairing token” at144/148. TST280003 asserts the two-child mount at40,
endpoint-first control41, actual empty-store Bridge control43, hash46 and public dispatcher output48–49.

Saved Bridge: canonical localStorage `agent-m:akmaier/agent-m:bridge` → openStore → settings.mjs:87 bridgeLine reads it →
Change:105 calls context.go(bridge,{}) → caller endpoints.mjs:18 maps `#bridge` → same dispatcher/public Route →
bridge.mjs:93 reloads the address. TST280004 verifies actual saved control65, hash67 and canonical reloaded address69.
Each case has a unique numeric identifier, names MOD-settings-pages and MOD-browser-store, exactly component level,
requirement/UC guards, readable precondition/input/expected result; neither is an independent setup release test.

Endpoint creation and named edit mapping remain unchanged at caller17 and dispatcher522–529. The new Bridge branch
falls through the common token-banner/flash/error/scroll postamble at552–568; no early return bypasses it.
Legacy browser settings and notifications retain their existing paths. Endpoint default stays direct:
settings-pages/endpoints.mjs:61 sets throughBridge only for stored true, :117–125 retains direct testEndpoint flow.
No proxy or endpoint-success inference is added by this adapter.

## Actual red CI retained

Original tests-only first head `b0cca3e2f994738cf1e38117a6b47a3248105afc` adds only the new70-line test.
Actual CI https://github.com/akmaier/agent-m/actions/runs/37910907425 is completed FAILURE on that exact head;
Node1022total/1012pass/2fail/8existingTODO, Python399OK with5skip/6expected failures. TST280003 fails at test43:
actual null, expected a Bridge control. TST280004 fails at67: actual #settings, expected #bridge. Existing290/291 pass.
Metadata-corrected tests-only `b5edc628a0676609cf4725a6add403c327d4c4e4` changes only module headers; actual
https://github.com/akmaier/agent-m/actions/runs/37918126077 retains the same two failures and known positives/counts.
Later test-only `0bc1bed6f152aab3a5f4469515fb07c1b3061f05` names the real public Route heading “Connect a Bridge”;
it does not alter the empty control or Change expected result. Current exact test blob:
`dbbf7a790f31e2d173b6ab37bfb3130525355f88`. Both original red heads/evidence remain in history.
Complete downloaded red logs each7066lines: first SHA256 `a14bf2d2e6e33f1fe7d674014ca319e38dc5e5e437901c395c4acc84fa7a1bce`,
corrected SHA256 `f833b54b39e043d89881460701f3830aa9af3db0227998d997a85ec5fa1ab35e`.

## Independent focused execution and guarded faults

Disposable exact-head archive `/private/tmp/p280-caller-review`; no mutation of author, main or gate checkout.
Independent requested focused run69pass/0fail/skip/TODO/cancel: the two new cases, existing endpoint wiring, owned
endpoint/add-product tests, direct UC003 system/release, dashboard settings last-test and notification wiring/release.
Log `/private/tmp/p280-caller-focused-positive.log`. Controlled existing DOM/storage/fetch patterns; no paid/native launch.

Independently planted and executed the three recorded caller-code faults, each against its own named case:
- Remove endpoints.mjs:31 slice.append(configureBridge): TST280003 at43 fails actual null, expected control;0pass/1fail,exit1.
- Change dashboard-app.mjs:530 bridge condition to not-bridge: TST280003 at48 fails actual Use cases fallback,
  expected /Connect a Bridge/;0pass/1fail,exit1.
- Remove endpoints.mjs:18 context.go bridge mapping: TST280004 at67 fails actual #settings, expected #bridge;0pass/1fail,exit1.

After each fault, restore original bytes and run the same own case:1pass/0fail,exit0. Final byte comparison to git show
b9ac420 passes for both adapters and the test. Restored blobs: endpoints `8291dc993ec54c87d13e1fa4857d74f876c631a6`,
dashboard-app `eae1d843021b078eba1134b413de108db076f195`, test `dbbf7a790f31e2d173b6ab37bfb3130525355f88`.
Logs `/private/tmp/p280-caller-fault-{append,dispatch,go}.log` and matching restored logs.
No source/test/helper modification is retained.

## Complete final actual CI and disposition

Downloaded and processed the complete7038-line log for https://github.com/akmaier/agent-m/actions/runs/37919440541;
parsed every Node outcome and Python result, reviewed setup, all exceptional/TODO diagnostics, summaries and cleanup.
Run head exactly b9ac420; checkout merge `149c6f45ea6fa54165ae70ca12b789a501f76b32` combines it with base011e779.
Node1022total/1014pass/0fail/8existingTODO,0skip/cancel,42.746s; Python399OK,5skip/6expected failures,55.919s.
Both complete SUCCESS: Python10:44:29–10:45:32, Node10:44:29–10:45:19 UTC. Existing TODOs remain findings, never passed.
Full log `/private/tmp/p280-caller-final-ci.log`, SHA256 `20d1a9c4c0594498228a0042389e72cfc367c6c658c505454a3a623e99ca289e`.

Live check immediately before decision: PROPEN, exact unchanged b9ac420, both completedSUCCESS. Target is now
`b53db169340d6c11d02f87318e88459172098953`: independently compared with CI base011e779, only D279's new57-line
browser-store release test file is added; no caller/module/helper source changes. This disjoint addition creates no
new concern requiring a generic rerun or inherited release claim.

Approve root's merge only at unchanged b9ac420 after publishing this immutable gate/decision and rechecking live fullgreen.
This gate delivers the bounded caller entry to the already merged owned route; E280 independent setup system/release,
aggregate Release testing → Sprint review and sprint closing remain separate. No full UC003/044 completion, tunnel,
HTTPS reachability, certificate, signed distribution or release claim. ITM269 remains unselected under the current selection.
Root alone publishes/comments/merges. This reviewer commits only this new immutable record and prepares the local multiline
PR decision body; primary remains main and no external write is performed.

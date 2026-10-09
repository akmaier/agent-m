# Independent endpoint Route release gate — ITM-269

**REGISTER**

Decision: **PASS / APPROVED**, only PR251 exact `335c138b63c0a411ab8de434feedc14984704b5d` into sprint/16.
Decider: po-sol. Actual Taken: 2026-10-09 14:59:20 UTC. Decision/live recheck: 2026-10-09 15:01:30 UTC.
Review job: JOB-20261009-1456-p269r. Test job: JOB-20261009-1430-d269r, developer-terra-d.
PR: https://github.com/akmaier/agent-m/pull/251

## Authority, originals, independence and scope

Read NEW published Start on main4a7f08f5d1034a25b530f20e8a7e693fbfb5b3d3 before creating NEW isolated
.agent/worktrees/agent-po-sol-269-release-gate-16, branch codex/po-sol-269-release-gate-16, from that current main.
Primary remains main. Retained original full AGENTS117-line and SPEC2135-line reads after verifying unchanged blobs
7e8f20ca35cd48a5250d143b07a469d46986f123 and1de56e76de63bfe5f3f4bb98820adad801041def. Retained full original
README/process/participants/pinned model, UC003/044, listed architecture, ITM269, published source/caller gates,
D job/provenance boundary and same-scope source/test reads only after unchanged original/diff verification.
Current Sprint16 differs only by the explicitly published266 selection this PO read/wrote in its preceding planning
job; read its current original. Read all78lines of NEW release file, actual source/callers and predecessor history.

AGENTS §2 requires concrete call/data-flow and failure-node proof; §6a requires working callers first and known
positives before negative findings. SPEC §12 requires one level, readable case data, relevant planted-code fault and
release authorship other than implementer. SPEC §13 forbids own-work gate decisions. Team2 assigns this gate to po-sol.
Write-tests adds no behaviour; SPEC §11 implementation-first-red is not invented for this job. No claimed first-red CI.
Manual reviews/fault executions are not automatic correction rounds. Native UI stopped on current human instruction;
this reviewer accesses no native UI and launches no Electron or paid model.

Live PR and exact local three-dot diff show ONLY NEW tests/release-itm-269-endpoint-route.test.mjs,78lines,
four cases269901–904. Exact test blob0ec15e255a0f3981114b02031550349b0c927073. Parent335c138 is3240699;
actual targete4f980ea contains approved source/caller and setup release. No exercised source, old test/helper, workflow,
accepted document, selection/process/participant change. Four unique numeric TSTs, one release level, readable
preconditions/input/expected and canonical module/requirement guards; new-case faults are recorded below.
Actual Node graph guard tests/release-sprint-02-d-traceability.test.mjs321–334 is independently green with this file
tracked; it validates graph edges against canonical identifiers. test_origin_links alone is not used as that proof.

I authored none of D's checked work. Original exercised settings/endpoints b7b4683/d117af7/60e17cf identify C,
endpoint-calls a4b3628 C; store additions e1ca1ff/51c9810/1a04e37/d1d3187 B, core099c620 predecessor SonnetA;
Bridge client fcd7dac/fcf2d18/259c6bd B; HTTP91a7526/a64a21e/0b31837/3cf36ad and jobs40f1818 A;
compose c701825 A and shell source276 C. Original commit bodies and published provenance records were read.
D/predecessor D authored original dashboard endpoint dispatcher101d3e1 and boundarybf5e338, therefore these tests
render the public owned Route with supplied context; they do not import dashboard-app or app-harness. D implemented
none of this bounded owned source. Whole-dashboard release authorship is not claimed. E's selected266 independently
covers the full public-dashboard system/release path;267 browser/authenticated trustedHTTPS setup remains separate.

## Actual call/data-flow and boundaries

Test render32 → settingsPages view's public endpoints Route with real openStore and supplied go → source click127
validates form →133–135 saves canonical endpoint:local through browser-store JSON/prefixed localStorage →146
endpointConfig38–46 maps saved URL to baseUrl, optional key to body → public bridgeAt/probe104–109 sends POST
/v1/probes/endpoint-test → client63–88 builds token/body headers with credentials:omit → production compose5–7
registers jobHandlers → real bridge-http/server20/27 enforces configured Pages Origin/token before dispatch → handler
maps valid EndpointConfig to Node testEndpoint → endpoint-calls requestFor18–45 sends one short model request.
269901's real controlled own-model server receives /v1/chat/completions, Bearer key, model/messages/max_tokens1 exactly
once, and records real persisted setting at arrival. Real200 model → actual Bridge200{answer} → Route49 shows small
is working. Reload/Show retains hidden key until clicked; Clear reaches clearSetting/removeRaw and readSetting null.
The fixture supplies only DOM/storage and Pages Origin on native Node fetch; real Bridge/server/handler/model are not
replaced by a whole-Bridge success stub. Credentials/path/body and real request arrival are known-positive evidence.

269902 controlled model401 with error.message → endpoint-calls responseMessage49–55 preserves provider wording →
diagnoseEndpoint key refused → handler answer/Bridge200 → Route52 shows provider diagnosis. Key survives reload.
269903 with no Bridge setting: write135 still precedes settings137 → actual setup control139/141 → click140 supplied
go("bridge",{}) recorded; return142 gives no direct model request. This does not cover older dashboard dispatch.
269904 HTTPS settings65–69 reads separate Bridge address/token and matching nested jump-host login transiently →
client requestHeaders48–54 builds token/Basic; endpoint key remains JSON args, secrets absent from URL. Controlled
fetch verifies configured HTTPS request/body/headers, then simulated401 TokenRefused and network rejection NoAnswer
return distinct actionable Route texts. This case is settings-to-request mapping, not real TLS, forwarding, browser
reachability, trusted certificate, web login enforcement or full UC044. It never replaces the required real local
path in269901/902. No cookie/no-repository mutation inferred beyond preserved source/old guards' bounded evidence.

## Independent execution and exact-restored code faults

Disposable exact-head archive /private/tmp/po269release-review, Nodev26.3.1. Indexed unchanged archive files for the
existing graph guard's git ls-files caller. Independently ran new four plus existing owned269/Bridge/direct settings,
store, endpoint-calls, client/server/jobs/compose, client263/compose268 release, direct UC003 system/release and actual
Node graph guards:109total/pass,0fail/skip/TODO/cancel,7.304747834s. Log /private/tmp/po269release-positive.log.
Each fault changes only guarded code in that disposable archive, exits1 with0pass/1fail; byte-exact restore exits0
with own-case1pass/0fail:
- TST-269901 omit endpoint source135 writeSetting: actual savedAtModelArrival=[null], expected=[setting], fails test49
 after real Bridge200/model arrival. Restored own case positive.
- TST-269902 lose provider message in endpoint-calls responseMessage52, returning genericHTTP401: actual Route text
 “Endpoint returned HTTP 401.”, expected provider refused this key, fails test63. Restored positive.
- TST-269903 change only setup context route at endpoints140 from bridge to endpoints: actual navigation endpoints,
 expected bridge with emptyparams, fails test70. Restored positive.
- TST-269904 omit nested transient login spread endpoints69: actual Authorization undefined, expected Basic
 d2ViLXVzZXI6d2ViLXBhc3N3b3Jk, fails test77. Restored positive.
Logs /private/tmp/po269release-fault-269901.log through269904 and corresponding restored logs. Final archived git
source diff empty; endpoints blob e3b5cab0c858a096a621ccf85280c2005e525846/SHA256
7597cfb0597e6b7e04808595d4b39e8c52d842cd8eee3b2ca8d1e9ae0e67ad60; endpoint-calls blob
b7162d179bc7168fba2ce3b2489982498cafad38/SHA256 f84117aec66cbdf86cd8881f618f9d465ab4312a4dffb73c64dfb4cbd8942c78.
No mutations retained. One relevant fault per new case is verified; no mutation-per-assertion or full-module claim.

## Full actual CI and disposition

Read complete7138-line actual https://github.com/akmaier/agent-m/actions/runs/37947784350, exact head335c138,
all jobs/steps and parsed all1038 Node/399 Python outcomes. Both COMPLETED/SUCCESS:
Node1038total/1030pass/0fail/8existingTODO,0skip/cancel;45.363520211s suite; job14:55:17–14:56:10UTC,53s.
New four actual outcomes408–411 pass; canonical graph outcome579 passes. Python399total/388ok/5skip/6expected
failures,0ordinaryfail/error;56.430s suite; job14:55:16–14:56:18UTC,62s. Both under120s. Existing TODO/skips/expected
failures remain limitations, never counted as passes. Complete log /private/tmp/po269release-ci.log SHA256
aa95623c70ed48128c5365c0490cc3c37d4e301209d6ca2285454cd2fea385c5. Actual checkout
912ec5d9671f1c04d4c6be2c81fd12191e81a3e6 parents verified via actual GitHub API: e4f980ea6fd6f8db95b0226bb5ebc24063505c40
and335c138b63c0a411ab8de434feedc14984704b5d. Final live15:01:30UTC: PR251 OPEN at unchanged approved head,
both complete full checksSUCCESS.

Approve root merge only unchanged exact head after publishing this immutable decision and rechecking live fullgreen.
Root alone publishes/comments/merges under standing human authorization. Reviewer writes only NEW gate and local
multiline body, no external writes or accepted-document/source/test/process/selection changes. This passes bounded
owned-Route independent release coverage; retain full-dashboard266, real-browser267 and aggregate Sprint-review
prerequisites. No full UC003/044 completion, native notification success or overall sprint closure claim.

# Independent full UC-003 system and release gate — ITM-266

**REGISTER**

Decision: **PASS / APPROVED**, only PR252 exact `682b22d4c5497befb7830af19a45a0e3058234a7` into sprint/16.
Decider: po-sol, model gpt-6.1-sol, Agent M unreleased. Review JOB-20261009-1539-p266g.
Actual Taken: 2026-10-09 15:40:28 UTC. Decision/live recheck: 2026-10-09 15:47:59 UTC.
PR: https://github.com/akmaier/agent-m/pull/252
Test writing: JOB-20261009-1524-e266, developer-terra-e, gpt-5.6-terra.

## Authority, originals and scope

Read the fresh published Start before creating NEW isolated .agent/worktrees/agent-po-sol-266-gate-16,
branch codex/p266-system-release-gate-16, from then-current main494b8b49d082268109434dc9c15b8108cdd96c76.
Primary remains main. Read original AGENTS and entire SPEC, README, Team2 declaration/participants, scrum-wip,
current Sprint16, ITM266, UC003/044 and named affected architecture/interfaces; read existing working callers and
same-scope source/tests before probing. In particular the dashboard Settings composition/dispatcher, settings pages,
browser store, endpoint driver, Bridge client/server/jobs and shell composition were read as actual source.
Original existing direct UC003 system/release, Settings wiring and owned Route tests, store/client/HTTP/jobs/compose
unit and release guards, source-app component/release guards, and actual Node graph guard were inputs. Reading
native-test source is not launching it. No native/UI interaction, app launch, OS/device change or paid model call.

AGENTS §2 requires concrete call/data-flow/failure-node evidence; §6a requires working caller first and known
positive before a negative finding. SPEC §12 says “A new test is accepted only with a recorded counter-proof: a fault
deliberately introduced into the code it guards, and the test's failing result on it.” It also requires one declared
level, readable precondition/input/expected and release authorship other than implementer. Team2 assigns this decision
to po-sol. Write-tests adds no implementation behaviour: no implementation-first-red or fault-per-assertion quota is
invented. Manual reviews/fault executions are not Agent M automatic correction rounds.

Live PR and exact commit diff contain ONLY two NEW files: tests/system-uc-003-dashboard-bridge.test.mjs (82 lines),
blob ef32e447cf85d1d5b1ea1124af269947a344dded; tests/release-uc-003-dashboard-https-bridge.test.mjs (81 lines),
blob a785eb186e8fbd11d2fdd8080879c9623a60ef24. They declare unique numeric TST266001/system and TST266002/release,
readable precondition/input/expected, module chain and canonical UC-003/requirement guards; alternative2a is explanatory
prose, not an invented UC identifier. Actual Node graph guard validates identifier edges. No old helper, source, test,
workflow, accepted document, process, participant or selection changes.

The five old system cases and six old release cases remain byte-identical to PR parent: direct system blob
4cfc9fe03562fb24e98ed0eb702e78d0d80c7b9f; direct release blob fbff7157ea8dda1bccb3e6c97d32cf3b4f48bfb3.
The fresh E Start was published before dispatch. E did not record its actual Taken timestamp; it remains **unknown**.
This review records its own actual receipt and does not fabricate E's history or cost.

## Independent author and source provenance

I authored none of the checked tests/source. The E battery is independent of exercised behaviour. Original source
history/commit bodies and published jobs/gates identify settings endpoints b7b4683/d117af7/60e17cf and endpoint-calls
a4b3628 as C; browser-store endpoint/list/jump-host additions e1ca1ff/51c9810/1a04e37/d1d3187 as B and core099c620 as
predecessor Sonnet A; Bridge client fcd7dac/fcf2d18/259c6bd as B; HTTP91a7526/a64a21e/0b31837/3cf36ad, jobs40f1818
and compose c701825 as A; source-app276 as C. D authored the original dashboard endpoint dispatcher101d3e1 and boundary
bf5e338; later bridge setup mapping3240699 belongs A. Root has shared dashboard caller provenance. Neither D nor root
wrote this E battery, and D's supplied-context release test does not substitute for full-dashboard coverage.

E's historical merge50ef591af8b9b19cd193d6c95c083209e2735b74 preserved guarded source rather than authoring it:
rev-parse of merge and first-parent path blobs is equal for settings endpoints660db486ee1fcaa5a6e730c5832799a675f46c31,
settings page fd290df75d1ac287e9bb5266fff26f58c737b40e, endpoint driver b7162d179bc7168fba2ce3b2489982498cafad38,
store ede229398c38f93056d1eb26c79a562a77567407, dashboard-app0c7d3ef2935447243cc2f0c73cdff73c8da03ac6 and
Settings endpoint composition f921691dab908724cf8baa29384bd6f4f4365117. Client/HTTP/jobs/compose did not yet exist at
that merge; their subsequent original authors are identified above. The same blob lookup demonstrably resolves the
existing paths, so absence is not inferred from an unvalidated search. Combined merge source diff adds no authored
resolution. Current complete guarded-path history contains no E/predecessor E source implementation.

## UC-003 outcome and six realised release requirements

The checked battery is cumulative: preserved direct guards plus two new public-dashboard Bridge guards.

| UC003 flow | Actual guard and observation |
|---|---|
| Main1–5 | TST292001 drives Settings Configure, saves before one OpenAI request and shows working;292002 checks Anthropic short Messages;266001 additionally crosses real composed Bridge/model with storage observed at arrival |
| 4a | system292003 and release292007 preserve browser-block reason and actionable CI/Bridge runtimes |
| 2a | new system266001 real client/composed server/jobHandlers/controlled local model; new release266002 configured HTTPS forwarding with separate Basic login/token and same real Bridge/model path |
| 4b | system292004 provider refusal, retained raw key/reload and eventual real Clear; existing owned Route release269902 also preserves controlled provider error |
| 2b | system292004 and release292008 remove raw persisted endpoint and show absence after reload |
| Public named Change | TST292011 is **system**, preserves actual named endpoint route; it is not counted as release |

Release case declarations at direct release64/97/120/141 establish every realised requirement explicitly:

| Requirement | Release case |
|---|---|
| CONFIGURATION LIVES IN THE BROWSER | TST292005 (separate browsers/instance prefix/reload);292009;266002 |
| CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE | TST292005;266002 |
| A CREDENTIAL IS NEVER PLACED IN A URL | TST292006;292009/010;266002 |
| AN UNSUPPORTED ENDPOINT SAYS SO | TST292007 |
| A CLEAR IS A REAL CLEAR | TST292008 |
| NO SECRET IN THE REPOSITORY | TST292006;266002 |

TST292009 retains disclosure/Show/hidden key and absent-Bridge configuration without direct request;292010 verifies
optional absent key sends no authorization. Existing assertions and expectations were neither weakened nor replaced.

## Concrete call/data-flow and fixture boundary

Public Settings composition docs/assets/dashboard/settings/endpoints.mjs24 Configure click → go16–17 sets actual
location.hash=#endpoints → new system test40 / release64 assert selected hash BEFORE manually rendering that selected
route → dashboard-app522–529 finds owned public Route and supplies real openStore → endpoints127 click validates
input →133–135 maps form to canonical endpoint record and writes JSON/prefixed browser localStorage →137/146 resolves
Bridge, maps endpointConfig, calls bridgeAt/probe → client91–95 retains private token/login,104–109 creates POST
/v1/probes/endpoint-test → client50–54 builds token and optional Basic headers,70 uses credentials:omit → production
compose6 supplies jobHandlers() → bridge-http/server20–39 enforces configured Origin/token/body and finds handler →
bridge-jobs/handlers15–21 calls actual endpoint-calls.testEndpoint59 → requestFor18–45 sends one short model request.

System266001's actual model HTTP handler test56–60 observes canonical raw localStorage at arrival BEFORE answering;
its assertion58 compares complete expected stored shape including throughBridge. Model receives one
/v1/chat/completions, Bearer endpoint key, model/messages/one-word prompt/max_tokens1 (assert77) → actual model200 →
Bridge200{answer} → public Route working text (assert76). Test cookie80 and repository write ledger81 remain empty.
The fixture adapts DOM/storage and adds Pages Origin to native Node fetch; no whole-Bridge success result is stubbed.

Release266002 reads bridge address/token and separate jump-host nested login from real store (test55–58 → endpoints
65–69). RequestHeaders54 encodes Basic login, while Bridge token remains its own x-agent-m-bridge-token header; the
endpoint key remains JSON args before becoming the model Bearer header. Controlled forwarding handler test44–50
checks the EXACT configured HTTPS URL, constructs actual401 with www-authenticate on missing/wrong Basic header,
and otherwise nativeFetch-forwards into actual composed loopback server. Model receipt/assert77 proves actual short
request. Test73 observes working,74 exactly one forwarding,75 token separation,76/78 no URL/repository credentials,
79 no cookie and80 no repository write. This is controlled HTTPS-address forwarding: **no actual TLS certificate,
tunnel, browser reachability or Safari measurement**. ITM266 explicitly permits this already-configured route fixture;
no new provisioning obligation is introduced. UC044 native/browser setup and unselected267 remain separate.

## Independent exact-head execution and faults

Disposable git archive of exact head at /private/tmp/po266-exact; Nodev26.3.1. No repository source/test was edited.
The archive was git-init/indexed only so the existing graph guard uses its normal git ls-files caller.

Positive command (working directory /private/tmp/po266-exact):
`node --test tests/system-uc-003-dashboard-bridge.test.mjs tests/release-uc-003-dashboard-https-bridge.test.mjs tests/system-uc-003-direct-endpoint.test.mjs tests/release-uc-003-direct-endpoint.test.mjs`
Result:13/13 pass,0fail/skip/TODO/cancel,2293.915292ms, both real Bridge200. Default sandbox initially denied listening
EPERM (11pass/2infrastructure failures); authorized loopback execution yields the positive above, not a product finding.

- System fault: in disposable compose.mjs replace its sole jobs:jobHandlers() with jobs:{}; run
  `node --test tests/system-uc-003-dashboard-bridge.test.mjs`. Exit1,0pass/1fail,454.888042ms. Actual server39 cannot
  find handler and logs POST/v1/probes/endpoint-test404 → client BridgeFailed → Route displays “The Bridge could not
  test this endpoint: Bridge handler not found.” → own assertion test76 fails against /controlled-model is working/.
  Exact restore command from primary: `git show 682b22d4c5497befb7830af19a45a0e3058234a7:src/desktop-shell/compose.mjs > /private/tmp/po266-exact/src/desktop-shell/compose.mjs`.
  Restored blob04986a73ed6e23112d0db46668874d39e858eb2f; same own-case command exits0,1pass/0fail,431.766209ms,
  actual Bridge200. A prior wrong-working-directory invocation merely could not locate the new test; corrected command
  above supplies the result, not an inferred failure.
- Release fault: in disposable endpoints.mjs remove sole `, ...(login ? { login } : {})` from bridgeSettings69; run
  `node --test tests/release-uc-003-dashboard-https-bridge.test.mjs`. Exit1,0pass/1fail,425.264417ms. Nested login is
  lost → client sends no Basic → actual proxy Response401 before forwarding → client78–82 TokenRefused (because
  private login is absent) → Route displays “The Bridge refused its pairing token. Copy its current token and pair it
  again.” → own assertion test73 fails against /release-controlled-model is working/. Independent private Response
  observer command `node --import /private/tmp/po266-response-receipt.mjs --test tests/release-uc-003-dashboard-https-bridge.test.mjs`
  records “constructed response status=401; www-authenticate=Basic realm=jump-host”, exits1,0pass/1fail,409.01825ms.
  This is actual constructed401, not an assertion throw mislabeled401, and the observed UI wording is reported exactly.
  Exact restore: `git show 682b22d4c5497befb7830af19a45a0e3058234a7:src/settings-pages/endpoints.mjs > /private/tmp/po266-exact/src/settings-pages/endpoints.mjs`.
  Restored blob e3b5cab0c858a096a621ccf85280c2005e525846; own-case command exits0,1pass/0fail,460.252709ms,
  actual Bridge200. No source mutations remain; final archived git diff --exit-code succeeds.

Actual canonical graph command `node --test tests/release-sprint-02-d-traceability.test.mjs`:8/8pass,0fail/skip/TODO,
230.651125ms. Initially an unindexed archive lacks git metadata; indexing the exact unchanged tree supplies the real
caller's required tracked-file input. No ad-hoc graph substitute is claimed. One relevant own-case guarded-code fault
per new test and byte-exact restored positive satisfy the requested counter-proof.

## Complete actual CI, live state and disposition

Complete actual7152-line log consumed and all test outcomes/diagnostics inspected:
https://github.com/akmaier/agent-m/actions/runs/37953182800 . Run head682b22d4c5497befb7830af19a45a0e3058234a7.
Checkout actual merge d532a19 combines this head with sprint/16 b25ee4e905301e763641a33ff0c45d485ffbfd04.
Log SHA2564b12dc07222444fa117d064f04a3f2e83da2c7dcc107471e56122aa6c871cdbd,
private receipt /private/tmp/po266-ci37953182800.log. All jobs/steps COMPLETED/SUCCESS:
- Node1040total,1032pass,0fail/cancel/skip,8existingTODO;49468.375417ms suite. Job113896955381
  15:38:06–15:39:03UTC,57s. New266002 outcome631 and266001 outcome960 pass; unchanged11direct cases632–637/961–965 pass.
- Python399total,388ordinaryOK,5skips,6expected failures,0ordinaryfail/error;56.620s suite. Job113896955167
  15:38:05–15:39:08UTC,63s. Both jobs satisfy the two-minute requirement.

Existing Node TODO outcomes433/445 concern product SPEC no-token fallback/renewed-token paste;479/480 missing-access
batch Accept/Save fallback;555/556 and755/756 record-as-proposal gate handling. Python5skips are no own group files,
two nightly no-test-opens-own-SPEC checks, two absent own sprint-record checks. Six expected failures: three CR/CRLF
approval twins, own backlog order, outside-approved-section bytes and trailing proposal blanks. They are explicit
limitations, not passes; none is a new UC003 result. CI fullgreen means workflow SUCCESS, not absence of those declared
existing exclusions. Live read15:47:59UTC: PR252 OPEN, base sprint/16, exact unchanged reviewed head, only the two NEW
files, both complete full checksSUCCESS; actual run also completed/success at that head.

Approve root merge only this unchanged head after publishing this immutable decision and rechecking live fullgreen.
Only root publishes/reviews/merges under standing human authorization. Reviewer changes only this NEW gate and private
multiline decision body. This accepts selected ITM266's complete stated system/release outcome; it is **separate from
aggregate Sprint16 Release testing→Sprint review**, unselected267, full UC044 provisioning, release-report human
acceptance, Sprint close and release tagging. No premature aggregate/sprint/release acceptance is implied. No private
device audits or personal-system summaries are exported.

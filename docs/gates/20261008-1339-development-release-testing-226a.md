# Development → Release testing — PR226

**REGISTER**

Decision: **APPROVED**, solely at40f18186a79506bc87ca3ecbc94e9f27a6260f91 into sprint/15.
Participant: po-sol; model: gpt-6.1-sol. Taken: 2026-10-08 13:37:14 UTC. Decision: 2026-10-08 13:39:01 UTC.
Job: JOB-20261008-1336-708b, round1 of fixed limit3.
PR: https://github.com/akmaier/agent-m/pull/226

## Original acceptance and independence

AGENTS/SPEC originals were personally read; unchanged blobs7e8f20ca35cd48a5250d143b07a469d46986f123 and
1de56e76de63bfe5f3f4bb98820adad801041def verify the retained whole-original reading. Current item262/Sprint15,
implementation/deciding jobs, UC-003 and accepted affected module originals, existing public callers and complete
three-file PR diff were reviewed. MOD-bridge-jobs6450ce8ea05c66313bc234f95210bcd176b309ca,
MOD-bridge-http2792f1d3a1a66eec9750fac85949ee78874e2956 and
MOD-endpoint-calls27a1363562bc158cfce4a8ffacace127c37c990d remain the accepted texts.
Team2 process/participants and pinned scrum-wip remain unchanged; its Development → Release testing condition is
full green CI and DoD. SPEC§11/12 first-tests, owned scope and per-case counterproof rules apply.

A's two ordinary commits name Agent M revisionde6c71514397986224d7a4ca70b2523919641217, participant
developer-terra-a and modelgpt-5.6-terra. The first77c2c3ade2da2ed591fed42e86059c3feb9b27f2 changes only the new
module-named test. Its actual red CI37784339059 Node113335107033 fails ERR_MODULE_NOT_FOUND at the public
bridge-jobs import; Python succeeds. That red run precedes the production commit40f1818. The final diff adds only
owned src/bridge-jobs/index.mjs, handlers.mjs and seven cases in tests/bridge-jobs-endpoint-test.test.mjs.
No existing source, helper, old expectation, parser, direct browser route, SPEC, UC or architecture changes.
I implemented none of A's behaviour and decide as another participant/model. E remains independent for release tests.

## Concrete accepted path

src/bridge-jobs/index.mjs:3 → public jobHandlers → handlers.mjs:15 defaults to the imported public Node
testEndpoint at1 → endpoint-test route17 → typed body.args validation18 → new five-field EndpointConfig20 →
exactly one awaited testEndpoint21 → { answer } without changing its success or diagnosis. Valid keys are strings
or null; supported kinds are OpenAI-compatible and Anthropic. No retry exists.

The existing serveBridge caller dispatches the same POST /v1/probes/endpoint-test key from handlers.jobs after its
protocol/body protections. Invalid direct handler input throws invalid-request before invoking the endpoint test;
an unexpected thrown failure becomes upstream-failed with its message at23. The accepted HTTP server's existing
own-member error map supplies422/502. Provider failures returned as works:false remain diagnoses, not transport errors.
The function retains no request configuration in module state, closure, file, clone, record, shell setting or log.
Only local variables live for the request; it has no filesystem, persistence or logging call.

A separate controlled Node probe in the exact archive invokes jobHandlers() with its real default import and replaces
only global fetch with constructed responses. It proves one success call at the chosen endpoint URL/model, key only
in the endpoint header, then one unreachable-server call returning the Node not-reachable diagnosis and empty routes.
No real endpoint was contacted. This verifies the production default separately from the permitted unit injection.

## Independent seven-case fault proof

Exact-head disposable archive: /private/tmp/po-sol-226-nnln4bxo. For each case the command is
node --test --test-name-pattern TST-262-NNN tests/bridge-jobs-endpoint-test.test.mjs.
Each positive was executed before its mutation, then the failure inspected, then exact-byte restoration rerun.

| Case | Planted fault at handlers.mjs → intended test assertion | Exits |
|---|---|---|
| TST-262-001 | Await endpoint once but return answer:null at21 → success answer comparison, test27 | 0/1/0 |
| TST-262-002 | Same return corruption → refused-key diagnosis comparison, test36 | 0/1/0 |
| TST-262-003 | Same return corruption → unknown-model diagnosis comparison, test45 | 0/1/0 |
| TST-262-004 | Same return corruption → unreachable diagnosis comparison, test54 | 0/1/0 |
| TST-262-005 | Same return corruption → provider-failure comparison, test63 | 0/1/0 |
| TST-262-006 | Remove validation18 → test72 missing expected invalid-request rejection | 0/1/0 |
| TST-262-007 | Rethrow underlying error instead of named failure23 → test83 predicate rejects missing upstream-failed code | 0/1/0 |

The five answer faults fail at actualnull versus their original constructed answer, while the endpoint invocation is
preserved. Test001 also guards exact mapped fields and one call;006 guards zero calls;007 guards one call/no retry.
The final restored run passes all seven. Restored handlers SHA25697b95dcd950eda440212432779da484cc64ee005a53d097248b47eba443cf07f.
proofs.json,21 individual logs, restored-all.log and default-node.log record the execution. No mutant was committed.

## Exact CI and disposition

Current PR body contains all seven counterproof dispositions and truthful initial/final evidence. Live exact head and
CI37784761081 were independently read: Node113336556375 SUCCESS,971 tests,963 pass,zero fail,eight TODO,zero skips;
Python113336556789 SUCCESS,397 tests run,OK with five skips and six expected failures.

No original source-gate finding remains. This delivers only the transient endpoint-test handler. ITM-268's production
app composition and independent E default-call release coverage follow; no general proxy, CLI/job/watch functionality,
runnable app or whole UC-0032a is claimed. Only scrum-master-session may merge the unchanged approved head with live
green CI. This reviewer made no source/test/job edits, push, merge or human artifact acceptance.

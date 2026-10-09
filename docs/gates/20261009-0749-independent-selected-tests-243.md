# Independent selected endpoint-composition release tests — PR243

**REGISTER**

Decision: **PASS / APPROVED** solely at `bebcd1f1cbc458009d97c41839a1aeae306d1fdd` into `sprint/16`.
Decider: po-sol. Taken: 2026-10-09 07:48:20 UTC. Decision: 2026-10-09 07:49:35 UTC.
Job: JOB-20261009-0747-p268r. Writer: JOB-20261009-0735-e268r, developer-terra-e. Item: ITM-268.
PR: https://github.com/akmaier/agent-m/pull/243

## Original authority and scope

Personally retained full original AGENTS/SPEC/README/process/participants and same-scope tests from the source268 and
native276 reviews, after verifying unchanged blobs at this exact head. AGENTS/SPEC remain
`7e8f20ca35cd48a5250d143b07a469d46986f123` / `1de56e76de63bfe5f3f4bb98820adad801041def`;
Team2 declaration/participants remain `eb772d456a24c145fe3f98778509f207e34e172d` /
`aba8b680f7df66e2807701294c960a3c29fb0148`; pinned scrum-wip remains
`ef33e2f501289930960f13b55936e9b557003993`. Read the new original review/writing jobs and full new test, original268
item/contracts/UC003/044 and accepted source gate. Affected module/use-case blobs match those personally reviewed for
268 source; current new test context includes existing TST268001, HTTP/jobs/client unit/release, native component,
endpoint settings/store/frame/direct system/release tests. No existing test/expected result is changed.

AGENTS §6a says “First read the existing, working caller — then probe”; §2 requires a concrete data-flow/failure path.
SPEC's “RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER” requires independent authorship;
“A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS” requires declared input/precondition/result;
“A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT” requires a recorded actual code fault and failing test;
“A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS” requires an independent reviewer.
This is the individual selected-item test PR decision; whole Release testing → Sprint review awaits all selected
independent coverage. A write-tests job has no implementation first-red requirement. Manual commits/reviews are not
Agent M automatic draft/check correction rounds.

Exactly one52-line new MOD-desktop-shell-named release test, TST-268901, is added; test blob
`02b0e168f54538d35e547369195f72f54d88905e`. Original source base is merged268
`91146a9759de023b9597e3f89d4ce667693ff4d8`. Its writing commit names unreleased/developer-terra-e/gpt-5.6-terra.
Actual guarded source history identifies Terra-A/Terra-C for shell, Terra-A for HTTP/jobs and Terra-C for endpoint calls;
E and predecessor E implemented none of it. This reviewer wrote neither guarded source nor this new test.
No source/helper/old-test/workflow/package/accepted-contract/declaration/selection changes.

## Actual caller, failure node and restoration

TST268901 lines20–27 declare empty private folder/real public composition/controlled own-model endpoint precondition,
unpaired/foreign-origin/paired input, refusals before dispatch, exact single short request and transient-key boundaries.
Actual flow: test:38 starts `compose.mjs:6 → serveBridge` with loopback/configured origin/private folder/public
jobHandlers; test:43–45 observes401/403 and no endpoint request. Paired test:46 request reaches
`bridge-http/server.mjs:20/:27` origin/token guards, `:37` typed body validation, `:38–40` handler lookup/dispatch.
`bridge-jobs/handlers.mjs:17–21` maps body.args once to EndpointConfig and calls public testEndpoint;
`endpoint-calls/index.mjs:36–43 → :59–64` builds one `/chat/completions` request, Authorization credential,
max_tokens1 and “Reply with one word: ok.”. Controlled endpoint captures actual received bytes at test:31–35.
Test:47 verifies200; :48 verifies exact `{ answer: { works: true, model: "small" } }`, preserving the protocol wrapper;
:49 verifies exact single arrival/request. Test:50 inspects the only retained pairing-token file for the key;
:51 checks captured logs for key/baseURL. compose/handler retain no endpoint setting/export/repository data.

Independent exact-head command:
`node --test tests/release-itm-268-desktop-shell.test.mjs tests/desktop-shell-endpoint-composition.test.mjs tests/bridge-jobs-endpoint-test.test.mjs tests/bridge-http.test.mjs`:
20pass,0fail/skip/TODO/cancel. Real public composition/default handler/socket and controlled loopback endpoint run;
no paid provider or native Electron call. Log `/private/tmp/p268r-independent-positive.log`.

Then independently executed the recorded source fault in disposable exact-head archive
`/private/tmp/po-sol-268r-proof-lbnhn8x2`: compose jobs:jobHandlers() → jobs:{}.
Actual lookup at server:38 has no handler, :39 returns404 before endpoint dispatch. The new test fails at its own
paired guard :47: actual404, expected200, 0pass/1fail/0skip; fault exit1, log
`/private/tmp/p268r-independent-fault.log`. Exact restoration preserves compose blob
`04986a73ed6e23112d0db46668874d39e858eb2f`; restored new case1pass/0fail/skip/TODO/cancel, exit0,
`/private/tmp/p268r-independent-restored.log`. No PR/worktree source or assertion was modified.

## Complete current CI and decision

Complete6990-line actual run https://github.com/akmaier/agent-m/actions/runs/37900657382 was independently read,
including every Node outcome: exact bebcd1f, both jobs SUCCESS. Node1014total/1006pass/0fail/8existingTODO,
0skip/0cancel; Python399runOK,5skips/6expected failures. New TST268901 passes. Complete log
`/private/tmp/p268r-full-ci.log`, SHA256 `bd498b5b1becfb96169d49db22c11077342deb3b3554fd82d4dd01872a136418`.
Live PR before decision remains OPEN, base sprint/16, unchanged bebcd1f and both full checks SUCCESS.

Approve only this unchanged independent selected-item test head after recording this review. Root alone publishes
the record/PR decision and performs the exact full-green merge. Literal backslash-newline PR formatting is corrected
by root without changing review scope. Ordinary UC003 browser endpoint route remains direct; this is explicit accepted
alternative2a own-model-server composition. No browser HTTPS measurement, full UC003/044 delivery or sprint closure is
claimed. Whole selected-release gate remains separate. Reviewer writes only this new immutable gate/local decision,
with no external comment/push/merge or acceptance of human-owned artifacts.

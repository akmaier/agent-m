# Development → Release testing — PR228

**REGISTER**

Decision: **REJECTED** solely at617358a74d03087fded347dc00478a9ad432487c into sprint/15.
Participant: po-sol; model: gpt-6.1-sol. Taken: 2026-10-08 14:18:30 UTC. Decision: 2026-10-08 14:21 UTC.
Job: JOB-20261008-1418-cbb6, independent review1, originating JOB-20261008-1333-d529 fixed limit3.
PR: https://github.com/akmaier/agent-m/pull/228

## Original acceptance, scope and provenance

Original AGENTS/SPEC readings remain unchanged at7e8f20ca35cd48a5250d143b07a469d46986f123 and
1de56e76de63bfe5f3f4bb98820adad801041def. Current item263/Sprint15/source and deciding jobs, Team2 process/
participants/pinned scrum-wip, original accepted UC003, MOD-bridge-client/bridge-http/ARC040, existing callers and
related tests were reviewed. Accepted client remains c1605d3972e8a38f8a282acfbbb64223e9b7b617. Its selected pair/probe
interfaces and applicable named errors apply; no remote provisioning, agent driver or broader client functions are added.

Actual merge-base diff adds only src/bridge-client/index.mjs and seven cases in its new module-named unit test.
First tests-only e05da5dc7956f41c09fe0575582c59d4b4f53193 had actual red CI37785978278 Node113340711247:
ERR_MODULE_NOT_FOUND at the public client import; Python succeeded. Red completed13:39:39 before production
fcd7dac3 at13:41:49. All three writing commits name unreleased, developer-terra-b, gpt-5.6-terra.
617358a ordinarily merges approved sprint base6fdda57; source bytes equal fcd7dac and inherited artifacts keep their
actual writing provenance. SPEC's generated-artifact attribution does not require a new attribution writing commit
for unchanged inherited bytes. Source author's reported2/3 correction accounting and fixed limit3 are retained, not reset.
No helper, old assertion, direct browser endpoint flow, settings parser, SPEC/UC/architecture or process changes.
I implemented none of this behavior/tests; E remains independent for later release coverage.

## Closed paths and seven independent counterproofs

Public bridgeAt stores only the Bridge's own token/login privately in its WeakMap handle, as the accepted Bridge type
requires. Endpoint configuration is a transient probe argument, JSON {args} at104, sent only to the Bridge-derived
address63 with token/login headers49–53; no endpoint driver import, logging, repository write or endpoint settings
persistence exists. The Bridge success/diagnosis answer is unwrapped unchanged. Missing token is checked before fetch;
HTTP token/login refusals and accepted protocol errors remain distinct from an unreadable response.

Exact-head disposable archive: /private/tmp/po-sol-228-m6l9z9tg. For each CASE: node --test --test-name-pattern
TST-263NNN tests/bridge-client.test.mjs. Actual positives precede mutations; failure nodes inspected; exact byte restore
rerun. proofs.json and21 logs record all seven0/1/0 sequences; final all-restored run passes seven,zero failures.

| CASE | Relevant planted fault → actual test failure node | Exits |
|---|---|---|
| 263001 | Serialise args instead of {args} →44 body comparison | 0/1/0 |
| 263002 | Omit Basic login header →63 undefined versus expected header | 0/1/0 |
| 263003 | Drop copied pairing token →79 actual TokenMissing prevents required successful pair | 0/1/0 |
| 263004 | Misname missing-token failure →94 actualNoAnswer versus TokenMissing | 0/1/0 |
| 263005 | Misname token refusal →105 actualBridgeFailed versus TokenRefused | 0/1/0 |
| 263006 | Disable login-refusal branch →115 actualTokenRefused versus JumpHostLoginRefused | 0/1/0 |
| 263007 | Discard Bridge message →128 actualinvalid-request versus model is required | 0/1/0 |

All restored client bytes equal617358a; no mutant is committed. Author's current body accurately records seven proofs.

## One original named-error finding

Accepted MOD-bridge-client:98 defines Timeout as a request receiving no answer in time. Pair:100–103 explicitly fails
with Timeout; probe:137–146 fails with every BridgeError except AskFailed. Item263 Acceptance requires each applicable
accepted error. Current seven cases supply no Timeout guard, and the public client has no Timeout result path.

Failure path: pair:94 or probe:104 → call:67 fetch → catch:68–70 unconditionally constructs NoAnswer. Controlled
public calls first return known-positive success for both operations; ordinary TypeError unreadable-fetch failures
correctly return NoAnswer. An explicit constructed DOMException('The request timed out','TimeoutError') at the same
fetch node also returns NoAnswer for both, expected Timeout. timeout-diagnostic.log records all six outcomes.
No transport deadline/signal or distinct timeout mapping is supplied, so the applicable category is not delivered.
This finding imposes no timeout duration, public parameter, new protocol route or architecture change.

Correct the existing applicable named Timeout behavior and guard it meaningfully, preserving other error categories,
original history and fixed limit3. Do not change the direct-browser flow or add unselected client features.

## Exact CI and disposition

Current live head/body and full CI37791004105 independently read: exact617358a, Node983 tests,975 pass,zero failures,
eight TODO,zero skips; Python398 tests run,OK with five skips and six expected failures. Current inherited checker
integration is already independently approved230a. Green CI does not detect the missing Timeout category.

Development → Release testing is rejected solely for that original finding. Independent release263 and remaining
selected work still follow; no full UC003 or Sprint15 closure is claimed. Root alone merges a later independently
approved unchanged exact green head. Reviewer writes only this gate/comment: no source/test/job edit, push or merge.

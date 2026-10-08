# Development → Release testing — PR228 correction

**REGISTER**

Decision: **APPROVED** solely at c73023040f1d01d2b0301c8eb7009068dda31775 into sprint/15.
Participant: po-sol; model: gpt-6.1-sol. Taken: 2026-10-08 14:57:49 UTC. Decision: 2026-10-08 15:01 UTC.
Job: JOB-20261008-1450-e8d4, independent correction review; originating JOB-20261008-1333-d529 parameter limit3 retained.
PR: https://github.com/akmaier/agent-m/pull/228

## Original scope and prior evidence

Original AGENTS/SPEC pins 7e8f20ca35cd48a5250d143b07a469d46986f123 and
1de56e76de63bfe5f3f4bb98820adad801041def remain unchanged. Current263/Sprint15/jobs, accepted UC003,
MOD-bridge-client/protocol/ARC040 and actual public callers were reviewed. The original accepted client
c1605d3972e8a38f8a282acfbbb64223e9b7b617 names Timeout at98, pair103 and probe144–146.
The complete228a review and seven independent CASE0/1/0 proofs remain evidence for unchanged closed paths;
232a separately approves the whole-check integration. Neither is replaced by CI alone.

Merge-base PR diff remains only src/bridge-client/index.mjs and its new module-named test. The correction adds
finite full-request handling and CASE263008; original seven cases retain their assertions. Ordinary writing commits
name unreleased, developer-terra-b and gpt-5.6-terra. Ordinary c730 integrates approved checker/sprint history;
inherited artifacts retain their actual writing provenance. Original tests-only e05da5dc and its actual missing-module
red CI37785978278 remain preserved. No helper, old expectation, public API, direct-browser endpoint route,
SPEC/UC/architecture or process change. I implemented none of this behavior or its tests.

## Sole228a finding resolved at the actual node

Public pair/probe → call:63 → finite AbortSignal.timeout:66 → fetch:70 and answerJson:71 inside the same try →
catch:72–75 now maps TimeoutError to BridgeError Timeout while ordinary unreadable transport remains NoAnswer.
answerJson:59 awaits response.text, so response-body timeout reaches this mapping too. Endpoint args remain transient
{args} to the Bridge-derived address; private Bridge credentials, no logs/storage and protocol answer mapping remain unchanged.

Exact-head disposable archive: /private/tmp/po-sol-228b-uy7vnjxr. New TST-263008 independently executed with
node --test --test-name-pattern TST-263008 tests/bridge-client.test.mjs: known positive → move answerJson outside
the mapping try → exact byte restoration, exits0/1/0. Fault failure at test:154 is the raw TimeoutError from
response.text instead of named BridgeError Timeout. positive/fault/restored.log and proofs.json preserve execution.
Full restored module test passes all eight cases,zero failures. Restored source SHA1 is
71d3dc365b57456f38633b3926f7c4d1b2ab3673, identical to exact c730 source; no mutant commit.

Additional controlled public-call diagnostic first proves pair and probe success, then exercises both fetch and
response-body pending promises rejected by their actual native signal expiration. Both operations yield Timeout
at both stages; ordinary TypeError still yields NoAnswer. The diagnostic temporarily returns a short native signal
from the timeout factory while verifying all eight source requests pass the positive finite value15000; it restores
the factory afterward. finite-diagnostic.log records results. This verifies active full-request signal use without
adding a required duration or new public parameter.

## Exact CI, evidence and disposition

Live PR body/head and CI37795481869 independently read at the unchanged exact head. Node:993 tests,985 pass,
zero failures,eight TODO,zero skips. Python:399 tests run,OK with five skips and six expected failures. Both jobs
succeed. Current body accurately records final head, actual CI and body-read fault/restoration evidence.

The original applicable Timeout deficiency is closed; no remaining original acceptance finding. SPEC812–843's
automatic draft/check loop and accepted job-catalogue checks/reviewers apply in their stated scope; manual commits
and separate Scrum gates are not automatic rounds. The recorded parameter/history is retained without reset or
invented exhaustion. Independent release263 still follows; this is not full UC003 or Sprint15 closure.
Root alone may merge this exact unchanged green head. Reviewer writes only this gate/decision: no source/test/job
edit, push or merge, and no architecture acceptance on the human's behalf.

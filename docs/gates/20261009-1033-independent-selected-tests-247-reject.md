# Independent selected browser-store release tests — PR247

**REGISTER**

Decision: **REJECT** solely at `44d5d493f4cd6fb5a44f0ce82abb4c982b6411d7` into `sprint/16`.
Decider: po-sol. Job: JOB-20261009-0923-p279r (ongoing); writing job JOB-20261009-0704-d279r; item ITM-279.
Actual Taken: 2026-10-09 09:25:49 UTC. Decision: 2026-10-09 10:33:25 UTC.
PR: https://github.com/akmaier/agent-m/pull/247

## Original scope and applicable rules

Read original published Start before isolated worktree. Personally retained full AGENTS/SPEC/README/Team2/pinned-model
reads after unchanged-pin verification: AGENTS `7e8f20ca35cd48a5250d143b07a469d46986f123`, SPEC
`1de56e76de63bfe5f3f4bb98820adad801041def`, README `37284376636ddf07efa58b63be4ff8a2ea12300a`,
process `eb772d456a24c145fe3f98778509f207e34e172d`, participants `aba8b680f7df66e2807701294c960a3c29fb0148`.
Read current Sprint16, original item/writing job, original accepted MOD-browser-store and UC003/044, source238a/b records,
actual store/list callers and same-scope tests. UC003/044 pins remain `82081a084479172f2f8f704211351b052edea8e6` /
`6c80417a691b105488b2426c25245ae7f39a33a7`. Reviewed original MOD-bridge-client Interfaces for its owned JumpHost type.
AGENTS §6a: “First read the existing, working caller — then probe”; §2 requires actual/expected failure-path evidence.
SPEC “A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS” requires declared input/precondition/result;
“RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER” and “A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS”
require independent writer and decider. This write-tests job has no implementation first-red condition.

Only one new19-line MOD-browser-store-named release test file, four declared cases, differs from its prerequisite.
No production/helper/old-test/expected-outcome/accepted-document/selection/declaration change. Authorship commits/source
records identify B for endpoint/jump-host/listing and predecessor Sonnet-A for core store; neither D/predecessor D nor
this reviewer authored guarded source. Writing commit identifies unreleased/developer-terra-d/gpt-5.6-terra.
A's dashboard caller is separate. This is an individual selected-item release PR decision, not aggregate Sprint review.

## Concrete contract finding and disposition

Accepted MOD-browser-store Data defines jump-host `{ hostname, user, sshPort, portRange, httpsAddress?, login? }`.
Its JumpHost type owner MOD-bridge-client Interfaces78–79 defines login as optional `{ user: string, password: string }`.
New release file9 instead supplies `host.login = "private-web-login"`; R2 line15 supplies `"other-login"`.
Public `writeSetting` index34–36 → JSON.stringify → setRaw → prefixed localStorage stores this arbitrary string;
R1 line13 rereads the same string and therefore passes without exercising the accepted nested optional login shape.
R3 line17 uses `JSON.stringify(info).includes(host.login)`, which checks its string fixture; merely changing login to
an object would coerce it to `[object Object]` and would not guard its password value. Existing source unit fixture also
uses a string, but that precedent does not change the original type. No old test or accepted contract edit is requested.

Required narrow correction: only this author's new test fixture inputs use the accepted login object and its secret
exclusion guard checks the actual credential value(s). Preserve four cases, declared outcomes, public caller boundary,
guarded source and existing expectations. Recorded relevant four code-fault/restoration proofs remain to be verified
on the corrected exact head, followed by complete current full green CI and the same ongoing-job independent review.
No new case/per-assertion mutation quota, source validation feature or architecture/SPEC change is required.

## Observed positives and complete CI

Independent exact-head new4 + existing17 store cases:21pass,0fail/skip/TODO/cancel. This known positive verifies actual
working public callers, not acceptance of the mistaken fixture contract. Log `/private/tmp/p279r-independent-positive.log`.
Read complete7050-line https://github.com/akmaier/agent-m/actions/runs/37910923602 at exact44d5d493, bothSUCCESS:
Node1024total/1016pass/0fail/8existingTODO,0skip/0cancel; Python399OK5skips/6expected failures.
Complete log `/private/tmp/p279r-initial-full-ci.log`, SHA256
`2cad4c28056dcc5e8be4d359b957a5da246dbfd97e8d5c4bb21562f05e83b00a`.
These green outcomes are retained as observations and do not resolve the contract coverage finding.

REJECT this exact head: no merge permission. Root publishes this immutable record/decision, then the author corrects
only the new fixture/secret check and supplies a new current head for manual re-review under the same job. No job End,
automatic correction-loop reset, native launch, external write or guarded-source/test mutation is performed by the PO.
Human publication authorization is resolved; this rejection concerns only the concrete release-test contract evidence.

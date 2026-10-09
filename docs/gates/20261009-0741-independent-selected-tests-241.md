# Independent selected native release tests — PR241

**REGISTER**

Decision: **PASS / APPROVED** solely at `0608d5cdee4e9a292204d4920edc9c622971e22f` into `sprint/16`.
Decider: po-sol. Taken: 2026-10-09 07:37:44 UTC. Decision: 2026-10-09 07:41:15 UTC.
Job: JOB-20261009-0735-p276r. Guarded item: ITM-276. Writing job: JOB-20261009-0651-e276r.
PR: https://github.com/akmaier/agent-m/pull/241

## Original authority and independent scope

Retained prior full original AGENTS/SPEC/README reads after verifying unchanged binding blobs
`7e8f20ca35cd48a5250d143b07a469d46986f123` / `1de56e76de63bfe5f3f4bb98820adad801041def`.
Read new original job/item, source gate237a, ARC-050, MOD-desktop-shell, UC-044/UC-003 and actual production caller.
Original Team2 declaration/participants remain `eb772d456a24c145fe3f98778509f207e34e172d` /
`aba8b680f7df66e2807701294c960a3c29fb0148`; pinned scrum-wip remains
`ef33e2f501289930960f13b55936e9b557003993`. Existing same-scope HTTP/jobs/client/endpoint/frame/direct-system/release
context was read in the preceding review; native desktop-shell component file remains exact previously read
blob `76666668c830f621fffd336edc1879e50d5301b1`.

AGENTS §6a says “First read the existing, working caller — then probe”; §2 requires the concrete data-flow/failure path.
SPEC's “RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER” requires independent release authorship;
“A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS” requires readable precondition/input/expectation;
“A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT” requires recorded code fault and failing result.
“A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS” requires an independent decider.
The individual selected-item test PR review follows recorded235a; the whole Release testing → Sprint review gate follows
all selected release coverage. No implementation first-red condition is imposed on this write-tests job.

The merge-base diff adds only155-line `tests/release-itm-276-desktop-shell.test.mjs`, one new release-level TST-276901
naming MOD-desktop-shell and guarded use cases/requirements. Writing commits identify unreleased, developer-terra-e
and gpt-5.6-terra. Guarded source history identifies Terra-C for desktop-shell, Terra-A for Bridge HTTP and
Opus-B/Sonnet-C/Terra-C/Terra-D for frame; neither E nor predecessor E implemented this guarded behavior.
This PO authored none of guarded source or this test. No source, existing test/helper, package, workflow, accepted
contract, declaration or selection changes. Source prerequisite is merged `82d0814533c6fb60d410f1084250fa10ee0f8752`.

## Native path and actual counter-proof

TST-276901 declares fork identity/empty private folder precondition, actual renderer inspection and real pairing input,
and fixed preload/no Node globals/fork-local page/loopback/configured-origin result before running.
Its fixture follows existing desktop-shell.test.mjs: temporary Electron44.5.1 acquisition, actual executable launch,
finite CDP/exit waits, Linux Xvfb and Openbox supervision. A concurrent Openbox apt lock is accepted only after the
bounded actual openbox --version readiness probe succeeds; other failures throw, with no fake runtime or success skip.

Test `:100–115` launches actual `src/desktop-shell/main.mjs` with CLI instance `release-fork/paired-bridge`, origin and
controlled ports/folder. `main.mjs:40–48` starts Electron and isolated BrowserWindow, `:27–36` provides confined own-file
protocol and fork page identity, `preload.cjs:2` exposes only the seven fixed IPC controls. `main.mjs:78 → compose.mjs:5
→ serveBridge` starts the real loopback API, `main.mjs:51 → preload.state → window.mjs:5–22` renders its actual address.
The test `:147–150` observes exact fork page, fixed sorted controls, undefined process/require and actual loopback
address. `:151–153 → server.mjs:20/:27/:29` uses the private token to receive200 for configured origin and403 otherwise.
Quit cleanup uses the real renderer control, IPC app.quit and server shutdown/actual process exit.

Independently ran unchanged exact PR head: `node --test tests/release-itm-276-desktop-shell.test.mjs` on the real
Electron44.5.1 macOS fixture: 1pass,0fail/skip/TODO/cancel,0.964s. Log `/private/tmp/p276r-independent-positive.log`.
Then used disposable archive `/private/tmp/po-sol-276r-proof-vfe8eb22` for the recorded source fault, changing only
compose host127.0.0.1 to0.0.0.0. Actual path is `main.mjs:78 → compose host → server.mjs:12 BindRefused` before
`currentToken` at `:13`; the real own-file page still opens with the startup refusal. The new test fails at its own
private-token precondition `:144`, via wait `:22`: “Timed out waiting for real Electron.” (30.97s), 0pass/1fail/0skip.
It does not reach the displayed-address assertion at148. The PR/test comment's nearby displayed-loopback label is
imprecise; this record supplies the actual failure node without weakening the expected result or inventing another
required fault. Fault log `/private/tmp/p276r-independent-fault.log`.

Exact restored compose blob `ab58edaab04f7e09ea00cf52c5815e4519be37ca` matches the PR source. Restored archive positive:
1pass,0fail/skip/TODO/cancel,0.600s; `/private/tmp/p276r-independent-restored-exact.log`. An earlier reviewer restoration
command ran git show from the archive without.git, temporarily emptying only its disposable compose; its startup failure
is excluded from this counter-proof. Restoration was corrected from the actual PO checkout and hash-verified before
the recorded restored run. PR/source checkout bytes were never mutated. Final test blob is
`86df6386d509587d4644d49222925319f03cd2af`; main blob `0b35d38ec84c04bfc7cc90fa5e0b283375a4e239` matches approved source.

## Complete live CI and disposition

Read all6984 downloaded final CI log lines and all1013 Node outcomes; no non-TODO failure. Actual exact-head run
https://github.com/akmaier/agent-m/actions/runs/37899469620 has both jobs SUCCESS: Node1013total/1005pass/0fail/8existingTODO,
0skip/0cancel; Python399runOK,5skips/6expected failures. New TST-276901 and all six existing native component cases pass.
Node47s/Python62s reported durations fit the two-minute budget. Complete log `/private/tmp/p276r-full-ci.log`, SHA256
`f47b578cf086837120775f740b768c79b9460bc47bcfe845605d8cffa7f04a83`. Live PR remains OPEN, base sprint/16,
unchanged exact0608d5c, both full CI jobs SUCCESS immediately before decision.

Approve only this unchanged independent selected-item test head after publication of this record and exact-head PR
review. Root alone publishes/corrects the proof wording and performs the green exact-head merge. Whole selected-release
coverage/Sprint review remain separate. This test proves the native source-folder fork/private-preload/loopback/pairing
slice; no signed distribution, updates, agents, tunnels, jobs, mail, browser HTTPS or full UC-044/UC-003 delivery claim.
Manual work/Scrum reviews are not automatic draft/check correction rounds. Reviewer commits only this new immutable
record, with no external comment/push/merge or acceptance of human-owned artifacts.

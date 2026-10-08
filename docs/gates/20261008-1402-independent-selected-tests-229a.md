# Independent selected-item tests — PR229

**REGISTER**

Decision: **APPROVED** at a947013fec4f112f2cd5d6f21b482d134cbf3c7e into sprint/15.
Participant: po-sol; model: gpt-6.1-sol. Taken: 2026-10-08 14:00:42 UTC. Decision: 2026-10-08 14:02:32 UTC.
Job: JOB-20261008-1359-6efb; review round1 of fixed limit3.
PR: https://github.com/akmaier/agent-m/pull/229

## Original scope, provenance and independence

Original AGENTS/SPEC readings remain pinned at7e8f20ca35cd48a5250d143b07a469d46986f123 and
1de56e76de63bfe5f3f4bb98820adad801041def. Current items262/278, Sprint15, implementation and deciding jobs,
Team2 process/participants/pinned scrum-wip, affected accepted UC003/020 and module originals, existing callers/tests,
source gates225a/226a, full three-file diff and current PR evidence were reviewed. SPEC:1411 requires the executed
per-case fault proof;1418 requires another release-test author. The model's selected-item release condition is
independent release tests green on the sprint branch; this partial test merge contributes evidence without closing it.

One ordinary commit adds only three new module-named test files, each with one CASE and one declared system/release
level, readable precondition/input/expected result. It names unreleased, developer-terra-e and gpt-5.6-terra.
Source, shared helper, old tests/expectations, SPEC/UC/architecture and process remain byte-inherited from0af391e.
E, including predecessor Sonnet-e, implemented none of the A/D behavior guarded here; I implemented neither that
behavior nor these tests. No first-red obligation is added to this tests-only writing job.

## Actual covered paths and limits

System test calls actual openDashboard #spec → legacy currentRequirements:23 public trace Route.render → pinned
Host.readSnapshot/current SPEC → parseSpec/renderArtifact → section and row controls. It proves outside-section
requirements, both section names, fresh hidden tables, first-section open/close/reopen with second-section isolation,
and first requirement detail open/close/reopen. The release test repeats public controls with token and without one,
checking both recorded write requests and server.writes remain empty. Existing queue/parser/sanitisation guards remain.

The tests supply standard removeAttribute on their rendered fake table locally; shared helper bytes are unchanged.
Assertions establish DOM hidden/detail state, not native browser geometry or CSS sanitisation. Root separately reports
actual IAB preview at D's approved module:17 hidden section tables with initial zero geometry, selected heading opening
while another remains hidden, detail1/0/1 and reload reset. That browser evidence is not presented as this unit DOM's proof.

262 release calls real serveBridge on127.0.0.1 with jobHandlers()'s actual production default → existing Node
endpoint-calls testEndpoint. Node http.request reaches the loopback server; only the provider fetch is replaced by
constructed responses. A missing token is401 before dispatch with zero provider calls; paired success invokes exactly
one call with model/key mapping and no key in its URL. A second paired request preserves the refused-key diagnosis
and adds exactly one provider call. No paid endpoint, desktop app or full UC003 alternative2a is claimed.

## Independent per-CASE executed counterproofs

Disposable exact-head archive: /private/tmp/po-sol-229-c9593lfk. Each command is node --test <new file>.
Each known positive precedes its mutation; failure nodes were inspected and source restored byte-identically.

| CASE | Relevant fault → actual guarded failure | Positive/fault/restored exits |
|---|---|---|
| ITM-278-SYSTEM-01 | Omit initial hidden attribute at flow.mjs:63 → system test:58, actualfalse versustrue | 0/1/0 |
| ITM-278-RELEASE-01 | After actual public rendering call productHost.commitFiles with valid typed files/current expectedHead → release test:56, actual write tree/commit/ref versus[] | 0/1/0 |
| ITM-262-RELEASE-01 | Await actual Node endpoint call but corrupt returned model → release test:59, actualfault versussmall | 0/1/0 |

Initial sandbox loopback execution failed EPERM before its known positive, so it establishes no product finding.
The permitted loopback-only rerun supplies the recorded jobs-allowed positive/fault/restored proof. Dashboard fault
proofs preserve the real module path and valid write transport; no discarded-object fake write is used. proofs.json
and individual logs retain the execution. All three mutated source files equal the exact head after restoration;
no fault/source/test/helper edit is committed by this reviewer.

## Exact CI and merge disposition

Live PR body/head and full CI37788267890 independently read: exacthead unchanged, Node SUCCESS,
976 tests,968 pass,zero failures,eight TODO,zero skips; Python SUCCESS,397 tests run,OK,five skips,six expected failures.
Current body correctly states397 run rather than397 passed and records all three author counterproofs.

Approve only this unchanged partial test PR. Independent release work for other selected items and the final declared
Release testing → Sprint review / Retrospective → Sprint planning gates remain. Root alone merges the approved exact
head with live full green CI. This decision neither closes Sprint15 nor accepts architecture or a complete UC020/003.

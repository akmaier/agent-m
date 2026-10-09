# ITM-286 source gate

**MEASUREMENT**

Decision: HOLD / reject Development → Release testing for PR265 head
`8a9baabad02126be72651d3b3a7ead8392d65a54`. No source merge is approved.
Decider: po-sol, gpt-6.1-sol, independently of developer-terra-a/gpt-5.6-terra.
Job: JOB-20261009-1951-p18t; published Start blob `125cb30f41ec5ddbc1aba92a8e4b71fe8805d774` at main
`241f7dcacd2b80e5fd8f518771b691e935d47d1c`.
Actual Taken: 2026-10-09 19:53:20 UTC, clock, after reading the published original Start.
Decision at: 2026-10-09 20:00:26 UTC, clock.
Isolation: `.agent/worktrees/agent-po-sol-tunnels-18`, `codex/p18-tunnel-source-gate`, from that main.
Usage/cost: null/null. The implementation job remains open for correction.

## Contract failure and required correction

Accepted MOD-tunnels, Interfaces, states: “It refuses a plan whose bind address on the jump host is not its
loopback, with `NotLoopback`.” ITM-286 Outcome states: “Reject non-loopback plans with NotLoopback.”
The refusal applies to the plan; neither accepted text limits it to reverse plans.

Actual path: `src/bridge-client/tunnels.mjs:38–40` → canonical direction/bind plan fields →
`src/tunnels/index.mjs:122` `openTunnels` → line127 tests `plan.direction === "reverse"` together with the bind →
forward bypasses refusal → lines130–133 register an opening forward and call `reconnect` → line111 initiates SSH.
The actual runtime still binds its forward listener and destination to loopback (lines99/106); this finding concerns
the required named refusal of an invalid plan, not a demonstrated non-loopback listener.

After the real forward-byte known positive TST-286004, the exact unchanged production module was called with a controlled
forward plan, `bind: "0.0.0.0"`, a dynamically reserved then closed loopback SSH port and a temporary data folder.
Expected at the failure node: `NotLoopback`, no registered tunnel. Actual: no error and
`[{"name":"forward:127.0.0.1:46002","kind":"forward","state":"opening","reason":null}]`.
The same probe's reverse control produced `NotLoopback` and `[]`. Complete actual caller and output are retained at
`/private/tmp/p18t-forward-bind-probe.mjs` and `/private/tmp/p18t-forward-bind-probe.log`.

Correction: enforce the accepted non-loopback refusal on both plan directions and guard the actual forward refusal
in the owned module tests. Preserve accepted interfaces and the already positive forwarding behavior. This is an
implementation correction of the existing contract, with no SPEC, use-case, architecture or process change.
A new exact corrected head, its same-case relevant fault/restoration evidence and complete green Linux CI require
another independent decision. No per-assertion quota or new architectural obligation is added.

## Original reads and accepted input pins

Personally read full originals of AGENTS.md, SPEC.md, README.md, the Team2 declaration/participants/pinned model,
Sprint18 and ITM286, the actual source Start, affected entire UC003/011/044 and ARC040/052 and
MOD-tunnels/bridge-http/bridge-client. Read the actual ensureKey, canonical plans, authenticated HTTP route,
Bridge client, existing desktop composition and source entry before probes; inspect only, do not run the desktop.
Personally read same-scope old key, key-release, plan, plan-release, Bridge-client/HTTP, state-route/release and
legacy command cases. No other agent's summary substitutes for those originals. The textbook register and
chapter13's original Test-Driven Development passage were consulted for chronology interpretation.
The eight affected UC/architecture/module pins below each have an actual matching approval record, verified in
`/private/tmp/p18t-accepted-pins.json`. The declared model commit remains ef33e2f501289930960f13b55936e9b557003993.

| Original | Git blob read |
|---|---|
| AGENTS.md | 7e8f20ca35cd48a5250d143b07a469d46986f123 |
| SPEC.md | 1de56e76de63bfe5f3f4bb98820adad801041def |
| README.md | 37284376636ddf07efa58b63be4ff8a2ea12300a |
| docs/process_team2.md | eb772d456a24c145fe3f98778509f207e34e172d |
| docs/participants_team2.md | aba8b680f7df66e2807701294c960a3c29fb0148 |
| docs/process-models/scrum-wip.md | 72fdea87d0c468ffcd53ae3a6d564623c686e22d |
| docs/backlog/sprints/18.md | 4baa3e2dc03985871e9d74976d91b48c1de41df7 |
| docs/backlog/ITM-286-the-bridges-automatic-tunnel-runtime.md | a72531b3b3567c085a00990294c048f4452b400a |
| docs/use-cases/UC-003-configure-a-model-endpoint.md | 82081a084479172f2f8f704211351b052edea8e6 |
| docs/use-cases/UC-011-hand-a-job-to-a-local-cli-session.md | 982753a5278bdcb9e0f895d30d1cc274fe2ba80f |
| docs/use-cases/UC-044-install-and-pair-the-bridge.md | 6c80417a691b105488b2426c25245ae7f39a33a7 |
| docs/architecture/ARC-040-the-bridge.md | 603620210312a514d004a58887157c04dbafe8c6 |
| docs/architecture/ARC-052-ssh-in-the-bridge.md | 3fee08bacbb70bd95ecdfac91417f06f9a07d95c |
| docs/architecture/MOD-tunnels.md | 0d7ed13e3e793bf081636b53c1ae64c7f15485f9 |
| docs/architecture/MOD-bridge-http.md | 2792f1d3a1a66eec9750fac85949ee78874e2956 |
| docs/architecture/MOD-bridge-client.md | c1605d3972e8a38f8a282acfbbb64223e9b7b617 |

## Source, tests and own fault evidence

PR scope is exactly `src/tunnels/index.mjs` and new `tests/tunnels-runtime.test.mjs`, owned by MOD-tunnels.
The existing ensureKey behavior and old test bytes are retained. Production paths reviewed include
hostVerifier63–72 → first-trust file/changed-key refusal before ready/forwarding, reverse ready93–96 → forwardIn,
tcp-connection84–89 → Bridge loopback bytes, forward99–106 → forwardOut bytes/listener,
failEntry113–119 → reason/independent growing waits, close137–139 → closed flag/timer/listener/client teardown,
and handler143 → actual supplied authenticated HTTP state route. The shell composition currently supplies jobs alone;
this gate does not claim it composes tunnel controls.

Selected baseline command, from disposable exact-head archive `/private/tmp/p18t-exact-8a9baab`:
`node --test --test-reporter=tap tests/tunnels-runtime.test.mjs`.
Actual 10/10 pass, 3302.287625ms. Each case establishes the real ssh2@1.17.0 loopback dependency positive before
its production call. The first sandboxed attempt was denied loopback with EPERM; it is retained at
`/private/tmp/p18t-baseline.log` as an environment attempt, not a product red. The allowed loopback rerun is
`/private/tmp/p18t-baseline-loopback.log`. No broad/local/native suite ran.

Each of the ten final cases independently received the following production-only fault, failed its SAME case,
then passed after restoration of exact original source bytes. Tests were unchanged. Full bounded commands,
statuses, logs, source/test hashes and original/fault replacement bytes are in `/private/tmp/p18t-faults.py` and
`/private/tmp/p18t-own-faults.json`; each complete output is `/private/tmp/p18t-TST-286NNN-fault.log` or
`/private/tmp/p18t-TST-286NNN-restored.log`.

| Case | Relevant production fault | Actual failure node | Exact-restored same case |
|---|---|---|---|
|286001|reconnect registers failed instead of opening|exact public state differs|PASS|
|286002|remove bind refusal|status0 instead of NotLoopback|PASS|
|286003|transform reverse reply to wrong|bytes=wrong|PASS|
|286004|transform forward reply to wrong|Error: wrong|PASS|
|286005|accept changed host key|a forwarding request occurs|PASS|
|286006|port collision maps host-unreachable|forward state has wrong reason|PASS|
|286007|auth refusal maps host-unreachable|auth state's reason differs|PASS|
|286008|keep reconnect wait constant|growing gap assertion fails|PASS|
|286009|do not close refused socket|refused client stayed open|PASS|
|286010|handler returns fault object|actual authenticated HTTP body differs|PASS|

Final restored source SHA-256: `6be4487bc1c7d3ae25785f2ce0d48b0303dc9479c749d330a5c960a0a6565eb1`.
Unchanged final test SHA-256: `9893f267c780153806267c4a3a7da8e00151d1b6878d1a42bc255db7ccaab76a`.
Own fault receipt SHA-256: `422a3290cabbaeab3fc0c1835550c4371b1892f0b346fa7f743abdf9a7d03328`.

The public active-stream close probe reused the actual forward-byte fixture pattern, proved byte delivery first,
then called closeTunnels without a source fault. At Promise return the client had not yet emitted end/close;
after200ms it had both, was destroyed, and zero fixture peers remained. Retain that honest asynchronous return
limitation at `/private/tmp/p18t-close-probe.mjs` and `/private/tmp/p18t-close-probe.log`; it is no unsupported
additional gate failure. TST286008 separately observes canceled reconnects and286009 the closed listener.

Canonical `testDeclarations → traceGraph → tracesTo` on complete actual CI tree c949f286 reads2013 tracked paths,
140 declarations,529 nodes/161edges/zero unread. All286001–286010 declare unit/MOD-tunnels/lowercase contiguous
fields/guards/given/input/expect and the numeric identifier first in the actual test title. Every new ID occurs once
in the entire current tested repository. Bridge-open guards reach001/003–010; reverse-loopback guards002/003.
Full actual parser/graph caller and receipt: `/private/tmp/p18t-trace.mjs`, `/private/tmp/p18t-canonical-trace.json`.
The positive declarations and real graph are evidence; their presence does not excuse the observed missing forward refusal.

## Complete Linux CI and chronology

Independently read actual completed run metadata and processed every line of the complete7446-line raw CI37983034628.
Actual conclusion SUCCESS: Node19:51:12→19:52:23UTC71s, Python19:51:12→19:51:56UTC44s, each within120seconds.
Both actual checkouts are `c949f28631c696d62cfd086a8285c86f836faf67`; parents in order
`9811ca04c06d67f99ce52715d476fffe6e7874c8` and `8a9baabad02126be72651d3b3a7ead8392d65a54`.
Tree `b76dced8bded92959e5c0be4861c5d53f3468cfc` equals the independently computed merge-tree of those exact parents.
The actual sprint base includes287/288/289 source and test files; this full run therefore tests their combined source
with286, not merely an older individual source tree. PR actual head/base metadata agree with those pins.
Node1085 total/1077pass/0fail/0skip/8TODO; Python399/388ordinaryOK/5skip/6expected failures.

The complete named outcome comparison preserves every1066 inherited Node outcome and every399 Python outcome
against corrected-tests-only22a299 product-red CI37977148415; zero missing or changed inherited outcomes.
The eight TODOs and five skips/six expected failures remain such, never promoted to ordinary pass.
Historical same-head Sprint17 native flips remain flaky under SPEC§12 A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY;
this later distinct green run does not erase them.

SPEC§11 AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST says: “The first commit of an implementation job that adds
or changes behaviour contains only tests, and the product's CI run on that commit is red.” Original first cca9fc9
is tests-only; actual CI37979053653 was created19:16:09UTC and finished19:17:17UTC, after implementation, and failed
before cases because ssh2 was missing. Corrected tests-only22a299's CI37977148415, created18:59:46UTC and finished
19:00:54UTC, contains real dependency positives and two actual missing-openTunnels failures and was inspected before
first source commit c7cb85ad at19:02:45UTC. These are distinct truths: eventual first-commit red satisfies the literal
first-commit/result condition; the source Start's instruction to inspect original-first red before implementation was
not followed. No retrospective claim of that timing is made. Earlier dad2e3 CI37976744186 fixture failures remain
retained and are not accepted product counterproof. Tests-only correction lineage is preserved rather than rewritten.

Commit provenance inspection finds the first four tests-only messages cca9fc9/7b319c3/3c18d52/dad2e3 lack model,
participant and Agent-M trailers;22a299 and subsequent source/final commits name them (older messages use Agent-M,
final384bf09/8a9baab use Agent-M-Version). The final head records developer-terra-a/gpt-5.6-terra/unreleased.
This historical provenance limitation is disclosed; no claim that every lineage message contains the trailers is made.

Complete raw receipts remain `/private/tmp/sprint18-ci37983034628.log`,
`/private/tmp/sprint18-ci37977148415-red.log`, `/private/tmp/sprint18-ci37979053653.log`,
`/private/tmp/sprint18-ci37976744186-fixture-failure.log`; complete per-name comparisons, raw hashes/checkout/totals
are `/private/tmp/p18t-ci-full-outcomes.json`. Actual status/PR metadata are `/private/tmp/p18t-ci-status.json`,
`/private/tmp/p18t-pr265.json`, `/private/tmp/p18t-first-ci-status.json`, `/private/tmp/p18t-red-ci-status.json`.
The author receipt `/private/tmp/a286-final-proof-receipt.md` and actual PR body
`/private/tmp/sprint18-a286-source-pr.md` were read and remain distinct from this PO's own execution evidence.

## Decision boundary

Hold the exact source head for the demonstrated accepted-interface failure. This record writes no source/tests,
changes no earlier gate, adds no architecture/SPEC/process/participant rule, closes no sprint and accepts no human
artifact. Root alone publishes this record/decision and handles later approved exact-head merges. This source decision
establishes no independent release test, shell composition, real-browser trusted HTTPS, full UC003 completion,
external deployment or tagged release. No local native/full/glob tests, Mac app/browser/UI/clipboard/settings/device
operations, personal folders, external/system SSH or paid endpoint was used.

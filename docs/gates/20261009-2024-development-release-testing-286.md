# ITM-286 corrected source gate

**MEASUREMENT**

Decision: HOLD / reject Development → Release testing for PR265 exact head
`e7e8745494f48578861d0d6dbfcfe991c3f7467a`. No source merge is approved.
Decider: po-sol, gpt-6.1-sol, independently of developer-terra-a/gpt-5.6-terra.
Job: JOB-20261009-2010-p18v, published Start blob `3c005315a185ebbadf51d8685cc8edd55a9aa27c`
at main `1e26e0dcf8c7b0ec073a59654b6c429ad364faf6`.
Actual Taken: 2026-10-09 20:13:57 UTC, clock, after reading that new original Start.
Decision at: 2026-10-09 20:24:52 UTC, clock.
Isolation: `.agent/worktrees/agent-po-sol-verify-18`, branch `codex/p18-corrected-source-release-gates`, from that main.
Usage/cost: null/null. The source implementation job remains open. PR270 is decided separately.

## Concrete remaining failure

SPEC §6 THE BRIDGE CREATES ITS OWN SSH KEY requires the Bridge to create its own SSH key pair on first use.
Accepted MOD-tunnels, Interfaces, calls ensureKey's result “an Ed25519 pair”. The selected runtime calls that
prerequisite before opening tunnels. A malformed generated pair cannot satisfy it.

Actual call path: `src/tunnels/index.mjs:122` openTunnels → line124 ensureKey → line41 real
ssh2@1.17.0 utils.generateKeyPairSync("ed25519") → dependency `lib/keygen.js:290–298` reads a DER BIT STRING
and removes every leading zero, including an actual first key byte → emits a31-byte SSH public value instead
of32 → dependency `lib/protocol/keyParser.js:725–728` rejects the private key as Malformed OpenSSH private key →
product writes both generated files at lines42–44 before matchedPair at lines23–26/46 rejects.
Expected at this node: a matching usable Ed25519 pair and successful public result; actual: rejection and both
malformed bytes persisted. Reopening at lines37–39 reads those same bytes and rejects again without generation.
This is a public product failure, even though the CI cases below first fail in their dependency fixture.

Before the negative, the exact real generator's ordinary nonzero-leading pair parsed and matched. A bounded
2048-sample probe then captured an actual leading-zero Node DER public value: iteration324, original32bytes,
converted31bytes, malformed private parse. The actual public ensureKey probe independently captured such a pair
at iteration292 after a matching positive, then supplied the two actual generated return values at the dependency
boundary without changing production or tests. The positive returned matching public bytes/fingerprint and0600.
The negative produced “The stored SSH key pair does not correspond.”, persisted both generated malformed files,
and a second call rejected with unchanged bytes and no further generator call. Controlled temporary files alone
were used and removed. Complete caller/outputs: `/private/tmp/p18v-keygen-probe.cjs`, `.log`,
`/private/tmp/p18v-ensure-key-probe.cjs`, `.log`. The latter log SHA-256 is
`8ff38c516bdaacc5042911b5c8cd2b7b5228adb5d111e598ec19e179eb2eb9d2`.

Correction belongs to the owned persistent-key prerequisite: handle malformed generated pairs with the simplest
bounded valid-pair handling, validate before persisting new files, preserve existing valid bytes and assertions,
and add an independent deterministic case for this demonstrated boundary. The inherited random dependency-positive
fixture needs a separately coordinated correction, preserving its product assertions. Root coordinates author scope
and new tests-first red CI; this PO writes no implementation. No new codec, dependency, architecture or accepted-document
obligation is introduced. A corrected exact head, meaningful same-case faults/restoration and complete green CI require
another independent decision. Retrying alone or waiving the failed inherited cases does not approve this head.

## Forward refusal correction and selected proofs

The previous immutable HOLD `docs/gates/20261009-2000-development-release-testing-286.md` remains unchanged.
The corrected guard at src/tunnels/index.mjs:127 applies to both plan directions. The unchanged real forward-byte
positive286004 succeeds. New286011 now reports NotLoopback for bind0.0.0.0 forward; restoring the previous direction-only
guard as a production fault makes the SAME final011 fail with status0, then exact restoration passes it.
The author `/private/tmp/a286-011-proof-receipt.md` discloses actual011 product red before correction, own relevant
fault/restoration and final eleven positives; it was read independently of this PO's proofs.

Only src/tunnels/index.mjs and new tests/tunnels-runtime.test.mjs differ from the source PR's declared base de31491a.
Final source blob `7f7184174506e11990a971f6f6be28cb68a5c1d8`, test blob `90b382045ec154a996074d53f7e8f3fb5c1b35fd`.
Selected baseline in disposable exact-head `/private/tmp/p18v-source-exact`:
`node --test --test-reporter=tap tests/tunnels-runtime.test.mjs` —11/11pass,3492.768833ms;
complete output `/private/tmp/p18v-source-positive.log`. Real pinned SSH loopback is positively established before
product calls. No local broad/full/native test was run.

Each final case independently failed on a relevant production-only fault and passed after exact source-byte restoration;
the actual final test bytes were unchanged throughout:

| Case | Own relevant fault | Actual same-case failure | Exact-restored case |
|---|---|---|---|
|286001|opening state becomes failed|exact opening state differs|PASS|
|286002|remove bind guard|status0 instead of refusal|PASS|
|286003|transform reverse reply|wrong returned bytes|PASS|
|286004|transform forward reply|wrong returned bytes|PASS|
|286005|accept changed host|forwarding occurs|PASS|
|286006|collision maps host-unreachable|wrong named port failure|PASS|
|286007|auth maps host-unreachable|wrong named auth failure|PASS|
|286008|wait does not grow|growing gap fails|PASS|
|286009|keep refused socket open|refused client stays open|PASS|
|286010|handler returns fault object|authenticated route body differs|PASS|
|286011|restore reverse-only guard|forward refusal missing|PASS|

Complete bounded commands/statuses/source/test/log hashes and replacement bytes:
`/private/tmp/p18v-source-faults.py`, `/private/tmp/p18v-source-own-faults.json`,
and `/private/tmp/p18v-source-TST-286NNN-fault.log` / `-restored.log`.
Original/restored source SHA-256 `a53bf1be2dc84f2c62c113c95767949b49e7f5e4341633cba2662ec8f34b68f0`;
unchanged final test SHA-256 `fc9b3e6731bb53155b33fae1111a59389c7199e7ea71e09193ea9d39bd7fb9fd`;
own fault receipt `0f94e534aa4af25cd01fa18e14d6ebefe465a2266648e058c254ca584f89443e`.

Source lifecycle/listeners/streams/timers and known-host-before-forwarding paths are unchanged from the prior actual
review except the plan refusal. Earlier own positive-backed active-stream close probe remains evidence: close's promise
returns before remote end/close; by200ms streams closed/zero fixture peers remained. This asynchronous return limitation
is retained honestly, without inventing a new requirement. Selected008 cancels reconnects;009 verifies refused-client
close and subsequent listener refusal. No shell composition or full-use-case claim follows.

Real testDeclarations/traceGraph/tracesTo was run on ALL2013 paths of actual CI tree872773eb, including accepted SPEC
and architecture nodes:141 declarations,530nodes,163edges,zero unread. All eleven numericIDs occur once in the entire
repository, first in the actual test title, with lowercase contiguous level/module/guards/given/input/expect.
Every declared requirement has actual traces. Complete caller/receipt `/private/tmp/p18v-trace.mjs`,
`/private/tmp/p18v-source-canonical-trace.json`. Parsed coverage does not excuse the demonstrated key failure.

## Full actual Linux CI and inherited outcomes

Independently read completed run37985163001 metadata and processed every line of the complete7536-line raw.
Actual conclusion FAILURE. Node20:10:18→20:11:23UTC65s; Python20:10:19→20:11:15UTC56s, both within120seconds.
Both actual checkouts `872773eb89bc013f030101668310a81b921b9eb1`, parents in order
`9811ca04c06d67f99ce52715d476fffe6e7874c8`, `e7e8745494f48578861d0d6dbfcfe991c3f7467a`;
tree `7c45e6f67975d505882cd65b1cec656561a574af` equals independently computed merge-tree of those exact parents.
Actual tested sprint base includes287/288/289 sources. Current PR metadata reports base de31491a, which is distinct
from this actual merge checkout's9811ca04; no assumption replaces the observed tree.
Node1086total/1076pass/2fail/0skip/8TODO. All eleven286 cases pass. Python399/388ordinaryOK/5skip/6expected failures.

Compared EVERY1085 inherited Node name/status against prior combined source run37983034628: only284902/284903 change
from ok to failed, with no missing/new inherited names. Every399 Python name/status is unchanged. The eightTODOs and
five skips/six expected failures remain those outcomes. Historical same-head Sprint17 native flips remain flaky,
never promoted by these distinct later runs.

Read full actual old `tests/release-itm-284-tunnels-key.test.mjs` before diagnosis. Its runtime():25→run():31→
dependency generation/parse:37–40 re-runs a random known-positive before inspect's product child.284902 fails there
with ssh2 correspondence before public ensureKey, and runtimeFailure caches that error;284903 repeats the cached
failure. The earlier284901 known-positive/product result in this same run is green. This timing identifies the CI
failure node; the separate public probe establishes the product consequence instead of claiming it from the fixture.

Actual raw `/private/tmp/sprint18-ci37985163001.log`; metadata `/private/tmp/p18v-source-ci-status.json` and
`/private/tmp/p18v-pr265.json`; every named outcome/comparison/raw hash in `/private/tmp/p18v-ci-all-outcomes.json`.
The earlier first-commit/final/fixture raws and own receipts remain retained as named by the immutable2000 gate.

## Original inputs, chronology and decision boundary

Personally read originals in the earlier source job are retained only after exact unchanged-blob verification at
new Start1e26e0d. The complete current corrected source/test, old working key fixture, actual source Start/Taken,
new Start, author correction receipt and current PR body were read. Actual original pins:

| Original | Git blob |
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
| docs/jobs/JOB-20261009-2010-p18v.md | 3c005315a185ebbadf51d8685cc8edd55a9aa27c |
| docs/jobs/JOB-20261009-1837-a286.md | 4d4bb87583947dc47b674cc1f122153d2136d634 |
| docs/gates/20261009-2000-development-release-testing-286.md | cbee8c6454e5c38508431df38122025c0571dc8c |

The pinned model commit remains ef33e2f501289930960f13b55936e9b557003993. The full original read/proof record and
accepted input verification remain in the earlier immutable gate, not rewritten by this decision.
SPEC§11 AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST requires the first implementation commit to contain only
tests and CI on that commit to be red. Original cca9fc9 is tests-only but its ssh2-fixture-red37979053653 was obtained
AFTER implementation. Corrected tests-only22a299's actual product-red37977148415 was inspected BEFORE source.
The original Start's original-first timing was not followed; no retrospective timing claim is made. First four
historical tests-only messages lacked trailers; final e7e8745 names Agent-M-Versionunreleased/developer-terra-a/
gpt-5.6-terra. Full old chronology and original receipts remain unchanged in the earlier gate.

HOLD concerns this exact source head's unusable persisted-key prerequisite and failed full CI. This source gate
authors no source/tests, closes no job/sprint/review, accepts no human artifact and establishes no independent release,
shell composition, actual browser HTTPS, full UC003/002/047, deployment or tagged release. Root alone publishes and
performs any later approved exact-head merge. Only controlled temp/loopback/DOM evidence and GitHub Linux full/native
CI were used; no Mac apps/UI/clipboard/focus/device/personal folders/systemSSH/externalSSH/paid service were used.

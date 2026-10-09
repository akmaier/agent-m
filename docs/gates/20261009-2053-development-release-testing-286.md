# ITM-286 final source gate

**MEASUREMENT**

Decision: **PASS Development → Release testing**, source PR265 exact `94771dd654da4a6d25030f9c5594d9c7dbf4ce87`, independently of developer-terra-a / gpt-5.6-terra. This approves the reviewed source for independent release testing; it is not the independent runtime release decision.

Job: JOB-20261009-2040-p18c, original Start blob `1f03eedb77272a3482beaeef5cd376387428bb95`, published main `adc38dd5fecf5240581cfb70917514fb598b7e03`.
Actual Taken: 2026-10-09 20:42:04 UTC, clock, after the original Start was read.
Decision at: 2026-10-09 20:53:01 UTC, clock.
Isolation: `.agent/worktrees/agent-po-sol-final-source-18`, branch `codex/p18-final-source-callers`, from that published main.
Decider: po-sol / gpt-6.1-sol. Usage/cost: null/null. Root alone publishes, rechecks, merges and Ends.

Full personally read originals were retained only by exact unchanged-blob verification. The 37 prior pins were checked at this Start: 34 unchanged; three changed job originals reread. The new Start, current D handoff, MOD-site-frame and the two completed gates were read as originals. The complete 42-pin record is `/private/tmp/p18c-read-pins.json`, SHA-256 `2f24d89a5a28240035a01e8f328270ba0fca6e5d34935ec7ea02b2a928bb6aad`; per-old/current verification is `/private/tmp/p18c-read-pin-verification.json`. No other agent summary substitutes for an original. The process model blob is `72fdea87d0c468ffcd53ae3a6d564623c686e22d`, pinned model commit `ef33e2f501289930960f13b55936e9b557003993`.

The complete bounded commands, statuses, stdout, exact source/test hashes, canonical results, PR metadata, raw CI and every named outcome are retained in `/private/tmp/p18c-evidence-manifest.json`, SHA-256 `726710f0e5d70cb5d6ea18ca84b5738844d06cf3985f10c617aeb329977d2eae`. This is private review evidence, not a product export. All temporary source faults were restored exactly; no production, test, accepted contract or process edit is part of this gate.

## Accepted contract and actual correction

SPEC §6 THE BRIDGE CREATES ITS OWN SSH KEY and accepted MOD-tunnels Interfaces require an Ed25519 pair on first use. The latter also says: “It refuses a plan whose bind address on the jump host is not its loopback, with `NotLoopback`.” All plans are now checked at `src/tunnels/index.mjs:131` before active registration at136 and SSH reconnect at137, in both directions. Exact TST-286011 rejects forward binds; the reintroduced reverse-only production guard fails that same case.

The persistent-key failure was proven through the real public call before correction: `openTunnels:126` → `ensureKey:128/29` → pinned real ssh2@1.17.0 generation → library leading-zero stripping → malformed Ed25519 pair. The earlier source persisted that pair before checking it, and reopening rejected the unchanged malformed files. That e7 HOLD remains an actual rejection. Current `ensureKey:41–45` generates and validates in memory with at most64 attempts, before either write at46/48; `matchedPair:23–26` uses real ssh2 parsing/correspondence. Existing files are read at37–39, valid bytes reused, invalid bytes rejected at50 without replacement. No new codec, dependency or interface was introduced.

Final TST-286012 first establishes real valid Node Ed25519 seed0 generation/parsing and correspondence, then real leading-zero seed606 failure. At the generation boundary it supplies the actual malformed return followed by the valid return; the second call observes that neither file yet exists. Public ensureKey returns the valid bytes/fingerprint and persists them exactly. A separate stored malformed pair is refused unchanged. SSH server host fixtures alone use real RSA2048; the Bridge key and the leading-zero regression remain real Ed25519. These are controlled temporary files and loopback adapters, not user keys or external SSH.

Known-host verification at73 refuses changed bytes before ready/forwarding98/103 and preserves the known entry; keepalive115 is30000ms. Failure117 closes the entry78–81, reports its own reason121 and schedules growing waits122–123 capped at30000ms. Closing141 marks entries closed, cancels timers/ends connections and clears active state143. The prior controlled close probe observed eventual closure with no peers after200ms; the returned promise is not evidence that every socket already emitted close at the return instant. No unsupported extra lifecycle gate is inferred from that limitation.

## Complete Linux CI and inherited outcomes

Finished GitHub Ubuntu CI37988414185: SUCCESS. Node20:39:16→20:40:30 =74s; Python20:39:16→20:40:20 =64s, each within120s. Actual checked-out merge `31b014a19fe544b8c690a540dff3a9ffc29567b3` has parents `9fa6ec0aef3c4280084ef52b9c0da526f8776835` and exact source head; tree `5eefb8c6975d80f0dbc4f659b1b9ba2c903972be`. Independently fetched actual objects and computed merge-tree agree. This includes the already merged independent E270 cases as base; it does not include the Settings caller head.

Node1090 =1082pass/0fail/0skip/8TODO. Python399 =388ordinaryOK/5skip/6expected failures. Comparing every named result to actual green baseline37985184237, all1078 inherited Node outcomes and all399 Python outcomes are unchanged; only the twelve new source cases are additional. Inherited284901/902/903 all pass in this run. Raw `/private/tmp/p18c-ci37988414185.log` has7476lines, SHA-256 `e33e6f88f097478b396ae8fef2c2a52733379756ae422dcbece5369c523389f2`. Complete per-name comparison and reproducible reader: `/private/tmp/p18c-ci-all-outcomes.json`, `/private/tmp/p18c-ci-read.py`.

PR metadata read during review reports baseRefOid `de31491a25ee100773ead6b67e3113be6e55de74`, unlike the actual tested merge base above. That observation is disclosed: this decision covers the exact tested tree, and root must recheck the real target/tree before merging; a changed composition needs its own CI/gate.

Tests-only deterministic012 commit `d43d5a39525debc6d18eff944c6d5cef7fc52850` at20:27:01 preceded complete CI37987150566 sole product-red012 (Node20:27:52→20:28:57, PythonSUCCESS), inspected before source correction3087 at20:31:23. Final947 host-fixture commit followed at20:32:32. Actual current commits carry Agent-M-Version, Participant and Model trailers. Earlier four tests-only commit messages lacked trailers; the first cca9 fixture run37979053653 was obtained after implementation, while corrected22a299 product-red37977148415 preceded the runtime fix. Fixture-only dad2 failure37976744186 and e7 inherited fixture failures37985163001 remain failures. Later green does not erase any earlier red, and historical same-head native flips remain flaky, never passed.

## Independent case and canonical evidence

Only `tests/tunnels-runtime.test.mjs` was explicitly selected locally, with real ssh2@1.17.0 and controlled loopback/temp fixtures. All twelve final cases passed together (4212.514791ms). Each final case was then selected by its own exact numeric title on a relevant production fault, followed by exact source-byte restoration and the SAMEcase pass; tests were never edited. Complete48s-bounded commands/stdout/source/test/log hashes: `/private/tmp/p18c-source-faults.py`, `/private/tmp/p18c-source-own-faults.json` and the twelve `p18c-source-TST-286NNN-fault.log` / `-restored.log` pairs.

| Case | Actual production fault | SAMEcase observed failure | Fault/restored exit |
| --- | --- | --- | --- |
| TST-286001 | opening state changed to failed | state mismatch | 1 / 0 |
| TST-286002 | loopback rejection bypassed | non-loopback child exits successfully | 1 / 0 |
| TST-286003 | reverse output changed to wrong bytes | reverse payload mismatch | 1 / 0 |
| TST-286004 | forward output changed to wrong bytes | forward payload mismatch | 1 / 0 |
| TST-286005 | changed host key accepted | forwarding request occurs instead of zero requests | 1 / 0 |
| TST-286006 | port-taken classified unreachable | independent reason mismatch | 1 / 0 |
| TST-286007 | authentication refusal classified unreachable | independent reason mismatch | 1 / 0 |
| TST-286008 | reconnect wait held constant | observed 113/113ms gaps fail growth | 1 / 0 |
| TST-286009 | refused forward socket left open | refused client stayed open | 1 / 0 |
| TST-286010 | authenticated handler returns wrong object | actual200 body differs from tunnels state | 1 / 0 |
| TST-286011 | forward non-loopback plan allowed again | forward child exits successfully | 1 / 0 |
| TST-286012 | valid generation search capped at one attempt | public ensureKey rejects instead of retrying valid pair | 1 / 0 |


Restored source SHA-256 `f8154bb2e980af698fa7217d652ef395e84d674349984d1daf809a8bf0d69985`; unchanged final test `9ecadae292be6ec6222b6ff9dd34c477970709756d6bebd0a5222a6586e6f9c7`, both compared directly to exact git head bytes. Author947 all12positive, same012 fault/restored and canonical receipts were read in full (`/private/tmp/a286-94771dd-*`). The author's prior other eleven fault receipts belong to earlier heads; the fresh all12 exact-final proof above is the reviewer's own, not attributed to the author. Sixteen personally read existing source/caller/case originals were retained through exact unchanged byte checks in `/private/tmp/p18c-source-retained-paths.json`.

Real testDeclarations/traceGraph/tracesTo on all2016 tracked paths of the actual tested merge, including SPEC nodes, finds145 declarations/534nodes/182edges/0unread. Exactly twelve unique numeric286 IDs start their actual test titles; each has one unit level/module and contiguous lowercase readable guards/given/input/expect. Traces reach the actual declarations. `/private/tmp/p18c-source-canonical-trace.json` is the actual merge graph; the author's smaller exact-source graph is a distinct receipt, not substituted for this whole tested graph.

## Read pins and decision limits

| Original | Blob |
| --- | --- |
| `AGENTS.md` | `7e8f20ca35cd48a5250d143b07a469d46986f123` |
| `SPEC.md` | `1de56e76de63bfe5f3f4bb98820adad801041def` |
| `README.md` | `37284376636ddf07efa58b63be4ff8a2ea12300a` |
| `docs/process_team2.md` | `eb772d456a24c145fe3f98778509f207e34e172d` |
| `docs/participants_team2.md` | `aba8b680f7df66e2807701294c960a3c29fb0148` |
| `docs/process-models/scrum-wip.md` | `72fdea87d0c468ffcd53ae3a6d564623c686e22d` |
| `docs/backlog/sprints/18.md` | `4baa3e2dc03985871e9d74976d91b48c1de41df7` |
| `docs/backlog/ITM-286-the-bridges-automatic-tunnel-runtime.md` | `a72531b3b3567c085a00990294c048f4452b400a` |
| `docs/use-cases/UC-003-configure-a-model-endpoint.md` | `82081a084479172f2f8f704211351b052edea8e6` |
| `docs/use-cases/UC-011-hand-a-job-to-a-local-cli-session.md` | `982753a5278bdcb9e0f895d30d1cc274fe2ba80f` |
| `docs/use-cases/UC-044-install-and-pair-the-bridge.md` | `6c80417a691b105488b2426c25245ae7f39a33a7` |
| `docs/architecture/ARC-040-the-bridge.md` | `603620210312a514d004a58887157c04dbafe8c6` |
| `docs/architecture/ARC-052-ssh-in-the-bridge.md` | `3fee08bacbb70bd95ecdfac91417f06f9a07d95c` |
| `docs/architecture/MOD-tunnels.md` | `0d7ed13e3e793bf081636b53c1ae64c7f15485f9` |
| `docs/architecture/MOD-bridge-http.md` | `2792f1d3a1a66eec9750fac85949ee78874e2956` |
| `docs/architecture/MOD-bridge-client.md` | `c1605d3972e8a38f8a282acfbbb64223e9b7b617` |


Only the owned source and new module-named test change in the reviewed source PR. The exact-final runtime source may proceed to independent release testing. This gate claims no independent runtime release approval, full UC003/011/044, shell composition, browser HTTPS, native local test, human release, tag, deployment or aggregate source/caller composition. No local full/glob/native/desktop suite, Mac UI/device/user-state access, external SSH or paid call occurred. PR272 is decided separately; future corrected heads, PR271 and later E fixture work are outside this Start.

# MEASUREMENT — ITM-294 Development → Release testing

Decision: **PASS**, decided by **po-sol** at **2026-10-10 10:57:47 UTC**, for component PR #294 only. Job: JOB-20261010-1048-3aa0; actual Taken 2026-10-10 10:50:55 UTC after personally reading the full original Start, AGENTS.md and SPEC.md, before root created this fresh isolation.

Approved head: `4c72a0879b5f9ab0650d78e92e44bfe218dd8eb6`. Approved base: `b09978f5d7fc958ed65406ade4ccd740f85fe1ca` (Sprint 19). The complete scoped diff adds only `tests/component-itm-294-https-reverse-tunnel.test.mjs`: 277 added lines, zero removed. Its SHA-256 is `c7e0e1db87386e3f2efd57dc2cccaf327928530f31ccf5bf00b551e8221f1687`. No production, workflow, accepted artifact or process change is approved here.

## Applied original rules

`docs/process-models/scrum-wip.md` §Gates assigns this gate to the Product Owner and requires “CI is green on it and the Definition of Done holds.” `docs/process_team2.md` §Definition of Done states “The job rules hold for every pull request; no condition is added.” SPEC.md §12, **A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT**, requires “a fault deliberately introduced into the code it guards, and the test's failing result on it.” SPEC.md §13, **A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS**, states “A gate's decision recorded by the participant that did the work the gate checks does not pass it.” SPEC.md **THE GATE IS RECORDED** requires who, when and which text. This record supplies them.

SPEC.md §11 **AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST** applies to an implementation job adding or changing behaviour. The original A job JOB-20261010-0527-e8c5 is write-tests for delivered behaviour; the candidate changes tests only. An implementation-first-red condition or independent component author is therefore not added. The separate Release testing → Sprint review gate expressly requires a release-test author other than the behaviour implementer. SPEC.md §12 requires every own PR CI job within two minutes; both current jobs meet that limit.

## Actual CI and candidate identity

Original own Ubuntu GitHub CI **38037791824** concludes SUCCESS. Node ran 08:24:58–08:26:21 UTC (83 seconds), with 1124 tests: 1116 pass, zero fail, eight TODO, zero skipped. Python ran 08:24:58–08:25:48 UTC (50 seconds): 396 tests, five skipped, six expected failures, successful. The retained TODO/skips/expected failures are not silently promoted to passes. Personally inspected original outcome ledgers include the actual TST-294001, 276, 257 and 293 outcomes.

Its actual checkout is `e5536fd1aa9892368df860828941364af9e84c72`, parents `[b09978f5d7fc958ed65406ade4ccd740f85fe1ca, 4c72a0879b5f9ab0650d78e92e44bfe218dd8eb6]`, tree `236e1b27add8a4b7099e82fb374848d000893f53`, identical to the candidate tree. The current PR metadata agrees with the approved head/base. Candidate source, complete test, scoped diff and ancestry were read through immutable git objects; primary/main source was not substituted for the unmerged candidate.

## Guarded data flow and observations

The public Dashboard dispatcher `docs/assets/dashboard-app.mjs:522–532` reaches the Settings endpoint route. `src/settings-pages/endpoints.mjs:133–146` transforms saved setting fields into endpoint configuration, writes the setting before its test, and invokes the Bridge probe. The refused result leaves the saved endpoint/key present; changing the Bridge token yields a working result. The candidate drives this route at lines 233–238, rather than treating a configuration string as a completed integration.

`src/bridge-client/index.mjs:52–73` constructs separate Bridge token and jump-host web-login headers and fetches the configured HTTPS address with credentials omitted. Emitted `src/bridge-client/proxy.mjs` Apache/nginx configuration authenticates and checks the instance origin, then forwards the session route to its configured loopback upstream. The fixture runs actual Apache and nginx TLS servers, with a fixture CA trusted only by its worker and hostname verification enabled. Candidate lines 221–230 observe foreign origin 403, allowed preflight 204 without forwarding, missing login 401 without forwarding, and bad Bridge token 401 without a model call.

Candidate lines 142–149 use the real desktop composition, Bridge key and tunnels with signed own-key SSH authentication. `src/desktop-shell/compose.mjs:10–11` starts the Bridge with its job handlers and opens the tunnels to its actual port. `src/tunnels/index.mjs:89–100` accepts the reverse connection and pipes it to the local Bridge loopback socket. `src/bridge-http/server.mjs:27` rejects an incorrect Bridge token before handler dispatch. `src/bridge-jobs/handlers.mjs:17–21` maps the request configuration into the imported real `testEndpoint`; `src/endpoint-calls/index.mjs` sends the controlled own-model request and checks the one-word response. Candidate line 244 observes four actual controlled model calls, signed authentication before forwarding, and loopback reverse-forward binding. Candidate line 240 observes the ordinary endpoint browser-direct path without another tunnel. Web login, Bridge token, endpoint key, and browser/repository/cookie state remain distinct in the assertions.

## Actual planted-fault counter-proof

The same TST-294001 test runs against a temporary copy of production `src/bridge-client/proxy.mjs` in existing Ubuntu CI. Both emitted upstream templates are deliberately changed to `127.0.0.1:1`. Original and exactly restored source SHA-256: `829aee996cb609967acd244152c748fd395129888596e3586c33c5dc86eb12c3`; planted source SHA-256: `241f0cb3508ded46f48494e89b595a32d8806135b891b7f164d6bfed460d40ab`.

The fault child ran 08:25:20.808–08:25:25.167 UTC, status 1, signal null, launcher error null. Its actual TAP says `not ok 1 - TST-294001`. Failure path: production emitted Apache upstream → connection to `127.0.0.1:1` refused (AH00957) → HTTP 503 across 100 readiness attempts → `apache did not accept TLS`, at worker `runServer` (`eval` line 131, called at 136). This reaches the deliberately wrong emitted upstream; it is not a launch failure or a successful test hidden under a failing wrapper.

Exact restoration then ran 08:25:25.167–08:25:32.749 UTC, status 0, signal null, launcher error null. Actual same-case TAP says `ok 1 - TST-294001`. Restored observations include four model calls, five tunnel forwards, signed valid-key authentication at order 3, then reverse forwarding at order 4 bound to `127.0.0.1`. Both children use the same test hash above, cwd `/home/runner/work/agent-m/agent-m/`, Node `/opt/hostedtoolcache/node/22.23.3/x64/bin/node`, and argv `--test --test-name-pattern TST-294001 /home/runner/work/agent-m/agent-m/tests/component-itm-294-https-reverse-tunnel.test.mjs`; source-root environment selects the temporary copy.

The original raw receipt contains two GitHub TAP fragments. Full nested JSON decoding rejects a GitHub-masked Bearer value containing an unescaped quote. I inspected the original scalar header/tail and named original child-stream failure/pass nodes, without inventing a decoded result or altering the parser/test. This serialization limitation does not remove the actual fault and restoration evidence.

## Earlier failure and provenance

Earlier own CI **38037060334** on `e2f3949314c9f0839abb0b4c4b8799db75eb6e39` failed: Node 82 seconds, 1124 tests, 1115 pass, one fail, eight TODO; Python 66 seconds successful. Its original child stream shows `EADDRINUSE 127.0.0.1:41329` at Node `Server.setupListenHandle` → `listenInCluster`, before the planted proxy route could be exercised. Candidate fixture reserves then closes an ephemeral port and later binds it; the collision was a fixture race, not proof that the proxy fault was detected and not a whole-product diagnosis.

The exact e2f → 4c72 correction changes only three fixture lines: listener errors reject the pending listen, and an SSH forwarding collision rejects that request so existing production tunnel retry/reconnect can recover. Proxy implementation, guarded assertions, key authentication and planted fault remain unchanged. The original failure and immutable diagnosis/correction remain reachable; this PASS uses the current successful own CI and actual current counter-proof.

Original test author is participant A (developer terra), including first test commit `50def4ab652f1ef3451d01afe5e6f03510e9723c` and fixture correction. Actual integration ancestry retains `fbb7da3` merging approved `93b5218`, then e2f merging exact b099, then current 4c72. Source commit provenance attributes the guarded implementations to A/B/C, including A's desktop composition/tunnel work, B's client/proxy work and C's endpoint/key work. Shared Git account identity is not used as participant identity. Neither po-sol nor the predecessor PO is an author of this guarded source/test. The deciding participant is independent of the work this gate checks. A's source contribution does not invalidate this component job; it matters when independently assigning later Release testing.

## Original reading and trace evidence

Personal original reads comprise complete AGENTS.md, SPEC.md (2135 lines), Start, README, participants and Team2 participants/process, process.md, scrum-wip, current primary Sprint19/order/ITM294, actual A0527 Start, accepted UC003/044/042, ARC040/050/052, and relevant module contracts for settings-pages, browser-store, bridge-client, tunnels, desktop-shell, bridge-http, bridge-jobs and endpoint-calls. Accepted approval records pin the actual document blobs. Complete candidate and immutable source/callers for the data flow above, Dashboard dispatcher, app harness and existing CI workflow were inspected, along with original commit history and scoped correction diff.

I statically read the complete original current CI streams and inspected their complete outcome ledgers and archive/checkout metadata; repeated embedded worker text was read from the immutable candidate. Original fault stream named nodes, scalar receipt, previous collision stream/diagnosis and current public metadata caller/results were inspected personally. Author input/read inventories are attribution evidence, not substitutes for my original reads. The canonical trace caller uses the existing `testDeclarations`, `traceGraph` and `tracesTo` interfaces across 2093 tracked paths. Its actual results are 191 declarations, 580 nodes, 330 edges, duplicate IDs `[]`, unread paths `[]`. Known positive TST-257001 and current component TST-294001 are recognized; TST-294001 is classified component and traces the six declared UC/requirement guards. The complete retained 2093-path/hash inventory is machine metadata, not a claim that I personally read every unrelated product file. No new product/runtime check was run for this review.

## Bounded consequence

Root may publish this record/comment and merge only approved component head 4c72 into approved Sprint19 base b099, then assign separate independent E Release testing. ITM-294 is not DONE from component PASS alone. This fixture demonstrates accepted UC003 alternative 2a; it does not claim every endpoint uses a Bridge. Worker CA trust does not prove current host browser trust or Safari/Chrome/Firefox item267, distribution, discovery, mail, or whole UC003/044 completion. Other source, release, aggregate and closing gates remain required. Human akmaier retains SPEC/use-case/architecture and release-report acceptance. Usage: null. Cost: null.

## Retained original evidence pins

- `/private/tmp/root-p19-component294-current-pr.json` — 723 bytes; SHA-256 `f4134e6b8b396a8472d01034067cfdafb528b16cf85b6af2bfd5bb065835d59f`.
- `/private/tmp/root-p19-ci-38037791824-api.zip` — 354708 bytes; SHA-256 `298485ae8468a1f084add22aa5cedfa7fe632db0dd28a4082490c732e72c1f66`.
- `/private/tmp/root-p19-ci-38037791824-node-api.log` — 836025 bytes; SHA-256 `fbbc8f3f51318e5bff6eca407102d0d651a00b3485de1226009aa8cef6dbd78d`.
- `/private/tmp/root-p19-ci-38037791824-python-api.log` — 75447 bytes; SHA-256 `894bf7aa591a9354cf92a336573bec2ac6f6539059346c9238e89c97d3a391ff`.
- `/private/tmp/root-p19-ci-38037791824.json` — 2963 bytes; SHA-256 `8d223831f40d19f5a27b020885e395604ec9580f4ed6d0d5077a8375dd3c1c00`.
- `/private/tmp/root-p19-ci-38037791824-commit.json` — 39296 bytes; SHA-256 `153e9084225b3308b53d6067f864bfedec37510306f58a0dd5b00fe5a942a979`.
- `/private/tmp/root-p19-ci-38037791824-294-proof-raw.txt` — 103641 bytes; SHA-256 `644272d470e68c66dba46d29cf4011441acbd2ed6e9699afde2e2e1d0ed72a45`.
- `/private/tmp/root-p19-ci-38037791824-294-proof-scalars.json` — 1662 bytes; SHA-256 `14fb93e4c307894ad0f99ae0ca034bce7be3263301a66831dfdd1b493c222551`.
- `/private/tmp/p19-294-4c72-trace.mjs` — 2292 bytes; SHA-256 `7193117063aac45bf2dfd2351b4f17bdd67fbe2374b3882993e2b92a99418e3f`.
- `/private/tmp/p19-294-4c72-trace-paths.txt` — 113246 bytes; SHA-256 `897894bee88568176aa2f34f7b2519c377921bda1fa207032d0a0a401ec49f11`.
- `/private/tmp/p19-294-4c72-trace.raw` — 3390 bytes; SHA-256 `d0145a7c18848f74a3c751497b700c1f808b9a295cf9b50f41788920c4d7b094`.
- `/private/tmp/p19-294-4c72-trace.json` — 275933 bytes; SHA-256 `b6c868372b9f91d67f3763f0b195008b0caccd0e2e765d7065e9c1b30f3814ca`.
- `/private/tmp/root-p19-ci-38037060334-294-failure.txt` — 33401 bytes; SHA-256 `00edffcf697f1e3b60326e87a695f1ce34559d8165ed145d38a6dcf7be2ca14b`.
- `/private/tmp/itm294-ci38037060334-port-collision-diagnosis-and-correction.md` — 3961 bytes; SHA-256 `93c42170cfd50f9abdb628c131980ce1590c6638a1098351da419825f3aca9f8`.
- `/private/tmp/itm294-final-input-inventory.json` — 20051 bytes; SHA-256 `fca9b78b79a767ca74283277c74c859f5f6cd9083f6ee6374ccff6ad2ac33acb`.
- `/private/tmp/itm294-actual-read-ranges.txt` — 6331 bytes; SHA-256 `97df0f536853ca0c1e6f7042493c90942d0490a6b19099ac28b859ed88a55884`.

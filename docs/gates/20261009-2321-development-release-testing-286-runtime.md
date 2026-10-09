# Integrated ITM-286 runtime release-test gate

**MEASUREMENT**

Decision: **PASS** only PR274 exact `c0b436538b68d61907151ce3bca0deb66f91efab`. Its own complete Ubuntu CI38003385503 is SUCCESS; all four runtime cases and seven inherited native cases are positive. Root may publish this decision and merge this unchanged approved head after its live recheck. The separate aggregate decision waits for the actual merge; this record grants no sprint close, report acceptance, distribution or future-head approval.

Independent decider po-sol / gpt-6.1-sol; actual Taken2026-10-09 23:15:45 UTC, decision2026-10-09 23:21:02 UTC, clock. Full original NEW JOB-20261009-2314-p18r read on main `c2ec28c7d71e637589ac3a503e30cc0f01a69c05` before NEW `.agent/worktrees/agent-po-sol-runtime-aggregate-18`, branch `codex/p18-runtime-aggregate`. Prior2302 ended; its context remains untouched. Usage/cost:null/null. Root publishes and merges.

## Exact integration and complete CI

Head parents are `[e80e5a3eb05c21e31b1e76da25068bc41f6b9622,c7454a21b093823d9d73af4b60bea1810b6b0d4e]`. The first parent retains its immutable HOLD; the second is the actually approved PR276 acquisition-diagnostic merge. Only the unchanged138-line `tests/release-itm-286-tunnels-runtime.test.mjs` differs from that target. Every2020 mode/type/blob entry matches a head parent; every2019 target entry is inherited exactly. Root's original integration receipt was read and independently verified; no handwritten source resolution or novel source blob is introduced.

Actual fetched CI checkout `d3b077e632c6bc6db97ec31f9610050016a81dce`, parents `[c7454a21b093823d9d73af4b60bea1810b6b0d4e,c0b436538b68d61907151ce3bca0deb66f91efab]`; tree `85ae1e7db149bd9f67ff8a334a105e4932adfab6` equals independently recomputed merge-tree and head tree. Full entry proof `/private/tmp/p18ra-integration-verification.json`. Guarded source SHA-256 `f8154bb2e980af698fa7217d652ef395e84d674349984d1daf809a8bf0d69985`; full runtime test/helpers `42634213107073d0b92a9d19a3c1a4c6c72149ed4845415ebe201391d8ba95e6`.

CI38003385503 attempt1 completed SUCCESS. Node23:14:11→23:15:00=49s; Python23:14:11→23:15:17=66s, both within SPEC§12's120-second job bound. Node1085=1077pass/0nonTODO failures/8TODO. Python396=385ordinaryOK/5skip/6expected failures. The retained TODOs remain TODO, not newly passed cases.

Own downloaded unedited full raw7484 lines `/private/tmp/p18ra-ci38003385503.log`, SHA-256 `dc7105f866dab62e70d435088656a63b260b36bfccbd3b40229a45eaedf0f1dd`; own final status/API metadata and exact PR head/base/body retained. All named outcomes were independently inspected as multisets, retaining repeated names. Against full approved acquisition CI38002318605, all1081 inherited Node and396 Python names/statuses are identical, with only four new positive286901–904. Against failed e80 CI37999844838, the only outcome changes are the seven inherited native cases from not-ok to ok; the four runtime cases were already positive there. Full names/differences `/private/tmp/p18ra-ci-all-outcomes.json`.

Actual positive native IDs276001–006 and276901, and runtime IDs286901–904 were individually verified. Prior exact71/e80/36 red runs and HOLD decisions remain recorded. Historical same-head native flips remain flaky; this different exact combined head's actual green is not a same-head rerun or a waiver, nor evidence of a transport fix.

## Complete native acquisition observations

All42 actual diagnostic stage rows and all14 unique complete stdout/stderr were inspected, retaining uniform one-layer TAP backslash unescaping before JSON decoding and the known-positive quoted xvfb output. Full `/private/tmp/p18ra-native-stages.json`, `/private/tmp/p18ra-unique-stages.json` and indexed stdout/stderr files. Identical complete outputs were retained through exact byte comparison to the personally inspected prior acquisition evidence; changed complete outputs were read. Parser presentation is not a product finding.

Both real Electron44.5.1 package/binary acquisitions and xvfb probes succeed. Component preflight initially reports Openbox ENOENT, prints a24-package mirror+file plan in1259ms, then APT status0 installs24 packages/22.9MB, fetched in1s. Complete install stdout10855B/stderr15276B records24 HTTP200 headers; its only differences from the prior positive are fetch timing and24 Date headers. Openbox ready status0 occurs before profile-lock acquisition.

Release print-plan status0 in387ms emits full1384B stdout, including Need0B/22.9MB, with no URI rows. Its observation label is unparseable-print-uris; this does not mean failed acquisition or parser defect. Release APT status100 emits complete192B stderr naming dpkg lock-frontend owner2603. Eight subsequent ready probes report ENOENT, then the existing finite readiness path reports0 before profile-lock acquisition and the native body succeeds. Both installs are not claimed status0.

The component mirror+file plan contains HTTP Azure and HTTPS archive mirrors, but no direct recognized HTTP font URI; release emits none. No curl comparison ran. No HTTP-versus-HTTPS advantage, mirror/proxy cause, underlying original timeout cause or repaired acquisition transport is inferred. The approved adapters preserve readiness before profile lock, whole-body/cleanup serialization, and276005's intentional second starts.

## Retained independent four-case counter-proofs

All52 original2148 proof artifacts, all24 guarded source/caller/test/helper/library pins, and all nine complete own command-result artifacts were independently verified unchanged. Full `/private/tmp/p18ra-retained-proof-verification.json` records actual SHA/size checks, source/test hashes and statuses. The personally inspected prior manifests138 and162 artifacts were also individually verified with zero mismatches; `/private/tmp/p18ra-retained-evidence-verification.json`. No repeated fault quota is invented.

Own original known-positive all-four selected run occurred21:54:53 at exact71 in a disposable archive with real ssh2@1.17.0 controlled loopback/temp adapters. Each relevant production fault caused the SAME selected case exit1; exact source bytes were restored, and SAMEcase exit0. Full bounded argv/cwd/time/status/stdout/stderr/source/test hashes and stacks remain `/private/tmp/p18r-own-*.json`, not reenacted or called fresh2314 runs. Restored source is f8154; full test426342 never changed.

|Case|Guarded fault → actual same-case failure|Exact-restored same case|
|---|---|---|
|286901|ensureKey:51 fingerprint null → real matching persisted Ed25519 pair parses, but ensure-key-runtime-positive fails missing fingerprint|exit0;254eea88…|
|286902|tunnelHandlers:147 empty tunnels → authenticated real GET200 and reverse bytes succeed, exact open-state assertion fails|exit0;d1757d06…|
|286903|reconnect:115 keepalive30000→0 → real forward bytes succeed, actual Client option0 fails|exit0;8adbccec…|
|286904|failEntry:123 doubling→constant wait → actual gaps114/115 fail growing/second>=180 assertions|exit0;7e77f62d…|

The bounded350ms no-later-reconnect/empty-state observation does not claim every stream/socket closes at the instant closeTunnels returns. Final test's dedicated converter child hooks crypto before first ssh2 require and restores it after the real converter/parser positive. Separate ordinary ssh2 Client/Server authentication is real; product901 generation is unhooked in a fresh folder. Original before-hook1/after-hook0 capture probe remains exact. No fake parser or handwritten codec is used.

Author original complete final raw outputs were absent; its summary is not raw. First dated repair retains complete selected/restored and incomplete manual901 output, with condensed902–904 fault stacks. Later automatic unedited902–904 spawnSync JSON repairs are complete, individually verified, and distinct from original executions. Automatic manifest `0dc21cdb52654f411d5387bcaa5cb29f0f7b3b1233900af11b857eba14469d4e`. Author901 is not claimed automatically complete; independent own full901 proof remains distinct.

## Independence, canonical traces and authority

Complete guarded-source/caller history205 commits was independently checked using the existing known-positive metadata matcher for predecessor Sonnet E and current Terra E. Only E-labelled guarded integration50ef591 introduces zero novel guarded blobs; all23 match a parent. E fixture453 changes only the two approved key adapters. Root's final c0 approved-dependency integration is wholly inherited. Full `/private/tmp/p18ra-independence.json` preserves metadata, parents and blob proof. Independent release authors do not implement novel guarded product source.

Real actual-tree testDeclarations/traceGraph/tracesTo over2020 paths:152 canonical declarations,541nodes,206edges,0unread. Each286901–904 has repository-unique numeric ID first in its actual title, one release level/MOD-tunnels module, and contiguous lowercase guards/given/input/expect; actual requirement traces reach them. Full `/private/tmp/p18ra-canonical-trace.json`. Legacy native metadata limitations remain those in the approved diagnostic gate; no new-case quota is imposed on unchanged native cases.

Original SPEC§11 assigned module scope, SPEC§12 recorded guarded fault requirement, independent release authors and two-minute job bound apply. Retained complete counter-proofs satisfy the new-test evidence requirement. DefaultDoD's "its CI run is green" and Scrum's "CI is green on it and the Definition of Done holds" are satisfied for this exact item head. Original2116 is write-tests; no invented tests-first implementation obligation is added. Accepted originals remain the human's authority.

Read pins94 `/private/tmp/p18ra-read-pins.json`, SHA-256 `3c82449e432cf04406c3a98347bf0a6d8ed52a737051174394e3082af2aea382`:90 prior originals retained only by exact unchanged blobs; changed JOB2302/JOB2242 full originals reread, NEW2314 original and published2311 gate read. Core binding originals, full accepted affected UC/architecture/modules, actual callers and source/tests are retained by these exact pins, not summaries. Own bounded nonexecuting integration/graph/history command receipts record complete outputs and exit0; no local product/native execution.

Private complete new evidence manifest48 files `/private/tmp/p18ra-evidence-manifest.json`, SHA-256 `702feb73993f100b346b84669341a29ae9cb635b8a7062e692bcec7651d7eb56`, references individually verified retained manifests/proofs. Only this immutable gate and byte-identical private body are authored. No source/test/accepted-document changes, local full/glob/native/Electron/APT/UI/device/personal-folder/SSH/paid execution. All full/native integration is actual GitHub Ubuntu. Root alone publishes/rechecks/merges. Separate aggregate review begins only after root's actual merge report.

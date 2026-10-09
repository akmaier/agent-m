# Bounded native acquisition diagnostic gate — PR276

**MEASUREMENT**

Decision: **PASS** only exact PR276 `36f3ab9cb498804e6dc4f5153d2c0f91ac81da3a`
against sprint18 `d855bed3f1a90f79e9ee9f7eb09d6e9b297a2298`. Complete Ubuntu CI38002318605
attempt1 is SUCCESS, all seven unchanged native cases are positive, and both jobs finish within120seconds.
The two adapters add bounded observation before unchanged APT; they repair no acquisition transport.
Root may publish and merge only this exact head after its live head/full-green/approved-scope recheck.
This approves no runtime PR274 integration, aggregate, sprint close, future head or full use case.

Decider: po-sol / gpt-6.1-sol. Writer: developer-terra-d / gpt-5.6-terra under JOB-20261009-2242-d18a.
NEW review JOB-20261009-2302-p18a was read fully at published main
`93287adc8abbb77f486e9dca3b74df1486127b9b`; actual Taken2026-10-09 23:03:17 UTC.
Decision2026-10-09 23:11:07 UTC, clock. NEW `.agent/worktrees/agent-po-sol-acquisition-18`,
`codex/p18-acquisition-gate`, from that main. Ended2244 context is untouched. Usage/cost:null/null.

## Exact scope, call path and preservation

Only `tests/desktop-shell.test.mjs` and `tests/release-itm-276-desktop-shell.test.mjs` differ from d855.
Both whole actual files and full diff were read. Existing main/compose/index/app/preload/window and four
same-scope caller/test originals were retained only after unchanged blob/SHA256 verification (11 paths).
The actual preflight path remains `prepareNativeFixture → runtime → electronCommand → acquireNativeFixtureLock`;
profile lock covers the entire original product cases and cleanup. Real Electron44.5.1/xvfb/Openbox remain.

When the initial Openbox probe fails, `electronCommand` now calls `diagnoseOpenboxAcquisition` before the
unchanged40s APT install. A6s print-uris call supplies the package plan; only a recognized direct public
HTTP Ubuntu font package with MD5 enables two HTTP/HTTPS requested URLs with the same host/path,
5s curl max-time,2s connect-timeout and6s process guard. Scheme restrictions, temporary-file cleanup,
public size/MD5 evidence and sanitized CLI text remain explicit. Unknown/failed diagnostics return to
unchanged APT. They neither install their probe file nor alter sources, suite, versions, signatures or transport.

Own exact-byte comparison removes only the added diagnostic block/imports/call and reproduces each
entire original adapter exactly. Original headers, every CDP/product helper, case title/body, assertion,
input/expected value, lock/readiness ordering, polling loops and original bounds are unchanged.
Component full SHA256 `694f9bfdecd062aa37a077ef678a8cfee4c1816609ad2533003b4e32d7b3f406`;
release full SHA256 `1cdd4498e175119c84fd693f7ddc497467dd7c5ea4218e5635a7edc7153e1b1b`.
Complete case/helper tails respectively `05292c9158a93f2b4dca86c04e2ff9ff5baf7b08afbce38fdd915419e9108bb0`
and `45bc8ca2cc2d64ee7fe3142a5356f6ae6fbbe52b0c4754797fc7ece06adce344`.
Own `/private/tmp/p18a-byte-preservation.json` and exact diff retain these proofs independently of root's receipts.

## Actual completed CI and diagnostics

Own complete raw download: `/private/tmp/p18a-ci38002318605.log`,7473lines, SHA256
`4c98d2d1fcf575a02b96c96f0261529edd3eecc77e6f31863d9e8c6ff79ee356`.
Metadata independently confirms exact head, attempt1 and completed SUCCESS. Node23:01:35→23:02:38=63s,
1081=1073pass/0fail/8TODO; Python23:01:35→23:02:14=39s,396=385ordinaryOK/5skip/6expected failures,
suite33.341s. SPEC§12 “A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES” applies to each job and holds here.
Every named Node/Python outcome, including repeated names, exactly matches known-positive37999004824.
Complete `/private/tmp/p18a-ci-all-outcomes.json` and named inventory preserve all names, not only totals.

Actual fetched checkout `c2d8aaa22202512253e2d241572f68fdfd9ad57e` has parents `[d855,36f3ab9]` in that order.
Its tree `42cec1098c3d8f3f5dbde52823dea688353af32f` equals independently recomputed merge-tree.
The2019-path tested tree has only the two assigned adapter deltas; other product/test blobs are inherited.
Live PR head/base/body/mergeability were independently read; `/private/tmp/p18a-tree-verification.json` records proof.

All55 native stage records were decoded by undoing exactly one TAP backslash-escaping layer before JSON,
including the known-positive quoted xvfb help and plan lines. All14 unique stages and complete CLI stdout/stderr
are retained; repeated stage bytes remain available in the full raw and `/private/tmp/p18a-native-stages.json`.
Both Electron package/binary acquisitions and xvfb probes are positive. The component diagnostic resolved24
mirror+file packages in2678ms, including fonts-urw-base35_20200910-8_all.deb,10968180bytes,
public expected MD5 `c5e4cff568d83e11974a5462ffcaf851`. The release plan resolved15 remaining packages
in663ms, with no font in that remaining plan. Both public mirror lists name HTTPazure and HTTPSarchive.
Neither plan supplied a direct HTTP font URI: **no curl comparison occurred**.

Component unchanged APT returned0, fetched22.9MB/24packages in3s, installed Openbox, then readiness returned0.
Complete install stdout10855bytes/stderr15276bytes includes24 public HTTP200 package responses.
Release APT returned100 with192byte stderr naming dpkg lock-frontend owner2973; the original bounded
readiness path recorded21ENOENT probes, then Openbox0, before profile-lock acquisition and native execution.
Both final ready stages name real Electron44.5.1. It would be false to call both installs successful.
The complete unique plan/install/npm/xvfb/readiness text was inspected; package contents are not evidence artifacts.

All seven actual original native cases pass:276001 pairing/rotation,276002 pause/resume/quit,
276003 occupied-port recovery,276004 unwritable-folder refusal,276006 private default folder/token,
276005 close/second-start restoration and276901 fork-local fixed-preload/loopback/origin behavior.
276005 took1115.021285ms;276901 took2021.109918ms. These are Ubuntu observations, not local Mac executions.

Against retained exact e80 CI37999844838, the seven native names change from not-ok to ok; all other shared
names/statuses are unchanged. Its four286runtime release cases are absent from this diagnostic target, since
that release PR remains unmerged/HOLD; their absence is not a removal or approval under this gate.
Earlier failed acquisition attempts and historical Sprint17 same-head native flips remain recorded failures/flakiness.
The green different-head observations here do not diagnose the earlier apt timeout, establish a proxy/mirror cause,
prove an HTTP-versus-HTTPS advantage or repair/waive e80. Original acquisition cause remains unknown.

## Canonical trace, provenance and limits

Real actual-tree testDeclarations/traceGraph/tracesTo over2019paths including SPEC:148declarations,
537nodes,194edges,0unread. All seven actual numeric case titles are unique across the repository.
Affected parsed fields equal the original ignoring only line shifts. Legacy component parses0 canonical cases;
legacy901 parses one ID at208 with null canonical fields under its unchanged uppercase comments/header.
These limitations remain explicit; this adapter-only job introduces no new product case or metadata migration.
Complete `/private/tmp/p18a-canonical-trace.json` and pure trace method are retained.

SPEC§11 confines implementation changes to assigned modules/module-named tests; these two headers name
MOD-desktop-shell. SPEC§12 says “A new test is accepted only with a recorded counter-proof”; these unchanged
old cases create no new-test or repeated fault quota. Original Start defines this bounded write-tests prerequisite,
not a product-behavior implementation or refactoring. No tests-first product condition or expected-result waiver is invented.
The author's two retained local receipts contain timestamp/head/hash-pair/predicate stdout, not full native raw;
root's preservation receipts are root evidence, and the full Ubuntu raw plus the byte/graph checks above are independent PO evidence.

Read pins92: `/private/tmp/p18a-read-pins.json`, SHA256
`5db70a503c53b9e9c13918c20c7b23ad0cb78cf79ec5b1fbbdf8156ec85059cb`.
Of83 prior original pins,82 were unchanged; changed ended JOB2244 was reread fully, as were new Start/D2242
and both changed whole adapters. Binding originals, affected accepted originals, textbook/process history and
original0833/245 preconditions retain exact verified pins. All162 prior private artifacts were individually
hash/size verified unchanged in `/private/tmp/p18a-retained-evidence-verification.json`; summaries replace no original.
Own bounded20s nonexecuting tree/byte and pure graph commands both exit0; complete argv/time/status/stdout/stderr
are in `/private/tmp/p18a-own-command-receipt.json`. No native test or product process was executed locally.

Complete private evidence manifest138files `/private/tmp/p18a-evidence-manifest.json`, SHA256
`3f213805b5bfad3d22f4c35ac826b407e038f62af1059d8efaeeeec62bb900f0`.
Only this new immutable gate and byte-identical private publication body are authored. No source/test/accepted-document
change, child, local full/glob/native/Electron/APT/display/browser/CUA/MacUI/clipboard/settings/device/personal-state/
SSH/paid execution or own publication occurs. Root alone publishes/rechecks/merges/Ends. PR274, integration,
aggregate/closing/planning/future heads, distribution/fullUC and human architecture/SPEC acceptance remain outside this decision.

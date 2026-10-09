# Development → Release testing — ITM-283

**MEASUREMENT**

Decision: **PASS** for [PR256](https://github.com/akmaier/agent-m/pull/256), exact source
`5630f1dfda11339b6fde39b6b256e458aa8c03fd`, into actual sprint/17 currently
`d492b4732ef31c2c4463bd9bd1e7cffec174f292`. Decider: po-sol, independent of developer-terra-d.
Fresh job JOB-20261009-1700-p283285, actual Taken clock2026-10-09 17:04:15 UTC;
decision clock2026-10-09 17:14:12 UTC. Usage/cost:null. This is the second separate decision;
the first285 decision remains immutable in its own record.

## Original reading and bounded ownership

The published new Start was personally read before creating the new isolated
.agent/worktrees/agent-po-sol-283285-gates-17, branch codex/p283285-source-gates-17 from main6a9c94a.
Full original AGENTS/SPEC/README, process_team2/participants and pinned scrum-wip previously personally
read remain byte-identical: AGENTS7e8f20ca35cd48a5250d143b07a469d46986f123,
SPEC1de56e76de63bfe5f3f4bb98820adad801041def, README37284376636ddf07efa58b63be4ff8a2ea12300a,
process eb772d456a24c145fe3f98778509f207e34e172d, participants aba8b680f7df66e2807701294c960a3c29fb0148,
model72fdea87d0c468ffcd53ae3a6d564623c686e22d pinned commit ef33e2f501289930960f13b55936e9b557003993.
Original Sprint17, item283/source Start, accepted UC042/044, ARC037/047/053,
MOD-browser-store/desktop-shell, existing store/catalogue/listing/endpoint/jump-host source and unit/release
cases, legacy docs/assets/settings-store.mjs caller, guarded source history and developer's original fault
receipt were read directly. Current accepted MOD-browser-store blob058fd3b05cc14cb361575f16a2059f174417e8ac
and UC042 bloba8c595676ef0afd54290024c928b7268c49dfbe9 match their human approval records.
Originals are not replaced by summaries; no contract changed.

SPEC §11 tests-first and module ownership, §12 canonical cases and relevant own counterproofs,
and §13 independent Product Owner gate/DoD apply. Team2 adds no DoD conditions to the job rules.
The declared model's source gate requires the item PR, green CI and DoD. Guarded history names the
actual developer and predecessor implementations, not this reviewer; this reviewer authored none of
these source/tests. PR changes exactly owned catalogue.mjs/export.mjs/index.mjs and the new
module-named tests/browser-store-settings-export.test.mjs; store.mjs and all old test expectations remain
unchanged. No source/test, accepted document, model, participant, helper, workflow or manifest was edited
by this reviewer. Only the new dated gate and private temporary evidence were written.

The bounded catalogue is github-token, products, notifications, notified, bridge, jump-host and families
github-token:*, gitlab-token:*, endpoint:*, remote-session:*, last-test:*. Foreign keys remain empty.
Mailbox, acknowledged/not-an-issue and sign-in-library keys are not claimed implemented. The original legacy
caller has its older format and is untouched. This gate accepts the canonical source boundary, not full UC042
or a legacy conversion/integration. The accepted desktop-shell consumer reads the export without browser
storage, obtains jump-host/remote-session values and passes its shell subset to tunnel commands; that
integration is a separate implementation scope.

## Concrete data flow and verified nodes

src/browser-store/index.mjs reexports exportSettings/importSettings/readExport. export.mjs:89–91
constructs the accepted version1 head and payload → storedSettings:34–44 iterates only store.prefix,
checks isKnownKey, parses stored JSON and preserves each implemented value/secret → :92 plain envelope
with locked:false/settings/foreign:{}; or :94–100 random16-byte salt/12-byte IV → passphraseKey:28–31
real WebCrypto PBKDF2/SHA-256/600000 → AES-GCM256 → encrypted payload with explicit accepted KDF/cipher/data.
No custom encryption, conversion or fake adapter is involved.

readExport:80–85 parses JSON → validateHead:53–55 → plain:58–60 or decryptLocked:64–77 →
validateSettings:47–50 checks every incoming key before returning values; it opens no Store or localStorage.
Malformed JSON/unknown key gives NotAnExport. Wrong passphrase gives WrongPassphrase before import writes.
importSettings:105 first completes that read/validation → :107–110 getRaw classifies any existing raw entry
as kept, absent entries as added → :111 writes only added keys. Existing raw JSON bytes remain identical.
store.mjs:20 instance prefix isolates storage; catalogue remote-session family makes persistence and metadata
available. clearSetting → removeRaw physically removes the prefixed raw entry. Metadata lists seven accepted
fields with secret:true/setup:bridge; it includes no token, port or stored value.

## Actual tests-first and complete Linux evidence

Actual parent chain1860e880c2dd972cdc80700f61487620ea3952ca → tests-only
`358003422865abb63248ffaa212d1081b33d9c9b` → source5630f1dfda11339b6fde39b6b256e458aa8c03fd.
First writing commit adds only the new test; the source commit adds its production exports afterwards.

[First red CI37961083954](https://github.com/akmaier/agent-m/actions/runs/37961083954) actually tests
358003422865abb63248ffaa212d1081b33d9c9b. Both actual checkout logs name
`1410636bb9fbf932e966c3b8350e109bced2aa1a`; GitHub commit parents1860e880 and3580034,
tree613e1d28ff0c635a8a9ea84024e436a7c9819257 equals the tests-first head tree.
Node's real new-file import fails: index.mjs does not provide exportSettings; the four new cases cannot
start. This is a production missing-export red, not an invented local red. Node1041 total/1032pass/1fail/
8TODO,0skip/cancel,45.806s. Its TAP record contains duplicate number15 and absent75 alongside all1041
named outcomes; no numbering repair is performed. Python399 tests OK/5skip/6expected failures,56.654s.
Complete red7171 lines/729465 bytes SHA256a49912ae6a3abfeb8c8de6d2a68a8d54201d50a23cdc937940013e12d8e8e6ca.

[Final full CI37962814953](https://github.com/akmaier/agent-m/actions/runs/37962814953) is SUCCESS at
exact5630f1dfda11339b6fde39b6b256e458aa8c03fd. Both actual checkout logs name
`1f9e3b0d56d2d6bd11cedc72d1c382db3f7639ef`; actual GitHub commit parents1860e880 and5630f1d,
treebe71bbf38b8a41a2160a3ef984c7a3b1cb858a18 equals reviewed source tree.
Python113929658765 succeeds:399 tests/388ok/5skip/6expected failures,44.852s, full job53s.
Node113929659063 succeeds:1044 tests/1036pass/0fail/8TODO/0skip/cancel,50.124s, full job55s.
Native276001–006 and independent276901 are executed/passing on Linux; two-minute job budgets persist.
Complete final7176 lines/730101 bytes SHA256d588985fc500e5e7e86935494ae184107f3b16b7932b43e1efc7f5e2b048e87e.
Full logs and all399 Python plus1041/1044 Node named outcomes were read, with private complete ledgers
/private/tmp/p283-{red,final}-every-outcome.txt and raw p283-{red,final}-ci.log. Every Python name/outcome
is identical; Node name comparison replaces only the failed new-file import with the four passing new cases.
Existing named cases retain outcomes, including TODO limitations. The prohibited developer local broad/native
result is explicitly excluded from acceptance; actual GitHub Linux CI supplies integration evidence.

Final live PR256 is OPEN, exact5630f1d, base sprint/17, both completed SUCCESS checks from that exact run.
Its mergeability field is UNKNOWN; root must perform its authorized final merge recheck. Actual branch API
confirms targetd492b4732ef31c2c4463bd9bd1e7cffec174f292, now containing approved284 and285. Compared to
original tested base1860e880 this adds tunnels/index.mjs, tunnels-key.test.mjs, bridge-tunnel-state-route.test.mjs
and changes bridge-http protocol/server only. These exact files were independently reviewed in the preceding
source decisions; browser-store source, existing storage tests and declaration/trace dependencies are unchanged.
The reviewed storage source/tests import no bridge-http/tunnels module; new tests and identifiers are disjoint.
This supports the bounded source gate. Original CI is not relabelled as testing newly merged284/285 code or the
combined sprint tree. Aggregate combined CI and release remain separate required work.

## Each own relevant recorded fault independently reproduced

Read original /private/tmp/d283-original-developer-fault-receipt.txt. A disposable exact-head archive at
/private/tmp/p283-po-disposable supplies actual production source. Known-positive selected35 cases passed
before faults. Each isolated command selects only its numeric case in browser-store-settings-export.test.mjs.

| Case | Recorded source transformation → actual own failure node | Same case after exact restoration |
|---|---|---|
|283001|export.mjs:44 storedSettings returns{} → test:95 actual{} instead of every implemented family/value|exit0/pass1/fail0|
|283002|export.mjs:8 ITERATIONS1 → test:126 actual1 expected600000|exit0/pass1/fail0|
|283003|catalogue removes remote-session family → writeSetting → test:153 UnknownSetting for remote-session:lab|exit0/pass1/fail0|
|283004|export.mjs:49 unknown-key validation removed → test:204 missing NotAnExport rejection before partial write|exit0/pass1/fail0|

Every fault actually exits1/fails1. Each same own case after byte-exact restoration exits0/passes1 with
0fail/skip/TODO/cancel. Restored export.mjs SHA25685a7efae4e85093453ec44ad16ca0d81b2959b1c476e495637adb16531d4a78c,
blob b4efd04a36535794b3afa66ed8f2a67ed4275c1b; catalogue SHA256aa1fa75d69059330f1b49d1e10cc299f4a4dfbdb980e052f7f6e0e87bc1efd54,
blob1421558d0fb76257b976ee64f196ab8bbb041f47 equal the source head. Unchanged index blob
a0dc72ce0a08d2a263518e7176627a571788b391, storeblobede229398c38f93056d1eb26c79a562a77567407,
new testblob40e7644f335a0e10a45ca61916984b4125041dcc. Private actual per-case logs
/private/tmp/p283-po-TST-28300N-{fault,restored}.log retain the results. No repository source/test changed.

Selected new4/old17 storage/declaration10/trace4 suite35/35 passes,0fail/skip/TODO/cancel,279.001ms
(/private/tmp/p283-po-positive.log); separately selected retained browser-store release4/4 passes,74.710ms.
Thus all21 old storage unit/release outcomes are retained. New plain case covers all11 implemented families
and every constructed secret, a second instance excluded, exact version1 envelope, and Node reading with
localStorage unavailable. Locked case uses real WebCrypto, exact KDF/cipher shape and complete decoded
settings, wrong-passphrase refusal with raw snapshot unchanged. Import case keeps deliberately noncanonical
existing JSON bytes, adds absent keys and rejects malformed/unknown-after-known input before any write.

Independent private public-API probe follows the actual Map fixture and function signatures: same storage,
two instances, two distinct session names, positive locked export/read/import, own raw kept bytes, other
instance unchanged, raw Clear removes only the chosen instance's chosen session. Canonical actual
 testDeclarations reads four unique numeric283001–004 at lines78/102/140/167, unit/MOD-browser-store,
lowercase given/input/expect/guards, all nonempty; actual traceGraph/tracesTo positively returns three cases
for SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS, then zero for an unrelated signature
requirement. Probe receipts are /private/tmp/p283-po-boundary.log; no personal storage is accessed.

## Preserved limitations and disposition

Five Python skips remain groups, two nightly SPEC scans and two sprint-record checks. Six expected failures
remain three CR/CRLF approval twins, backlog order, outside-section SPEC bytes and trailing blanks. Eight
Node TODOs remain R2/R3/A3/A4 plus release/core G1/G2 record-as-proposal findings. These are existing
limitations, not product passes. Unknown cost remains null; manual reviews have no invented fixed-round cap.

No Mac Electron/native app/browser/focus/clipboard/system setting/device audit, real SSH host or paid service
was touched. Full local native/glob commands were never run by this reviewer. No external publication,
child agent, source/test/contract modification, deployment or distribution occurred. Root may publish/comment,
recheck actual base/head/checks and merge this exact source. Both separate source decisions for this job are
now complete; independent E/predecessorE release writing, item-wide release, aggregate sprint checks, closing
and human report acceptance remain open. This gate neither closes an item/sprint nor accepts human artifacts.

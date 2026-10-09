# Development → Release testing — ITM-284

**MEASUREMENT**

Decision: **PASS** for [PR255](https://github.com/akmaier/agent-m/pull/255), exact owned source head
`15c9f6f38ce6400f6cefd494ae012a75fa3e2070`, into actual `sprint/17` at
`1860e880c2dd972cdc80700f61487620ea3952ca`. Decider: po-sol, independently of developer-terra-c.
Job: JOB-20261009-1652-p284. Actual Taken from clock: 2026-10-09 16:54:31 UTC;
final live-check clock: 2026-10-09 16:58:40 UTC. Unknown usage and cost: null.

## Authority, original inputs and isolation

Read the published fresh Start on main `df81829` before creating the new isolated
`.agent/worktrees/agent-po-sol-284-gate-17`, branch `codex/p284-source-gate-17`. Read full original
AGENTS.md, SPEC.md and README, Team2 process, participants and pinned scrum-wip, Sprint17/item284,
original implementer Start, accepted UC003/011/044, ARC037/040/052, MOD-tunnels/desktop-shell/test-document,
the working shell composition, runtime acquisition, actual owned source and test files, original planning
evidence, source history and original developer fault receipt. No summary replaced an original contract.
The pinned scrum-wip text at `ef33e2f501289930960f13b55936e9b557003993` equals the current model bytes.

Team2's Definition of Done adds no condition to the job rules. SPEC §11's tests-first/module ownership,
§12's declared readable tests and relevant executed counterproofs, and §13's independent gate and Definition
of Done apply. The pinned model's Development → Release testing gate is decided by Product Owner on
this item PR, green CI and DoD. Manual Scrum corrections are not the automatic three-round draft loop.

Current blob/approval equality was verified for MOD-tunnels `0d7ed13e3e793bf081636b53c1ae64c7f15485f9`,
MOD-desktop-shell `71d36abb286361f9349b30f3fa9bb8bd2e4f4a06`, ARC052
`3fee08bacbb70bd95ecdfac91417f06f9a07d95c`, and UC044 `6c80417a691b105488b2426c25245ae7f39a33a7`.
This records source readiness against accepted artifacts; it accepts no human artifact.

No reviewer source/test/accepted-doc change, external write, child spawn, real SSH connection, paid call,
personal key or device-audit access, browser/native Mac app/clipboard/focus/settings interaction occurred.
The only executed Node tests were the selected nonnative key/declaration/trace files in a disposable archive
of the exact head. Full native/integration verification is the existing GitHub Linux CI only. A reported broad
local native run is excluded from this decision's evidence. Primary remains main.

## Concrete accepted consumer and failure node

Accepted MOD-desktop-shell.md:148–154 Start supplies its controlled per-user data folder to
MOD-tunnels.ensureKey; MOD-tunnels.md:40–56 owns the two key files and the public-only return/error types;
UC044 alternative6a2 consumes the shown public key. Current src/desktop-shell/compose.mjs:5–7 supplies
only job handlers, and does not yet compose this key path. The source slice does not claim that integration.

At tests-first head the actual test child reaches import of src/tunnels/index.mjs, which is absent, and fails
with ERR_MODULE_NOT_FOUND. The same child's real ssh2 setup has already generated/parsed a matching
Ed25519 pair and asserted its version. The implementation closes that precise prerequisite node:
`src/tunnels/index.mjs:27 ensureKey(dataFolder) → :28–30 owned ssh paths → :32 mkdir → :39 real ssh2
utils.generateKeyPairSync('ed25519') → :40–42 owner-only private write/public write → :44 matchedPair
(:21–24 parse both and compare public SSH bytes) → :45 publicKey/fingerprint (:16–18 SHA256 of SSH bytes)`.
A complete pair instead takes :35–37 reads with no rewrite. Refusal at mkdir/write becomes :48
notWritable(dataFolder,error) → :9–13 name NotWritable and exact folder.

Production :6–7 uses ordinary createRequire('ssh2'). Only the new MOD-tunnels-named adapter acquires
ssh2@1.17.0 outside the checkout, following desktop-shell.test.mjs runtime's exact npm cache pattern, then
uses ordinary Node children with NODE_PATH. It verifies version and real generation/parse correspondence
before source calls. The exact installed package's README Generate an SSH key/Utilities was read; it
states default new OpenSSH output, the generation API and parsing/public SSH API. No fake generator,
automatic production install, temporary production path, manual PEM conversion or packaging claim is used.

## Tests-first, ownership and complete CI

Actual parent chain:
`1860e880c2dd972cdc80700f61487620ea3952ca → 271bc97590dc0e12661869da1766600fd9fe09e3 →
15c9f6f38ce6400f6cefd494ae012a75fa3e2070`.
First writing commit adds only tests/tunnels-key.test.mjs. The complete PR diff adds only that new test
and src/tunnels/index.mjs, within MOD-tunnels ownership. No previous test/helper, source module, manifest,
lockfile, workflow or architecture byte changes. New final declarations align to the canonical per-case
schema; final refusal assertions test the accepted name/folder/no-created-key contract.

[First red CI37961031080](https://github.com/akmaier/agent-m/actions/runs/37961031080) has source head
271bc97590dc0e12661869da1766600fd9fe09e3. Both checkout logs name actual merge
`d38bae0ac7ca1d3e53ffc5ec0a77ef88d9e66d71`; GitHub's actual git commit object has parents
1860e880c2dd972cdc80700f61487620ea3952ca and271bc97590dc0e12661869da1766600fd9fe09e3,
tree `00c5fa49e92e716a7007723f5eda57f14b020541`, equal to the tests-first source tree.
Python succeeds:399 tests,388 ok,5 skipped,6 expected failures,56.945s.
Node fails:1043 tests,1025 pass,10 fail,8 TODO,0 skipped/cancelled,63.781s.
Three new cases284001–003 fail at the absent source import after real package known-positive.
The other seven failures are honestly retained:276001/002/003/004/006/005 at Linux Openbox acquisition
(40s timeout, SIGTERM, ETIMEDOUT, unavailable probe), and276901 at the native fixture-lock timeout.
They are neither blamed on ensureKey nor relabelled as passed on that commit.

[Final CI37961925061](https://github.com/akmaier/agent-m/actions/runs/37961925061) is SUCCESS at source
15c9f6f38ce6400f6cefd494ae012a75fa3e2070, python113926639420 and node113926639835 both complete success.
Both actual checkout logs name `f7356d29ffa2265401a84451e5986b1f3094a1e0`; its git commit object has parents
1860e880c2dd972cdc80700f61487620ea3952ca and15c9f6f38ce6400f6cefd494ae012a75fa3e2070,
tree `3e399788334548b618a86aad491028337f65f41b`, equal to the reviewed source tree.
Python:399 tests,388 ok,5 skipped,6 expected failures,55.153s; full job61s.
Node:1043 tests,1035 pass,0 fail,8 TODO,0 skipped/cancelled,58.294s; full job65s.
Native276001–006 and independent276901 remain executed and pass in Linux CI.
Unchanged workflow gives each job timeout-minutes2. No passed broad suite was rerun locally.

Complete logs were retrieved and read through all lines and every named outcome: final7170 lines/729384 bytes,
SHA256 `4f778d798f613f83cbab74b1c157ddab7ea121e922a35398d259ca360ee194ea`;
red7391 lines/753754 bytes, SHA256
`dd06e85c61a91d332e7965c67b5597542db1546f4df78efebfbeee5cc744c4e1`.
All399 Python and1043 consecutive Node case outcomes are present in each, including the Python docstring-named
ONE GITHUB TOKEN SERVES EVERY FEATURE case. Matching all1442 names across runs gives precisely ten outcome
changes: three new key cases and seven native fixtures. All other outcomes, TODOs/skips/expected failures persist.
Private complete logs: /private/tmp/p284-final-ci.log and /private/tmp/p284-red-ci.log; complete named outcome
ledgers: /private/tmp/p284-final-every-outcome.txt and /private/tmp/p284-red-every-outcome.txt.

Final live PR query remains OPEN, exact head15c9f6f38ce6400f6cefd494ae012a75fa3e2070, actual target sprint/17
at1860e880c2dd972cdc80700f61487620ea3952ca, and precisely both completed SUCCESS checks above.

## Independent relevant fault reproduction and canonical declarations

Original developer receipt /private/tmp/c284-original-developer-fault-receipt.txt records the three production
faults. Independently reproduced them in /private/tmp/p284-po-disposable, a git archive of the exact source head,
without editing the author's worktree or reviewer checkout. A known-positive key run preceded faults.
For each case run `node --test --test-name-pattern=TST-28400N tests/tunnels-key.test.mjs`, fault exit1/fail1,
then byte-exact restoration and the same case exit0/pass1,0fail/skip/TODO/cancel.

| Case | Production transformation and failure verification | Expected after exact restoration |
|---|---|---|
| TST-284001 | index.mjs:45 return publicKey replaced by wrong-public-key → ensure child returns marker → test:89 equality fails actual wrong-public-key vs stored real ssh-ed25519 public bytes | matching public bytes, real pair correspondence, correct SHA256 fingerprint and no privateKey property |
| TST-284002 | index.mjs:41 chmod0600 replaced by0644 → real private stat → test:109 fails420 !==384 | exact private/public bytes and result retained across two ordinary Node children; owner-only0600 |
| TST-284003 | index.mjs:11 name replaced by WrongWritableError → controlled owner-denied mkdir → :48 error wrapper → test:136 fails WrongWritableError !==NotWritable | supplied exact folder, NotWritable, no created private key |

After every restoration, source SHA256 equals
`678c0bff08757eb31cbb350027d504ba0b61639365b1674d45cbb56938e0d29f`, git blob
`1962849ff10cbb0dec73a77867bb582200935f91`; final test blob
`427d67e21195aaa29bd9825aeb7d9d000b618423` equals the reviewed head. Logs for each fault/restoration are
/private/tmp/p284-po-TST-28400N-fault.log and /private/tmp/p284-po-TST-28400N-restored.log.

Selected final key/declaration/trace files run17/17 pass,0fail/skip/TODO/cancel,717.615ms, private log
/private/tmp/p284-po-focused-final.log. A separate ordinary Node known-positive verifies actual installed
ssh2 version1.17.0 and matching real generated/parsed SSH bytes. Canonical testDeclarations reads three unique
numeric ids284001–003 at test lines77/95/114, each unit/MOD-tunnels, guarded THE BRIDGE CREATES ITS OWN SSH KEY
and UC044, nonempty given/input/expect, paid:null. Canonical traceGraph/tracesTo positively returns exactly those
three guarding tests, then no tests for the known unguarded signature requirement. These are actual delivered
Node declarations/graph checks, not an inference from test_origin_links.

## Preserved limitations and disposition

Python expected failures remain the three apply_approvals CR/CRLF twins, own backlog order, spec_gate outside-section
bytes and verbatim trailing blanks. Its five skips remain own group files, the two nightly whole-repository SPEC
scans, and the two own sprint-record checks; their original reasons remain unchanged.
Node's eight TODO failures remain R2 product SPEC no-token fallback, R3 token-expiry paste field, A3 batch acceptance
fallback, A4 save fallback, two release G1/G2 record-as-proposal cases and two core G1/G2 record-as-proposal cases.
They are known limitations, not newly passed cases or a complete released-product claim.

Root may publish this independent decision and carry out an unchanged exact-head green merge into sprint/17 after
its final live recheck. This does not close ITM284 or Sprint17, decide the aggregate release/closing gates, accept a
release report or human artifact, or deliver shell composition, tunnels, HTTPS/browser reachability or distribution.
Developer-terra-e/predecessorE remains reserved for later independent selected-item release writing after the approved
source merge. No extra quota, speculative requirement or source/architecture edit is introduced.

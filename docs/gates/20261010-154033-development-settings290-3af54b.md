# Development gate — ITM290 Settings disclosure correction

**MEASUREMENT**

at: 2026-10-10 15:40:33 UTC
by: po-sol / gpt-6.1-sol
job: JOB-20261010-1534-af03
usage: null
cost: null

## Decision

**HOLD** for [PR302](https://github.com/akmaier/agent-m/pull/302), exact head
`3af54b46c7b31fe97c48e6fb9465df065d2c89c8` into base `2a0e9977669af0d4e30b534fa617728b005b1d05`.
Do not merge this head. The missing Notifications fold from the [prior exact HOLD](20261010-151418-development-settings290-df2a673.md)
is repaired for UC042 purpose/storage/readers, with valid own red-to-green proof. Its contents still omit the specific
Notifications explanation required by accepted UC047 and MOD-settings-pages. No native-notification action or new
architecture is required to correct that owned disclosure/test node.

The original declared Development → Release condition is “CI is green on it and the Definition of Done holds”
(docs/process-models/scrum-wip.md §Gates). Team2 §Definition of Done says “The job rules hold for every pull request;
no condition is added.” SPEC §THE DEFAULT DEFINITION OF DONE IS THE JOB RULES names own tests-only red, owned modules,
new test guards/modules and recorded gates. This review adds no fault-per-assertion quota or native verification.

## Concrete remaining failure node

Accepted UC047 blob `9c3cf6e0500518f2e8af47f1efc160d351378f21`, Main flow lines58–59, states:

> The line carries a folded **What is this?**: what is checked and how often, that the checks go to the repository servers
> with the tokens of this browser and nowhere else, and that nothing is checked while no page of the dashboard is open.

Accepted MOD-settings-pages blob `6357592c6ff7a2dd528ae959c918ad4ec1a903a4`, Interfaces lines132–135, states the same
Notifications folded contents. UC047 step2 names pending SPEC entries, use cases, architecture files and waiting release
reports as the things checked. These are existing assigned Settings/UC047 disclosures, not whole-use-case implementation
or another device delivery experiment.

Exact path: `tests/settings-pages-settings-regressions.test.mjs:210 → render:44 → public View.settings Route.render →
settings.mjs:670 → notificationsControls:396 → section:426 → whatIsThis:429 → helper:26 → details/summary/p`.
The inspected helper creates the folded disclosure. Its exact429 text states generic attention, the browser's switched-on
setting and browser/shared-owner readers. It does not state what acceptance records are checked, the five-minute
cadence, checks going only to repository servers with this browser's tokens, or no checks while no dashboard page is
open. Known-positive inspection finds those exact purpose/storage/readers words in the real fold and the partial
cadence/server/page-open statement in `refresh:404`; that statement is the separate status paragraph only when on.
It is not text inside the fold. The off/denied state cannot expose it there either. Actual/expected comparison is at the
owned disclosure constructor, by immutable source inspection, not a claimed local rendered observation.

TST290124:209–218 first proves the public Usability section exists, then verifies one direct details and only
`/notification|delivery/`, `/browser/`, `/read/`. It therefore passes when all four explicitly required Notifications
explanation contents above are omitted. TST290123's selector still excludes Notifications. Existing switch/watch/permission
battery checks behavior; its unchanged passing results do not establish this folded content. Return this exact contents
and expectation gap to C in a fresh continuation; preserve notification controls, status/result paths, stored state,
permission timing and the person's existing delivery confirmation. The Developer determines the bounded correction
against the accepted originals.

## Repaired and retained source evidence

The exact base-to-head diff is three owned files,349 additions/22 deletions: settings.mjs, module regression tests and
tabs tests. Own prior complete Settings/tabs/source/guard reads were retained after unchanged-content verification;
current complete290 regression body and changed source/diffs were personally received, with truncated ranges repaired.
The prior-head source hash is c295369d3e1beb3f7e7feb1dad24f74a3363ec1c0211b61a277c252490da2911. Static byte comparison
proves the only subsequent source difference is explain("notifications") replaced by the direct whatIsThis text;
all action/state code is unchanged. Tabs battery remains exactly22d4fcd. No unmerged D/A/E bytes are substituted.

|Preserved path/outcome|Evidence at the existing node|
|---|---|
|repositoryLine → expiry|Unset expiry defaults to90days; TST116 retains the initial empty-versus-date failure and current pass.|
|productControls → privacy notice|Issues/repository/unchanged/publication/protected-space/history-rewrite warning retained; TST117 passes.|
|product callbacks → saveFile|Trusted one-click commit and scripted refusal remain; TST118's positive one commit then no extra write passes.|
|repositoryLine/productListControls → Clear/Remove|Confirmation before browser mutation; TST119 preserves refusal,110 confirms token/last-test removal.|
|section construction → whatIsThis|Repository/product/Bridge/jump/session/export/clear folds stay; TST120/123 pass. Notifications now has a fold;124 passes its limited contents checks.|
|collaborator Save/Remove → commit/readback|Chosen legacy date, exact name/account withdrawal, similar suffix and unrelated bytes preserved;121/113 pass; GitHub/GitLab normalized history links retained.|
|tabbedSettings → retained panels|Shared btn class, unfinished input/result/secret state and no storage mutation on selection retained by109. No rendered geometry is inferred.|

Initial tests-only fcb94500e4afde058d745b49d0aacbd22199d214 owned CI38055758276 red for116–121 before source remains.
Later failed38057053454 and prior exact HOLD remain; a later different-head green erases neither. New tests-only
`6f70e9d7b094897dd07b73b8476fe3386298a2a4` changes no production byte. Its own
[red run38063324960](https://github.com/akmaier/agent-m/actions/runs/38063324960), attempt1, has sole ordinary Node
failure124 at test215, direct-details0 !==1;123 remains positive. Node1143/1134pass/1fail/8inheritedTODO,63s;
Python396/5skip/6expectedfail,success66s. Actual checkout86615e3900ba98a77524f48365ca723196fb6af3 has parents2a/6f70
and treeafcc18ec24f86565b383e3b1b0d7992c00fa6184, equal to the tests-only candidate tree.

## Exact green CI and raw same-case counterproof

[Run38063605683](https://github.com/akmaier/agent-m/actions/runs/38063605683), attempt1,pull_request, exact3af:
Node success15:26:22–15:27:46Z,84s,1143tests/1135pass/0fail/8inheritedTODO; Python success15:26:22–15:27:22Z,60s,
396tests/5skipped/6expectedfailures. Raw checkout log names e3398a357cbde3fb5520ee4423149d09944bfb48; original GitHub
commit metadata gives parents2a0e9977669af0d4e30b534fa617728b005b1d05 and3af54b46c7b31fe97c48e6fb9465df065d2c89c8,
tree955db60419d087147fcbe2ada0762a620d4e723e. Static git inspection confirms this equals the exact candidate tree.

Raw TST290122: Ubuntu Node22.23.3, argv --test --test-name-pattern
TST-29011[6-9]|TST-290120|TST-290121|TST-290123|TST-290124 tests/settings-pages-settings-regressions.test.mjs;
cwd /tmp/agent-m-290-settings-fault-ayU5vJ/repo, isolated copied source, child recursion guard1, NODE_TEST_CONTEXT removed.
One unique function repositoryLine declaration is renamed. All eight116–121/123/124 fail normally, status1,
signal/error:null, repositoryLine undefined at render661. Source is restored byte for byte; the SAME eight pass normally,
status0,signal/error:null,stderr empty. Fault15:27:33.304–.537Z; restoration15:27:33.537–.786Z.
Fault SHA4ac4d3372ca9b35888e942f4fb4eeb59a25bda50a9ac705ee772bf26d18b485c; original/restored source
b746571bd6c5574734daa13d46ee2414f0f6e0d3dfe146a43a79fd386f06e32a; test
9da63c15079d53ac3b0958d13dd8f1dea18fd7307bbfc220a3708c512e1f0d1a. This is valid case sensitivity through the route;
it does not assert coverage of the missing folded contents or impose a second fault per assertion.

Raw node.txt TAP escaping remains untouched. Independently extracting its counterproof record and removing only TAP's
escaped# makes it exactly equal to counterproof.json, including ALL failed/passed streams; doubled literal newline
escapes remain literal. That derived JSON and stream-omitting semantic helper do not replace the raw log. Full original
streams/commands/times/statuses were inspected; no local counterproof/test/runtime was run.

Inherited TODOs remain R2 UC006 token fallback, R3 UC042 renewed-token paste, A3/A4 batch/save permission fallback and
G1/G2 job-record status/acceptance (both release and core). Python expected failures remain three apply-approvals CR/CRLF
twins, own-backlog layout, SPEC gate outside-section bytes and proposal trailing blanks. Skips remain own group-file,
two nightly SPEC-open and two own-sprint checks. None is declared fixed here.

## Original inputs, independence and limits

Fresh Start/current PRIMARY AGENTS were fully read before dedicated Taken15:36:51UTC; root published it then created
this one isolated context at d402cd2. AGENTS SHA3cf05ca47af95bc2ae48053d3ca31c0d58f27d5004b916abe10eba253a252c7f governs
this gate. C's initial generation predates the human Designing update; its current continuation reread currentAGENTS.
No retroactive claim is made. Own complete SPEC/README were retained after exact unchanged hash verification:
SPEC1de56e76de63bfe5f3f4bb98820adad801041def/SHA676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594;
README37284376636ddf07efa58b63be4ff8a2ea12300a/SHAf0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b.
Original ch10 principles62–103/ch12 Design/KISS178–232 are personally read; this gate proposes no design. KISS,
one responsibility and developing against interfaces keep the correction in its owned disclosure boundary.

Current Team2 declaration/participants/model/Sprint19/item290/C1309-26db were freshly read. Own full accepted UC003017042047,
MOD-settings-pages/ARC038 and needed public storage/personal-data/artifact interfaces and original caller/guard reads
were retained after immutable unchanged hashes; UC047 was also freshly read in full. Human concurrent multi-team SPEC
packages/use-case drafts are OPEN and confer no acceptance. The original working public caller remains dashboard →
legacy settings-view composition → public settings/endpoints adapter → View.settings.render; unmerged D/A/E composition
is outside this exact source tree. Functional token/notification outcomes must survive its separately assigned delivery.

The entire276-line C original receipt /private/tmp/terra-c-settings290-original-input-receipt.md was personally read,
SHAe536fbacb727f83832d7b931bf1c0d7669ce3dba0c4c6b9c8def396bd2c24a9f. All103 ref/path/blob/SHA rows match immutable
originals. It truthfully records completed66 original guards plus merged296 as post-generation recovery/comparison,
then later123 fixture correction and124 generation after the concrete prior HOLD. This does not backdate original
receipt, declare I received C's entire66-body battery, or erase the original input shortfall. Final source/test identities
match the exact candidate. The remaining accepted disclosure expectation above was found by this independent review.

I, po-sol, authored none of this source/tests/caller or mapped predecessor implementation. TerraC corrections and prior
TerraB/C/D Settings authorship remain distinct from this assigned independent Development decision. Independent Release,
actual composed public290 and controlled narrow/desktop Linux layout remain separate obligations after source delivery.
Legacy token.tested versus canonical value/name/expires/stored plus adjacent last-test and shallow Usability versus
nested Notifications fixture limits remain; this CI does not complete290, wholeUC003/002/047, current-browser trusted
HTTPS267, aggregate/closing gates, tagged release, deployment or human acceptance. Existing notification delivery is
retained. Only this new gate file is written; root alone publishes/comments/merges/records actual Ends.

## Evidence pins

|Prefix /private/tmp/root-p19-ci-|Suffix|Bytes|SHA-256|
|---|---|---:|---|
|38063324960-|run.json|12734|692d2f43f42fa1998483352b5cd9f10dd7ea7e3a92a9dc14ebcdf5dc22e9fb8b|
|38063324960-|jobs.json|4063|03d2c38157de09b0789c304f11ceaae56589df4c3224819a4a18813300daf05a|
|38063324960-|logs.zip|361514|40ce80a8cb8762a0cb337edc54978cdaa1be8a1466120e508ce0666d5f6e5aca|
|38063324960-|node.txt|874943|dfc5ce85ef0734d45c294e5af895e8a76883a4660c079546dc96a973ce0b6231|
|38063324960-|python.txt|75447|4c9e45e024641b27873b6522b96e9f8ca99a46076b3d8ae05e5c8644d66b1066|
|38063324960-|checkout.txt|6800|f91c164a10b7e660efc29ec7fe4dd63fbbbe61426c3006c1da32c2cd75069cab|
|38063324960-|checkoutcommit.json|51481|012c0e9a219986ea4b5d6c8bd108b2e03452fbebecae6e022e9eaacf38f50934|
|38063605683-|run.json|12745|7de599da631a3001bd1a8f1bcc11847b9cef0a14e41e0de1bd81f7250178903c|
|38063605683-|jobs.json|4063|dca121beb75ced68becdad5f606d09313f9002d9110389ca18a40fecfd4c5578|
|38063605683-|logs.zip|362898|5e6cd43ca9c11f0c700a4e515d9eba73f03ba18ae5a64063dfe99eec9be9d6cd|
|38063605683-|node.txt|875932|5c1d8c6cbc833b3b24cf29a24d4f9b259373afc1df67b3bef9e3661c07ffd82c|
|38063605683-|python.txt|75447|017839513628b846f8b7a1666db4fc08f84d879503eb98bebe2e723b2263eef7|
|38063605683-|checkout.txt|6800|735ad1ab7ebc93a873d1503462f9e51b3f1a1ab5ae5735f980867cb516131e89|
|38063605683-|checkoutcommit.json|52088|db471a25c27be0d25ea6f1678efaf113bfdce31926ca1981775f16a59466032e|
|38063605683-|counterproof.json|13785|c1f7b1406fde62643a78061dea90560f72a2f83fc815912b30cfa63baf9b6315|
|38063605683-|counterproof-semantic.json|3308|71786c25dfbae918fcdb3857a6b6710bde25a165f6e20e099bfbbcaccf404d68|

|Exact candidate path|Git blob|SHA-256|
|---|---|---|
|src/settings-pages/settings.mjs|36b8bb09dfd78a9dc6a7b0c40889e72fae84494b|b746571bd6c5574734daa13d46ee2414f0f6e0d3dfe146a43a79fd386f06e32a|
|tests/settings-pages-settings-regressions.test.mjs|3023de4c91fef293f10b7e867cf0154cd5c5b23f|9da63c15079d53ac3b0958d13dd8f1dea18fd7307bbfc220a3708c512e1f0d1a|
|tests/settings-pages-tabs.test.mjs|22d4fcd225bc756e5f5b4f16e279388d6aa06261|bc541dea378c09bd657a631dbd039c86b8e71d99a6e3449171fdbc7514d08286|
|tests/notifications.test.mjs|b3f30a5ccfa5c59843f213f75e13143790561a32|d4bddc721e2e5f63a60004a5789276f013cb3c0f191dfba2d59d28b5248d6fe0|
|tests/dashboard-settings-last-test.test.mjs|665340fd9037c80bec9c5fdcc414029a8e70b981|e3920a6ea199c507260a41b56f4dff9824554bf1422bfc386a6b0816f28d30d2|
|src/site-frame/index.mjs|a4c377a9b07d7d328c4dc5ae68dd88efb7e0cac4|3243f1a0bee7ad04020f6d94c2194b4a589cf03d03632820c1de0d54339a0b6f|
|src/site-frame/explanations.md|c06518abcf784bd611c40534e5d0577c529a732e|fa74523c6b9abf61f6c719d6c9ef6e5855ff057ed9a5fe4449f0ba9d8efdfe81|

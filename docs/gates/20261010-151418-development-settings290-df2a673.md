# Development gate — ITM-290 Settings correction

**MEASUREMENT**

at: 2026-10-10 15:14:18 UTC
by: po-sol / gpt-6.1-sol
job: JOB-20261010-1503-5626
usage: null
cost: null

## Decision

**HOLD** for [PR302](https://github.com/akmaier/agent-m/pull/302), exact head `df2a6731dfd724c5c0fd05f47acf719c4462f4bb` into base `2a0e9977669af0d4e30b534fa617728b005b1d05`. Do not merge this head. Its owned Settings disclosure correction still leaves the Notifications section without its folded explanation. The green CI and all demonstrated corrections below remain valid evidence; they do not cover this failure node.

The declared Development-to-Release gate is “CI is green on it and the Definition of Done holds” (docs/process-models/scrum-wip.md). Team2's Definition of Done says “The job rules hold for every pull request; no condition is added” (docs/process_team2.md §Definition of Done). Accepted UC-042 blob `a8c595676ef0afd54290024c928b7268c49dfbe9`, lines94–96, says: “Every section and every line carries a folded **What is this?**: what the setting is for, where it is kept, who can read it there”. MOD-settings-pages §Interfaces also expressly includes Notifications and each section/line's folded explanation. This is an existing assigned requirement, with no new fault-per-assertion quota or native-notification obligation.

## Concrete blocking path and verification at its node

At the exact head:

`src/settings-pages/settings.mjs:670 → route.render → notificationsControls(context):396 → settings-notifications section:424 → explain("notifications"):427 → src/site-frame/index.mjs:98–99 → TOPICS.get returns undefined → empty div`.

`TOPICS` is built from the actual `src/site-frame/explanations.md` headings (index.mjs:62,85). A static exact-heading inventory, verified first against the known-positive `endpoint-test` topic, finds 24 topics and zero `notifications` topics. The inspected `explain` implementation returns `document.createElement("div")` on that missing topic before creating its folded details/summary. Actual: the Notifications section has its state/buttons and an empty explanation element. Expected: its folded What-is-this explaining purpose, storage and readers. This is original source inspection, not a claimed local runtime observation.

The existing green `TST-290123` selects sections using `^settings-(repository|product|bridge|jump-host|remote-session|export-import|clear)` at test line189. That expression excludes `settings-notifications`, and the test does not inspect it. `TST-290112` checks denied permission and absence of permission/storage actions, not the folded explanation. Existing notifications unit tests preserve switch/watch/permission behavior; they do not establish this Settings disclosure. The fault in TST-290122 intentionally breaks repositoryLine and therefore cannot establish coverage of a section the disclosure test never selects.

Return only this owned Settings disclosure/test gap to the Developer under a fresh continuation. Preserve Switch on/Test/Switch off, permission timing, stored state and the person's existing delivery confirmation. No accepted artifact or unowned frame change is required by this decision; the Developer determines the correction against the current public interface.

## Positive source and failure-node evidence retained

The complete exact three-file diff is 329 additions/21 deletions: settings.mjs, the new regression battery, and the tabs battery. The complete current Settings source and both test bodies were inspected.

| Path in settings.mjs | Transformation and inspected evidence |
|---|---|
| route.render:661 → repositoryLine:277 | Missing expiry now defaults to ninety days; TST-290116 failed initially on empty versus 2027-01-08 and passes at the exact current head. Existing stored expiry/renewal/test metadata controls remain. |
| route.render:657 → productControls:587 | Before saving, privacy notice names issues, unchanged data, public publication, protected non-public space and history rewrite. TST-290117 verifies those visible consequences and legacy consent readback. |
| productControls:521,540,563 → saveFile | All three product write callbacks stop an untrusted event; TST-290118 has the known-positive trusted commit then no additional scripted commit. Existing original failure was two commits versus one. |
| repositoryLine products branch / productListControls | Clear/Remove ask confirmation before browser mutation. TST-290119 retains the actual product on each refusal; tabs TST-290110 retains confirmed product/token/last-test removal. |
| whatIsThis and repository/product/Bridge/jump/session/export/clear sections | Folded disclosures are present at those inspected nodes; TST-290120/123 pass for their explicitly selected sections. This evidence has the Notifications exclusion above. |
| productControls:535–559,564–581 | Legacy chosen consent date reaches committed row and visible readback. Exact name/account removal preserves similarly suffixed person and unrelated bytes. Canonical schema remains Name/Account/Agreed yes, with commit-owned dating; TST-290121 checks GitHub/GitLab normalized withdrawal links, TST-290113 unrelated legacy bytes. |
| tabbedSettings:598 → retained panels:659–677 | Shared btn class added; same panels retained across selection. Existing TST-290109 checks route/state/unfinished input without storage mutation. No rendered geometry is inferred. |

The tests-only first commit `fcb94500e4afde058d745b49d0aacbd22199d214` had owned Node CI38055758276 RED for six functional cases116–121 before source; Python succeeded. The original actual failures were empty expiry, missing privacy destination, scripted extra write, cancelled removal mutating products, missing folded token explanation and missing chosen consent-date control. Later CI38057053454 at677bed also failed (121/122/110/113); that outcome remains. Earlier beb9 green38058399685 does not approve this updated head.

## Exact current CI and raw counterproof

[Owned run38061113591](https://github.com/akmaier/agent-m/actions/runs/38061113591), attempt1, pull_request, head `df2a6731dfd724c5c0fd05f47acf719c4462f4bb`: both Ubuntu jobs success, each65 seconds. Node:1142 tests,1134 pass,0 fail,8 inherited TODO; Python:396 tests,5 skipped,6 expected failures. Complete downloaded logs are retained unchanged.

Actual checkout log names `0c861a9b7bb3011d3a67379035e09e4152ce6ff5`. Its original GitHub commit metadata names parents `2a0e9977669af0d4e30b534fa617728b005b1d05` and `df2a6731dfd724c5c0fd05f47acf719c4462f4bb`, tree `e13712dcd949bc982ff1c9b35e842d2a5335a9f6`; static git inspection confirms the candidate has that exact tree. This is the real CI checkout, not an assumed candidate checkout.

Raw TST-290122 record: Ubuntu Node22.23.3 command `--test --test-name-pattern TST-29011[6-9]|TST-290120|TST-290121|TST-290123 tests/settings-pages-settings-regressions.test.mjs`, cwd `/tmp/agent-m-290-settings-fault-D46JYP/repo`, copied source, child recursion guard1 and NODE_TEST_CONTEXT removed. One unique `function repositoryLine(context, info) {` is renamed; all seven selected cases116–121+123 fail with normal status1, null signal/error, at route.render:661 (`repositoryLine is not defined`). Exact restoration passes the same seven with normal status0, null signal/error. Fault interval14:50:00.108–.241Z; restoration14:50:00.241–.418Z. Fault hash `92f4fae1c06e07dab8013662ec61e8dcee0c71e1a67e66c5bbefe1b63a776a4a`; original/restored source hash `c295369d3e1beb3f7e7feb1dad24f74a3363ec1c0211b61a277c252490da2911`; test hash `fbd48b0e94916ed98e7711b8dbd7868bcb54fb25a06ea32025495810da6d8b03`.

Raw node.txt retains TAP's escaped `\#` and doubled literal newline sequences. counterproof.json and semantic helper are derived inspection aids; the helper's removal of escaped# and omission of streams do not replace the original raw log. The broad route fault demonstrates selected-case sensitivity, with no fabricated per-assertion fault obligation.

Inherited TODOs remain R2 UC006 token fallback; R3 UC042 renewed-token paste field; A3/A4 ITM133 batch-accept/save permission fallback; G1/G2 job-record status/acceptance, each appearing in release and core tests. Python expected failures remain three apply-approvals CR/CRLF twins, own-backlog layout, SPEC gate outside-section bytes and proposal trailing blanks. Skips remain own group-file check, two nightly SPEC-open checks and two own-sprint-record checks. None is relabelled as solved by this module correction.

## Original inputs, timing and independence

Fresh original Start and current PRIMARY AGENTS were personally read before dedicated Taken15:04:38 UTC; root published Taken then created this one isolated branch at `fa8802d600ddedf35666585092cbda2ff9a159a8`. Current AGENTS SHA `3cf05ca47af95bc2ae48053d3ca31c0d58f27d5004b916abe10eba253a252c7f` governs this review. Candidate/C-generation AGENTS SHA `1a0429c5f2a1fc219be2595dfb79a8411ad0d301817467cdf428cd2604ba96cb` predates the human update; no retroactive compliance claim is made. The current original design passages ch10 lines62–103 and ch12 lines178–232 were read; this gate proposes no design. Divide-and-conquer keeps this source gate bounded; developing against interfaces and KISS preserve the existing public module boundary.

Own complete SPEC and README originals were retained only after unchanged hash verification: SPEC blob `1de56e76de63bfe5f3f4bb98820adad801041def` SHA `676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594`; README blob `37284376636ddf07efa58b63be4ff8a2ea12300a` SHA `f0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b`. Current PRIMARY Team2 declaration/participants/model, full Sprint19/order/item290 and source job1309 were personally read. Own full unchanged UC003 `82081a084479172f2f8f704211351b052edea8e6`, UC042 `a8c595676ef0afd54290024c928b7268c49dfbe9`, UC047 `9c3cf6e0500518f2e8af47f1efc160d351378f21` and browser-store contract/guards were retained after hashes; UC017 current `4fd4d9c6a4c3551cec7b5e78e5ab54a3e28b8ce4` and old accepted152125 original were read with distinct approval wrappers. Current accepted MOD-settings-pages635759, ARC0381a583 originals and personal-data/artifact-edit contracts were inspected. Human OPEN proposals confer no approval.

The current working legacy caller path was inspected: dashboard dispatch → settings-view routes/findSections/viewSettings/renderSections → settings/endpoints public adapter → MOD-settings-pages.view.settings.render with Store and product:null. This exact candidate does not include the separately scoped D/E caller/tests. Their unmerged bytes are not called a source regression or silently reverted. Own original relevant browser-store guard bodies were retained after exact digests; new regression/tabs bodies and original dashboard-last-test and notifications bodies were read directly. No claim is made that I personally received C's entire66-body input battery.

C's complete original-input receipt `/private/tmp/terra-c-settings290-original-input-receipt.md` SHA `47e2d09ec81ab449c63b33393c1cddc17fde3ee1de1bf240481e448aee88f7f4` was read in full. Its66 guard bodies plus merged296 body and final comparison are recorded as actual post-generation completion; initial generation lacked the inventory and publication was held. My static identity check matches all101 table rows; final candidate source/test hashes also match the receipt's two final content identities. This does not backdate their receipt or the later TST123 generation. The initial723e test hash is superseded by fbd48 after the accepted product fixture/direct-child disclosure correction. The truthful completed-input record is retained, despite the substantive disclosure gap found by this independent review.

The implementing source history identifies TerraC corrections and TerraB/C/D earlier Settings source. I, po-sol, authored none of the candidate's source/tests, caller or their mapped predecessors' implementation. This is an independent assigned Development review; it grants no human acceptance and substitutes for no independent Release gate.

## Evidence identities and remaining public boundary

All following paths use `/private/tmp/root-p19-ci-38061113591-`:

| Suffix | Bytes | SHA-256 |
|---|---:|---|
| run.json | 12468 | 7c95993ee0202e9f00ec5ba744e2f431e3316f3690914d487a7fb55ef5bcb309 |
| jobs.json | 4063 | 1b26c6a0d368af97a61a10ac032139aa18ae5dfca395d476afa56929c42913c5 |
| logs.zip | 363600 | 75ea59484e63c974636a83635e28cc189bfa274f2ecf09ddd562fe686efec531 |
| node.txt | 876504 | 09af3c9c59424ad9e637cdc1c0b9adfe6fc75e8e3db7b9c1076ffb6154f1b6da |
| python.txt | 75447 | 5b2878031baf35e367f3aba81e20c0b0b487b2733606d5d1d7a3318fd98c3009 |
| checkout.txt | 6800 | e6cb451d3e2e39b2bfb2773ad56ace49007a75eec20fe76098076d701c9aa28f |
| checkoutcommit.json | 2582 | 37eb85460a7a53e0c1bb8b4f1f40b488dfae79664573e890d70cbe1136d177bd |
| counterproof.json | 12331 | 24bb40c31c9e58a322a698c262781e9caad9a1fbdaa6ee7979fed121a6e02090 |
| counterproof-semantic.json | 3083 | ea54d995fa2eebb009716f8c60494ff297d654032307764a9382a408057c2c37 |

| Candidate path | Git blob | SHA-256 |
|---|---|---|
| src/settings-pages/settings.mjs | 6e321ceb3783d79ca61ccdc607383d1f985ad6fc | c295369d3e1beb3f7e7feb1dad24f74a3363ec1c0211b61a277c252490da2911 |
| tests/settings-pages-settings-regressions.test.mjs | e00118658159e9ad590ff45a6f6cdffc54345d51 | fbd48b0e94916ed98e7711b8dbd7868bcb54fb25a06ea32025495810da6d8b03 |
| tests/settings-pages-tabs.test.mjs | 22d4fcd225bc756e5f5b4f16e279388d6aa06261 | bc541dea378c09bd657a631dbd039c86b8e71d99a6e3449171fdbc7514d08286 |
| src/site-frame/index.mjs | a4c377a9b07d7d328c4dc5ae68dd88efb7e0cac4 | 3243f1a0bee7ad04020f6d94c2194b4a589cf03d03632820c1de0d54339a0b6f |
| src/site-frame/explanations.md | c06518abcf784bd611c40534e5d0577c529a732e | fa74523c6b9abf61f6c719d6c9ef6e5855ff057ed9a5fe4449f0ba9d8efdfe81 |

Actual composed public290 and controlled Linux narrow/desktop layout remain E's responsibility after source delivery and fresh scoped fixture adaptation where needed. Legacy token.tested versus canonical token value/name/expires/stored plus adjacent last-test metadata, and shallow Usability versus nested Notifications controls, remain explicit composition limits; functional token/notification outcomes must survive. This module CI does not complete ITM290, whole UC003/002/047, current-browser trusted HTTPS measurement267, aggregate/closing gates or a tagged release. Existing notification delivery is retained without another native experiment.

No local product/test/runtime/native/browser/fault execution was performed. This review used original reads, static immutable Git/evidence metadata and formatting only. Only this new gate file is written; root alone publishes, posts its byte-identical decision and records the actual End.

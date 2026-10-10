# Development gate — corrected ITM-296 / PR299

**MEASUREMENT — 2026-10-10 12:04:38 UTC.** Method: independent original-document and exact-blob static data-flow review, original exact-head Ubuntu CI and same-case child fault/restoration streams, and the existing public declaration/trace caller's retained results. Official GitLab API documents were read for the assigned approval-provenance question. No local product execution or new fault experiment.

Decision: **HOLD** for Development → Release testing on [PR299](https://github.com/akmaier/agent-m/pull/299).

- Head: `1d603d4cd6006ac25d90644e302c7d6a4e8750a5`.
- Base: `c5f380b6065b35c085671acc2682c810bebb5ff1`.
- Reviewer: `po-sol` / `gpt-6.1-sol`, under `JOB-20261010-1158-0400`.
- Dedicated actual Taken: `2026-10-10 12:00:10 UTC`, before root created fresh isolation from `c27e6ee3ca1bf837e6325b710ac104e9e1aa7f47`.
- Usage and cost: `null`.

## Authority and independence

Original `docs/process-models/scrum-wip.md`, Gates, assigns the Product Owner the item's code/TST pull request and requires: “CI is green on it and the Definition of Done holds”. Original Team2 Definition of Done: “The job rules hold for every pull request; no condition is added.” This gate reviews only the accepted read-only Host list/facts producer. Independent Release remains; source acceptance would not complete whole UC002 or accept a SPEC, use case, architecture, process or human release report.

I personally read the fresh published original Start and AGENTS before Taken, verified unchanged original blobs/SHA256 before retaining my own earlier full SPEC/README/accepted affected-contract reads, and reread published Start/Taken in the fresh isolation. I read current primary Team2 declaration, participants and predecessor mapping, Scrum-WIP, Sprint19, order, item296 and C0835 Start including Resumed/current Gate reached, plus changed original source/test diff and both C receipts. I also read primary Sprint19 and its actual changed rows at f18662572f3be2c01c81dcb168f18d6ae672c1fd before completing this receipt. Current primary Sprint19 retains eight selected items; 290/294/295/296 are in progress, 291/292/257/293 done. 295 source is delivered with independent Release remaining; 294 component delivery also retains independent Release. Waiting review counts in WIP4. Selection, scope, gate and DoD are unchanged.

Accepted module approval names blob `25d0f9f517ea45fbce3262468b652bff6d172b55`; original UC002/032 approvals name `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4` / `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc`. Actual retained/current originals agree. Earlier personally read public connect/snapshot/refusal/cache and legacy pull-request caller originals remain the working baseline; correction changes only the two adapters and matching tests. Candidate against its exact base changes exactly index, GitHub, GitLab and repository-host tests:323 insertions/16 deletions. Original correction `5509052d9fa362021e5e1489b1e3cf85b3db201e` has byte-identical four guarded source/test files to integrated candidate1d603d4. Both receipts' original blob/hash pairs were independently recomputed:30 first-receipt and11 correction-receipt pairs agree; original resumed job blob was also read.

Candidate history retains developer-terra-c's tests/source authorship and its Sonnet predecessor; Team2's Sol participants retain Opus predecessor authorship. Neither po-sol nor its predecessor authored the guarded source/tests, host foundation or legacy pull-request implementation. This reviewer authored only this gate. Root alone publishes, comments, pushes, merges and records End.

## Current CI and actual same-case proof

Own [CI38050125780](https://github.com/akmaier/agent-m/actions/runs/38050125780) is SUCCESS for the exact candidate. Original checkout `5ddfe44216f7bf8173d0ff6b83c66cb2ea049f4d` has exact base/head parents and tree `847d7a70b0b04bba7ca2912a6d25337f83f675fb`, equal to candidate tree. Node11:55:40–11:57:09 UTC takes89s; Python11:55:40–11:56:43 takes63s, both within120s. Node reports1131 tests,1123 pass,0 fail,8 inherited TODO. Python ran396 tests successfully with5 skipped and6 expected failures. The eight inherited TODOs remain findings, not passes:

- 493 UC0064c/R2: product SPEC entry without token offers GitHub new-file page.
- 505 UC0421a/R3: expiry notice lacks renewed-token paste field.
- 537 ITM133 UC0083d/4a/A3: refused batch lacks each record's GitHub path.
- 538 ITM133 UC0083a/4a/A4: refused Save lacks GitHub editor path.
- 612 gates/G1: job record incorrectly counted open.
- 613 gates/G2: acceptance can write use-case approval for a job record.
- 814 record-evidence/G1: job record counted as an open proposal.
- 815 record-evidence/G2: handed job record gets use-case approval.

Original parent stream recognizes known-positive TST257001 at ok430 and current TST296001–004 at ok715–718. Existing public static caller reads2095 tracked paths;198 declarations,587 nodes/351 edges, duplicate IDs[] and unread[]. Its result recognizes known257001 and all296001–004 with numeric canonical declaration/module/level/given/input/expect/guards. Recognition is not proof of an omitted behavioral case.

I personally read the entire6965-byte original own proof fragment and actual child streams. The copied production `index.mjs:174` list forwarding line is uniquely removed. Fault source SHA `e4d1f6abac47cac4a13a4a02acf7d923816b6e14ac044fa703a6c281c2d0aa9f`; fault11:56:51.311–.453Z returns status1, all four cases fail with absent listPullRequests at tests921/943/964/1032. Copy cwd `/tmp/itm296-source-copy-xTkRec`; argv `/opt/hostedtoolcache/node/22.23.3/x64/bin/node --test --test-name-pattern TST-29600[1-4] /tmp/itm296-source-copy-xTkRec/tests/repository-hosts.test.mjs`. Exact saved source restoration reports bytesEqual=true, index SHA `6353390cf28b3ea2c23c015ae782f2222512778df8fd13d5dc06e1584431e7a5`. Same copied tests SHA `b30495b9776e2f3897b966b5b6aa233f69828cda7b1aeec9626f1bf4cceb4d89`, cwd/argv and named cases then pass11:56:51.453–.672Z, status0,4 pass/0 fail, empty stderr. Console TAP escaping prevents naive nested JSON decoding; no complete nested decoding or missing-proof conclusion is claimed.

Own first tests-only d210d48 CI38039072785 precedes source and remains red: original296.1–.4 fail at904/922/939/974 for absent public methods. Original5c56d94 CI38047558246 remains red: TST296001 test925→index185→snapshot141→GitHub107→refusal111 reports base NotFound because the fixture used a tree-SHA path instead of the working commit-SHA tree caller; TST296003 restored child status1. Prior42da corrects that fixture. Neither red nor the immutable prior42da HOLD is erased. This same-job correction requires no repeated first-red or additional per-assertion fault quota.

## Corrected nodes and remaining contract failure

Accepted MOD-repository-hosts117–119 requires each review's “the commit it was given on”, including GitLab approvals, and every named head check;187–188 requires each commit's changed files and CI. Public checks distinguish queued from running. Item296 Acceptance also requires reviews on their actual commits. These existing outcomes are the decision's basis.

| Prior HOLD node | Exact current data flow and observed verification | Disposition |
|---|---|---|
| GitHub commit file pages | public index178–179 → github140 commits →143–145 page/Link loop →147 flattened detail.files. Fixture874–875 supplies old-extra.md on page2; TST296001:924 observes both file names. | Corrected; current ok715. |
| GitLab pipeline pages | index179 → gitlab147 pages(MR/pipelines) →148 head-SHA filter →149 paged jobs →checks. Fixture893–894 puts current-head pipeline99 on page2; TST296002:949 observes build/lint. | Corrected; current ok716. |
| GitHub queued checks | index179 → github151 head check-runs →check60 preserves status queued as public queued. Fixture891 queued row →TST296001:927 queued assertion. | Corrected; current ok715. |
| GitLab approval provenance | index179 →gitlab139 approvals →140 versions →143 latest version.created_at <= approved_at →144 emits version.head_commit_sha as review.commit →151 returns facts →index181 exposes them. | Remaining HOLD: inferred version is advertised as actual approval commit. |

The correction removes MR date/current-head fallbacks and uses the direct approval timestamp; that is an improvement. However, a version created before an approval is not an approval-to-commit association. The current fixture889–890 has approved_at09:00, older version08:30 and head version09:30; TST296002:948 expects PR_OLDER. It passes the chosen ordering, but the input provides no independently recorded SHA that was approved. It cannot distinguish a genuinely older approval from an approval of a newer head whose diff was not yet processed. This is verification at the emitting node and fixture assertion, not a newly executed failing test.

Original [GitLab approval-state API](https://docs.gitlab.com/api/merge_request_approvals/#retrieve-approval-state-for-a-merge-request), read2026-10-10, lists approver and approval time, without an approval commit SHA. Its [automated approval section](https://docs.gitlab.com/api/merge_request_approvals/#prevent-approval-resets-in-automated-merge-requests) documents approval before commit/diff processing, and an optional SHA mechanism under a default-disabled GitLab19.5 flag. Original [diff-version API](https://docs.gitlab.com/api/merge_requests/#retrieve-merge-request-diff-versions) supplies version creation times and source-head SHAs, not the approval association. These documented facts do not guarantee the ordering assumed by line143.

Concrete static counterexample consistent with that documented behavior: older diff C exists08:30; a new head H is approved with its explicit SHA09:00 before H's diff exists; H's version is created09:30. At a later facts read both versions are present and the approval is retained under the documented flag. Actual approved SHA is H. Line143 excludes H's version09:30 and selects C08:30; line144 returns C as approved. This chronology is a source-review counterexample inferred from the documented mechanism, not a claim that this repository executed that scenario. The current test uses the same dates but assumes C was approved, so its green assertion does not establish the required actual commit. No deployment flag is assumed enabled here; the public GitLab adapter has no such restriction in its accepted contract.

Expected: returned review.commit denotes the commit actually associated with that approval. Actual: timestamp ordering yields a candidate SHA and promotes it to that fact without evidence of the association. Return this owned provenance path for bounded correction and verify at that node against an actual association, preserving accepted interfaces and named failures. This requests no architecture change, endpoint writer, new public type, process amendment or added gate condition.

Other accepted paths remain supported: both hosts page list requests, distinguish open/merged/closed and source branch, preserve supplied commit order/per-commit CI and request dates/head/base/draft/url; GitHub reviews use actual commit_id; facts.read uses immutable base/head snapshots and returns null for absent paths; extracted snapshot retains blob cache and eviction on failed reads. Existing send/refusal owns issuing-server tokens and named TokenRefused/PermissionMissing/RateLimited/NotFound/Unreachable; new operations use GET and preserve old connect/write/secret/tag/clone refusal behavior. Original public/legacy caller expectations are retained. No live collection, whole UC002 continuation, job/DoD enforcement, Release or native result is claimed.

## Original input pins

All table values below are computed from actual original Git blob bytes and original evidence bytes; historical receipt inputs stay explicitly historical. They are not abbreviated or taken on trust from handoff prose.

| Original input | Git blob | SHA-256 |
|---|---|---|
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:AGENTS.md` | `7e8f20ca35cd48a5250d143b07a469d46986f123` | `1a0429c5f2a1fc219be2595dfb79a8411ad0d301817467cdf428cd2604ba96cb` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:SPEC.md` | `1de56e76de63bfe5f3f4bb98820adad801041def` | `676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:README.md` | `37284376636ddf07efa58b63be4ff8a2ea12300a` | `f0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/process_team2.md` | `eb772d456a24c145fe3f98778509f207e34e172d` | `81618a69c5c3a441af8130f9491697b59e2196bcbef80ea008101bd92021025d` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/participants_team2.md` | `aba8b680f7df66e2807701294c960a3c29fb0148` | `1fe68a22412236b5b52ee7aa294a868cad88a519f345ee3ec3bdcddce5fcfccc` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/process-models/scrum-wip.md` | `72fdea87d0c468ffcd53ae3a6d564623c686e22d` | `a128652d9d9e4cfea1f0ca8ca3d631aeedd91ebe99f232c9a223a950fa919b5f` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/backlog/sprints/19.md` | `69a38e477604303afe1f1d52f954b113498a48eb` | `9a7e6a6b48fb77c6c2bb9d6fcd4e63305ad1af92404682285f5d22653afd935e` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/backlog/order.md` | `7f244424a4633139b1eef3a86ea019be298a6a00` | `eb948d586ef9062ff97689c60c878295e2f9ec217102edf708d65b9303f828b2` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/backlog/ITM-296-read-only-pull-request-facts.md` | `b5d7480e8903836e3fb8ba479f8c9e2ce483109e` | `ee12e0edd517b6e50be1fb8d47b48adf98cdf866630012104461fabb5d472ebf` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/jobs/JOB-20261010-1158-0400.md` | `bfe81033904a29eb25784fc1973fc83c1f9c46fd` | `78b267d1495ac6a9467547386b48dbae5556430e8209c4b247af30d5c2ab97bd` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/jobs/JOB-20261010-0835-eb7f.md` | `c300612b52fbbfa225cb47d2698de73b9e4a4b74` | `78f5068764ebd719e0e0c2442871f444b0992554fc9a70a8caa8f67dfc403400` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/architecture/MOD-repository-hosts.md` | `25d0f9f517ea45fbce3262468b652bff6d172b55` | `7034c7adaeaf874c54969885cb64a3af2e972e4de9be010298e2617a187a6e0f` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/use-cases/UC-002-choose-a-process-model.md` | `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4` | `013580bcacab443155dd2b42a2079bb6b345ecf95df51c0c3c6fbdb9a11c07e5` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/use-cases/UC-032-maintain-the-backlog.md` | `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc` | `d9144b49cf3212b7e38c8377ea7e50b8598c32138480e47789ef947ec509486b` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/gates/20261010-1135-development-pullfacts296-42da.md` | `d4a10149f0a107c3f5e11cacbf9ffbd20a2f2d75` | `c6016e83af54adc10dd7a36eda6d1fd82fad91640737d22a9df2b0285fa15a42` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/approvals/MOD-repository-hosts-25d0f9f517ea.md` | `f636a1db8f3ea6639e162f65dc02282c5440037f` | `1f93b6eea5c464cd05e18421f9be5f45490d460a4d13f72977b2f94ea33b0248` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/approvals/UC-002-48fd22da0bf3.md` | `d8505396f515f58ecd42ba69c165da93b4c78c84` | `f269d492b604df00d54f6e1d178081e0ff8c8beff46b539c6f231c65fbb2e746` |
| `f18662572f3be2c01c81dcb168f18d6ae672c1fd:docs/approvals/UC-032-caa2f8e393cd.md` | `d0638958c2473a2b79c6e80dcf8ccf4b22dfb6b4` | `ee1a0d0b9e025e5d758a8fe5a4e356135e6b19b1cba9232de1e51d5438753dc4` |
| `1d603d4cd6006ac25d90644e302c7d6a4e8750a5:src/repository-hosts/index.mjs` | `c50946b6412c56830b2d2f2c31d8f4b8d4a70405` | `6353390cf28b3ea2c23c015ae782f2222512778df8fd13d5dc06e1584431e7a5` |
| `1d603d4cd6006ac25d90644e302c7d6a4e8750a5:src/repository-hosts/github.mjs` | `639c66a915569d47c013fa7bec9ee7ecc6d50709` | `875caf01dd135e68337e213dcfde08139e100e22a3d364395aa8f68898c1ee67` |
| `1d603d4cd6006ac25d90644e302c7d6a4e8750a5:src/repository-hosts/gitlab.mjs` | `0a60ebc097b874d0ff9b19fa05e9bfba472ffcb9` | `ef8a113a2966c4cf33400ee779a66b13be38fc68c70f9c1b780c8cac68b8c0af` |
| `1d603d4cd6006ac25d90644e302c7d6a4e8750a5:src/repository-hosts/failures.mjs` | `ffda367d699af0125440e35b6ef9253a1083bc9f` | `6a2208d796d5bf9957beffb251711e4013d43718088f63bc372e3975efca5671` |
| `1d603d4cd6006ac25d90644e302c7d6a4e8750a5:src/repository-hosts/web-links.mjs` | `296d73182b289f3a1928d74cf70d8fe81ce5732e` | `4020743fb3c91b0dec5ab5df7730dd4b3abe8052c91715720510134bc07e7ed5` |
| `1d603d4cd6006ac25d90644e302c7d6a4e8750a5:tests/repository-hosts.test.mjs` | `4bcbc63389af5c2ec6af515357b03778c1caa33f` | `b30495b9776e2f3897b966b5b6aa233f69828cda7b1aeec9626f1bf4cceb4d89` |
| `1d603d4cd6006ac25d90644e302c7d6a4e8750a5:docs/assets/git-host/pull-requests.mjs` | `f2e19e2ecc04af963b95439cab814b5926696c63` | `ed6d79a40e63fd4ad265c3f26f4ff5430f49637106770d724c6f9d2ddd8bd7d1` |

Historical developer source-input receipt pins, individually recomputed from original blobs:

| Historical original input | Git blob | SHA-256 |
|---|---|---|
| `AGENTS.md` | `7e8f20ca35cd48a5250d143b07a469d46986f123` | `1a0429c5f2a1fc219be2595dfb79a8411ad0d301817467cdf428cd2604ba96cb` |
| `SPEC.md` | `1de56e76de63bfe5f3f4bb98820adad801041def` | `676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594` |
| `README.md` | `37284376636ddf07efa58b63be4ff8a2ea12300a` | `f0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b` |
| `docs/architecture/MOD-repository-hosts.md` | `25d0f9f517ea45fbce3262468b652bff6d172b55` | `7034c7adaeaf874c54969885cb64a3af2e972e4de9be010298e2617a187a6e0f` |
| `docs/use-cases/UC-002-choose-a-process-model.md` | `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4` | `013580bcacab443155dd2b42a2079bb6b345ecf95df51c0c3c6fbdb9a11c07e5` |
| `docs/use-cases/UC-032-maintain-the-backlog.md` | `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc` | `d9144b49cf3212b7e38c8377ea7e50b8598c32138480e47789ef947ec509486b` |
| `docs/participants.md` | `e9b0aaa72b7616f2424a46b8a79300d00a8c07b1` | `2341ab759dd58896aedb76557604e20619ebf5b87647f25019a50f2276501457` |
| `docs/participants_team2.md` | `aba8b680f7df66e2807701294c960a3c29fb0148` | `1fe68a22412236b5b52ee7aa294a868cad88a519f345ee3ec3bdcddce5fcfccc` |
| `docs/process-models/scrum-wip.md` | `72fdea87d0c468ffcd53ae3a6d564623c686e22d` | `a128652d9d9e4cfea1f0ca8ca3d631aeedd91ebe99f232c9a223a950fa919b5f` |
| `current-main docs/process_team2.md` | `eb772d456a24c145fe3f98778509f207e34e172d` | `81618a69c5c3a441af8130f9491697b59e2196bcbef80ea008101bd92021025d` |
| `current-main docs/backlog/sprints/19.md` | `7414c075c02bf3c7a135b8b945a09288848fcc03` | `9dba70497bf1325f312eca083ae33e5c9552edcd8a7785a96a6d091b4f36527b` |
| `current-main docs/backlog/order.md` | `7f244424a4633139b1eef3a86ea019be298a6a00` | `eb948d586ef9062ff97689c60c878295e2f9ec217102edf708d65b9303f828b2` |
| `src/repository-hosts/index.mjs (pre-source)` | `9c7cba731c2b4f5edc4f8804eca625e161239a87` | `49fb183e7e73736810b667329c2ed918dde0e8feebea4109e0d2de43067edc9f` |
| `src/repository-hosts/github.mjs (pre-source)` | `991c7f2c62e16586ca7881bd8e75d00e229b021d` | `a6afd6bae8d6a2720f3a7fae978a5a11aa283b5093c3a21daaed7ec8792a27a6` |
| `src/repository-hosts/gitlab.mjs (pre-source)` | `982d4baabada24d05d746e22f93c6cac789ad921` | `5aa94829cb9c1bc3bbd6d78a2ee0f5bd1452bc90af34b132fbf336dc4c5ba88f` |
| `src/repository-hosts/failures.mjs` | `ffda367d699af0125440e35b6ef9253a1083bc9f` | `6a2208d796d5bf9957beffb251711e4013d43718088f63bc372e3975efca5671` |
| `src/repository-hosts/web-links.mjs` | `296d73182b289f3a1928d74cf70d8fe81ce5732e` | `4020743fb3c91b0dec5ab5df7730dd4b3abe8052c91715720510134bc07e7ed5` |
| `docs/assets/git-host.mjs` | `5614b0af8142755ec82b1ee8c6901956a50c63e5` | `74f93b59ef0255e2f2ede1164c9ec31cdaf21e2ac6e7123e9c437736e24e532f` |
| `docs/assets/git-host/pull-requests.mjs` | `f2e19e2ecc04af963b95439cab814b5926696c63` | `ed6d79a40e63fd4ad265c3f26f4ff5430f49637106770d724c6f9d2ddd8bd7d1` |
| `tests/repository-hosts.test.mjs (corrected tests)` | `b0460429562249e1d179428ccc3af3543e600632` | `990e9e21f31f88951239164e6bc260b1d7e8ca3c55d8150ca60dbe55c00e73ca` |
| `tests/repository-hosts-tags.test.mjs` | `9008540e0875ced0c1ddc2089bfaab4531b704d9` | `79cc7946c619afaea1ff762df76589a0419b251368173525dc0dcc8ba2810fe0` |
| `tests/review-core.d/git-host-pulls.test.mjs` | `4be68ccc7e4a44313d606789288f90b54ea0003c` | `9e5fa2563cb6849e3d4fbf0e6a5480cb6951e9b07fc66823e9d66bdb7ce16f55` |
| `tests/review-core.d/git-host.test.mjs` | `c2928ebb59d6fff9b97aa8583d6119417350bf94` | `ea1b67ff309c2974d1b4061d5086d11af1548c158ba51234721d9f0ecffd0da7` |
| `tests/release-sprint-02-a-git-host.test.mjs` | `95396e17fe3fac98838535769493695d5b7c527c` | `27610a71a4f4ae1a84f65d49f285965473ef2da3c85733742f21b95f4a802a7d` |
| `tests/release-sprint-02-c-git-host.test.mjs` | `612829fd4aad894f1473cb0d7c158fb6f7db0fb9` | `291e19fbd1a175fc3770f4df63e20c4d6691f3cf8b29d5169ad9bdb69353f591` |
| `tests/release-sprint-01-git-host.test.mjs` | `645a336d2fdc765df07b6dcf8a04256275ea1573` | `0755eb58eab6dba680f791f74a9f67ca50f62c860a6f9c0a78c928c0b77c52ed` |
| `src/test-document/declarations.mjs` | `8bade3141493d4b1098ea6b6acef2f71afcc4d63` | `33dce034da3fa499ab392bc973e1820fed0a716dfeea833b7a499558ddc4e355` |
| `tests/release-itm-292-product-process.test.mjs` | `e228e53cce0cda74ee5784279e687a83cc0824da` | `f87bd2d9bd27b047cf4b3b25086620af8275fdabc46097f5d7de74debc9128a3` |
| `current-main docs/jobs/JOB-20261010-0835-eb7f.md` | `70ad3d2edce63bd03f558af5fe254d65be057126` | `5d502e79400edac6e5baef037bc56bc5c4b730226e3789cdb24f744bfa737578` |
| `current-main docs/backlog/ITM-296-read-only-pull-request-facts.md` | `b5d7480e8903836e3fb8ba479f8c9e2ce483109e` | `ee12e0edd517b6e50be1fb8d47b48adf98cdf866630012104461fabb5d472ebf` |

## Original evidence pins

| Original evidence | Bytes | SHA-256 |
|---|---:|---|
| `/private/tmp/root-p19-ci-38050125780-api.zip` | 358095 | `e5ed419e5d71ca6af633566cdce20a12e4ead4ef39c9d1e931a3b35dad7daf8c` |
| `/private/tmp/root-p19-ci-38050125780-node-api.log` | 851763 | `2110d2df1f73aa6484968e7894197875ce9c7fdc1718062a6d878756365be3e1` |
| `/private/tmp/root-p19-ci-38050125780-python-api.log` | 75447 | `696b3c0ccab16dad2fde86eb92865cb9769ac220b3479e1b2249c761aa76bab3` |
| `/private/tmp/root-p19-ci-38050125780.json` | 2938 | `e854b5573957fc31d8d5a08ce9e66612332004996f5b2af03e88f235a03841c5` |
| `/private/tmp/root-p19-ci-38050125780-checkout-api.log` | 6800 | `65feab6fca471381ad967cc389b55be4d04680df650e21f26f72a5671f59045f` |
| `/private/tmp/root-p19-ci-38050125780-commit.json` | 2582 | `ec48af89d2d47841a9546dcc039d2e13c81fe4113075d2efde793d682675f5f1` |
| `/private/tmp/root-p19-ci-38050125780-296-own-proof-raw.txt` | 6965 | `963438080f5733bffe6f5ff270b184ee24186a7630159bba6ac1d8551df4fe41` |
| `/private/tmp/p19-296-1d60-trace.mjs` | 2313 | `897dc2edf15ced5d366df6348088247d7742ee24b8e6550b0d19c44ff63f9279` |
| `/private/tmp/p19-296-1d60-trace-paths.txt` | 113305 | `e97d667f1127e840e057d4ca90a68fdb724c662f2bb70f9eb27e27a94d83b675` |
| `/private/tmp/p19-296-1d60-trace.raw` | 2269 | `f37df5e42100c2d27a007084428c70109e6539f9bf18a675b4d36a6355b21bb1` |
| `/private/tmp/p19-296-1d60-trace.json` | 276347 | `eb9ef08426e9002d2e2eb99a056639534fe10b2ae324add06a0471524628f210` |
| `/private/tmp/JOB-20261010-0835-eb7f-terra-c-input-receipt.md` | 4858 | `2fec2b294001d1a6dbd2ea17688193be95e7a829bd16b589381f089cc0be7c28` |
| `/private/tmp/JOB-20261010-0835-eb7f-terra-c-correction19-read-receipt.md` | 5784 | `cbf2e7993078a66c3d773708169c7a6d584e1a322829398b7aca874b15100388` |
| `/private/tmp/root-p19-ci-38039072785-api.zip` | 267823 | `aeda719a7e413ef113a30c62b3b7424a50b2e6d7d5bfffe99d534ad94a4c9d07` |
| `/private/tmp/root-p19-ci-38039072785-node-api.log` | 604840 | `4da106415900c2fe32ea5ace907e3e3a26caef149d44aec37f164f6962fcb64f` |
| `/private/tmp/root-p19-ci-38039072785-failed-nodes-only.txt` | 7000 | `ae122642229df303a6608c6b5ff407f22104741b172db3af326e66327574cd56` |
| `/private/tmp/root-p19-ci-38047558246-api.zip` | 353898 | `3c34cac67bacfbedcba9a878e57e35b9e93bb8819ed4ce97ea06c231f91179d3` |
| `/private/tmp/root-p19-ci-38047558246-node-api.log` | 838211 | `ae3d7ba1428fbab0a9b3ae1f7f53679b59f252ba4ff495b8c075cf7b61970ebb` |
| `/private/tmp/root-p19-ci-38047558246-failed-nodes-only.txt` | 2078 | `63818d8280c94ab40d0f8dce8b9f382810600077f10c95db3b97b4b65bba339b` |
| `/private/tmp/root-p19-ci-38047850513-api.zip` | 353804 | `42da3a064ae5e55cdd50018c39693ba974bf9f860c6a66b97289e19cd227fd32` |
| `/private/tmp/root-p19-ci-38047850513-node-api.log` | 844587 | `b99d39d5ab0feaf025570430a4b8b45e4ae6d83d42aa0fed425d2e5c070fb220` |
| `/private/tmp/root-p19-ci-38047850513-python-api.log` | 75447 | `bcd4f31344ec0cfed272763abbedbb9f3efbbb65daf18b2c2ca82be85771e2c4` |
| `/private/tmp/root-p19-ci-38047850513-296-proof-raw.txt` | 6935 | `495e5c3ef9e0cd97a13ae0ee095e6af84fddd3e57e8de717ad4b2f795e87ca10` |

## Disposition

Return the still-owned GitLab approval-commit provenance path to developer-terra-c for correction against the unchanged accepted facts. Preserve the three corrected nodes, original red/fault/restoration evidence and current guards. Root publishes this exact HOLD and handles later Starts/merges/End. No source/test/runtime or binding-document edit was made. Independent Release remains required after an eventual exact-source PASS.

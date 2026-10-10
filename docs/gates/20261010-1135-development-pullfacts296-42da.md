# Development gate — ITM-296 / PR299

**MEASUREMENT — 2026-10-10 11:35:00 UTC.** Method: independent original-document and exact-blob static data-flow review; original exact-head GitHub Ubuntu CI and fault/restoration child streams; existing public declaration/trace caller evidence. No local product runtime or new fault experiment.

Decision: **HOLD** for Development → Release testing on PR299.

- Head: `42da5bd78fa32167ba96303bdac3c708464f06ef`.
- Base: `7b43f33a3f00780787fb6eb5c39c17401655971f`.
- PR: https://github.com/akmaier/agent-m/pull/299.
- Reviewer: `po-sol` / `gpt-6.1-sol`, under `JOB-20261010-1128-3087`.
- Dedicated actual Taken: `2026-10-10 11:29:55 UTC`, before root supplied fresh isolation from `8bb118b`.
- Usage and cost: `null`.

## Authority, scope and independence

Original `docs/process-models/scrum-wip.md`, Gates, assigns the Product Owner the item's code/TST pull request and states: “CI is green on it and the Definition of Done holds”. Original `docs/process_team2.md`, Definition of Done: “The job rules hold for every pull request; no condition is added.” This decides the accepted read-only list/facts producer only. Independent Release testing remains required. It does not accept whole UC002 delivery or any SPEC, use-case, architecture, process or human release report.

I personally read the published Start/Taken and AGENTS originals. I retained my own earlier full original SPEC/README reads only after personally verifying exact unchanged blobs; the c2429be→2f88725 and c2429be→8bb118b comparisons were empty for them. I read the current primary Team2 declaration, participant/predecessor assignment, model, Sprint19 selection/order, item296, C0835 Start, accepted UC002/032 and full MOD-repository-hosts, public connect/adapter/refusal/cache paths, legacy pull-request reader and the full scoped candidate diff/tests. I also personally read current primary Sprint19 after root published015a81b; its eight selected items and four in-progress290/294/295/296 remain, with294 component delivered and independent Release pending. Scope, gate and DoD are unchanged; review counts in WIP4.

Module approval `docs/approvals/MOD-repository-hosts-25d0f9f517ea.md` names actual blob `25d0f9f517ea45fbce3262468b652bff6d172b55`. UC002/032 approval records name `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4` / `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc`; actual current blobs agree. The source receipt's thirty rows were individually checked by reading each original Git blob and computing SHA-256; all agree. Receipt data are not substituted for reading originals.

Candidate history d210d48→2048cd5→5f9bc60→e323421→bfd1d6d→69f516f→f3d2f5f→5c56d94→42da5bd preserves developer-terra-c's provenance. Current Team2 predecessor assignment maps Terra to Sonnet and Sol to Opus. Neither po-sol nor its predecessor authored guarded source/tests, old host/legacy reader, or candidate correction. I authored only this review. The candidate diff has exactly four source/test files,313 insertions/16 deletions. No module contract changes are proposed or accepted here.

## Current original CI and proof

Run [38047850513](https://github.com/akmaier/agent-m/actions/runs/38047850513) is SUCCESS for the exact head. Original checkout/API commit `831445e746d048c43c69c910383502aa9b156490` has parents `7b43f33a3f00780787fb6eb5c39c17401655971f`, `42da5bd78fa32167ba96303bdac3c708464f06ef`, tree `432258d082a1296eefaaa4ef8e29b0e776f41f6d`. Node job elapsed66s, Python40s, each within120s. Node runner:1128 tests,1120 pass,0 fail,0 skipped,8 inherited TODO; Python:396 tests successful,5 skipped,6 expected failures. The eight TODOs are not passes:

- 493 UC0064c, R2: product SPEC entry without token offers GitHub new-file page.
- 505 UC0421a, R3: expiry notice lacks renewed-token paste field.
- 537 ITM133 UC0083d/4a, A3: refused batch lacks each record's GitHub path.
- 538 ITM133 UC0083a/4a, A4: refused Save lacks GitHub editor path.
- 612 gates G1: job record incorrectly counted open.
- 613 gates G2: acceptance can write use-case approval for job record.
- 814 record-evidence G1: job record counted as an open proposal.
- 815 record-evidence G2: handed job record gets use-case approval.

Actual original parent nodes: known-positive TST257001 `ok430`; TST296001–004 `ok715` through `ok718`. Static existing public caller metadata recognizes all five named declarations across2093 paths,195 declarations,584 nodes/345 edges, no duplicates and no unread paths. This proves recognition, not omitted behavior.

Raw current source-copy proof is retained whole,6935bytes. I read the actual child streams, rather than only namedNode labels. Removing the unique `index.mjs:174` public list forwarding line causes all four selected child cases to fail at `listPullRequests is not a function`: TST296001:919,002:941,003:962,004:1030. Fault starts11:17:50.104Z, ends11:17:50.214Z; status1,4 failures,0 passes. Fault source SHA `e4d1f6abac47cac4a13a4a02acf7d923816b6e14ac044fa703a6c281c2d0aa9f`.

Restoration reports bytesEqual=true and restores exact candidate index SHA `6353390cf28b3ea2c23c015ae782f2222512778df8fd13d5dc06e1584431e7a5`. Same copied tests SHA `9ac7e37f7c9bcd950d7efbf1ae4143e065e52642ce7d51f284101154bff9ab19`, same argv `node --test --test-name-pattern TST-29600[1-4] …/tests/repository-hosts.test.mjs`, same `/tmp/itm296-source-copy-IIiHn1` cwd; restored starts11:17:50.215Z, ends11:17:50.350Z; status0, all four named cases pass, stderr empty. Console TAP escaping prevents naive nested JSON decoding; no full nested decoding or missing-proof finding is claimed.

Own first tests-only d210d48 run38039072785 remains red with original labels296.1/.2/.3/.4, at904/922/939/974 respectively for absent public list methods, before source. Earlier5c56d94 run38047558246 remains red: TST296001 base snapshot NotFound at test925→index185→snapshot141→github107→refusal111, and TST296003 restoration status1. Final42da fixes the fixture's `/git/trees/<commit SHA>` response used by the unchanged working snapshot caller. Neither earlier failure is erased by current green.

## Accepted data-flow findings

Accepted MOD-repository-hosts:117–119 requires reviews with “the commit it was given on” and “the result of each named check on the head commit”;187–188 requires “the files each changed” and the CI result of each commit. The facts state type explicitly distinguishes queued from running. These are existing accepted outcomes, not additional gate conditions. All paths below refer to exact candidate blobs. They are static verification at the failure nodes, not new executed failing fixtures.

1. **Per-commit GitHub file pagination is lost.** Public `index.mjs:178–179` → `github.mjs:140` paged commits →143 `read(/commits/<sha>)` →read41–44 strips response headers →144 maps only `detail.files` into the commit's files. A commit response with files on a next Link page yields only the first page's names; required names from later pages never reach facts. Known-positive counterpart is TST296001:922 with one file per detail at fixture874/876; new list pagination TST296004 proves the existing page/header mechanism works but does not visit a commit-detail second page. [GitHub's original API documentation](https://docs.github.com/en/rest/commits/commits#get-a-commit), read2026-10-10, confirms JSON commit file pagination beyond300 files. Preserve all server-provided file pages at this node.

2. **GitLab head-check collection loses pipeline pages.** Public `index.mjs:179` →`gitlab.mjs:141` single `read(MR/pipelines)` →read40–42 drops X-Next-Page →142 head filter →143 visits jobs only for pipelines in that first array. A later pipeline page containing a head-SHA pipeline's named job cannot contribute that check. Expected: every named head check reaches `checks`, including later pipeline pages. Known-positive TST296002:947 supplies exactly one pipeline99 at fixture891, with two jobs892. GitLab's existing page/pages44–57 already retains X-Next-Page for commit diffs/statuses/jobs and list fixture TST296004 recognizes a second page. [GitLab's original API documentation](https://docs.gitlab.com/api/merge_requests/#list-merge-request-pipelines), read2026-10-10, confirms pagination on this pipeline endpoint. Page pipeline collection before filtering/reading its jobs.

3. **Queued GitHub check runs become running.** Public179 →github148 paged head check-runs →`check`60: any status other than completed becomes running. For an actual `status:"queued"` row, actual public state is running; accepted queued is expected. Known-positive completed/success fixture889 is recognized by TST296001:925. The existing commit-status mapping148 already preserves pending as queued. Preserve the check-run's queued state at this mapping node rather than changing accepted enum or expected semantics.

4. **GitLab approval review provenance is manufactured.** Public179 →gitlab139 approvals →140 emits `commit:head` for every approver and uses MR updated/created time when approval time is absent. No approval record's own commit is read, so the result cannot distinguish an approval on an earlier commit from one on the current head; MR creation/update is also not an approval date. Expected: commit/date actually associated with that approval, as accepted117–118 requires. Known-positive fixture888 has reviewer and approved_at but no approval commit, while TST296002:946 expects PR_HEAD anyway; this assertion passes the manufactured provenance. Preserve original recorded provenance; do not claim the current head or MR timestamp as an approval fact without evidence. This is a source/input provenance gap, not a demand for a new architecture.

Existing positives remain: state/source-branch filtering and merged/closed distinction across both hosts' list pages; supplied server order and per-commit CI in296001/002; GH actual commit_id reviews in fixture887 and147; immutable base/head snapshot reads179–185 with missing path returning null147 and blob cache148, plus inherited immutable/cache assertions; refusal through existing send/refusal, token restricted to issuing repository and GET-only source operations; inherited UC001 read/write/secret/tag boundaries. ReadSnapshot cache extraction preserves existing callers. Current green fixtures and list forwarding counter-proof do not verify the four omitted facts above. I make no unsupplied live collection, whole UC002, job/DoD enforcement, release or native claim.

## Original input pins

Values below were computed from original blob bytes, including the actual approved contract blob, not manually abbreviated.

| Original input | Git blob | SHA-256 |
|---|---|---|
| `8bb118b:AGENTS.md` | `7e8f20ca35cd48a5250d143b07a469d46986f123` | `1a0429c5f2a1fc219be2595dfb79a8411ad0d301817467cdf428cd2604ba96cb` |
| `8bb118b:SPEC.md` | `1de56e76de63bfe5f3f4bb98820adad801041def` | `676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594` |
| `8bb118b:README.md` | `37284376636ddf07efa58b63be4ff8a2ea12300a` | `f0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b` |
| `8bb118b:docs/process_team2.md` | `eb772d456a24c145fe3f98778509f207e34e172d` | `81618a69c5c3a441af8130f9491697b59e2196bcbef80ea008101bd92021025d` |
| `8bb118b:docs/participants_team2.md` | `aba8b680f7df66e2807701294c960a3c29fb0148` | `1fe68a22412236b5b52ee7aa294a868cad88a519f345ee3ec3bdcddce5fcfccc` |
| `8bb118b:docs/process-models/scrum-wip.md` | `72fdea87d0c468ffcd53ae3a6d564623c686e22d` | `a128652d9d9e4cfea1f0ca8ca3d631aeedd91ebe99f232c9a223a950fa919b5f` |
| `8bb118b:docs/backlog/sprints/19.md` | `7414c075c02bf3c7a135b8b945a09288848fcc03` | `9dba70497bf1325f312eca083ae33e5c9552edcd8a7785a96a6d091b4f36527b` |
| `8bb118b:docs/backlog/order.md` | `7f244424a4633139b1eef3a86ea019be298a6a00` | `eb948d586ef9062ff97689c60c878295e2f9ec217102edf708d65b9303f828b2` |
| `8bb118b:docs/backlog/ITM-296-read-only-pull-request-facts.md` | `b5d7480e8903836e3fb8ba479f8c9e2ce483109e` | `ee12e0edd517b6e50be1fb8d47b48adf98cdf866630012104461fabb5d472ebf` |
| `8bb118b:docs/jobs/JOB-20261010-1128-3087.md` | `19d15703dd9a7a9913570b09175b8a0a2794ceb2` | `1585ffb7e769da74c29f605c98fd3024ceeca24154dc645d3dd26ebbc09630ac` |
| `8bb118b:docs/jobs/JOB-20261010-0835-eb7f.md` | `70ad3d2edce63bd03f558af5fe254d65be057126` | `5d502e79400edac6e5baef037bc56bc5c4b730226e3789cdb24f744bfa737578` |
| `8bb118b:docs/architecture/MOD-repository-hosts.md` | `25d0f9f517ea45fbce3262468b652bff6d172b55` | `7034c7adaeaf874c54969885cb64a3af2e972e4de9be010298e2617a187a6e0f` |
| `8bb118b:docs/approvals/MOD-repository-hosts-25d0f9f517ea.md` | `f636a1db8f3ea6639e162f65dc02282c5440037f` | `1f93b6eea5c464cd05e18421f9be5f45490d460a4d13f72977b2f94ea33b0248` |
| `8bb118b:docs/use-cases/UC-002-choose-a-process-model.md` | `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4` | `013580bcacab443155dd2b42a2079bb6b345ecf95df51c0c3c6fbdb9a11c07e5` |
| `8bb118b:docs/use-cases/UC-032-maintain-the-backlog.md` | `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc` | `d9144b49cf3212b7e38c8377ea7e50b8598c32138480e47789ef947ec509486b` |
| `42da5bd78fa32167ba96303bdac3c708464f06ef:src/repository-hosts/index.mjs` | `c50946b6412c56830b2d2f2c31d8f4b8d4a70405` | `6353390cf28b3ea2c23c015ae782f2222512778df8fd13d5dc06e1584431e7a5` |
| `42da5bd78fa32167ba96303bdac3c708464f06ef:src/repository-hosts/github.mjs` | `37297a70fc7caaba012c0d9a3c7b983b353b570c` | `e00e8b4119b067a281156be632c44da10146acabb81ab6f7c8526c77d78cbccb` |
| `42da5bd78fa32167ba96303bdac3c708464f06ef:src/repository-hosts/gitlab.mjs` | `bb893cac81fb56b411e5c412401008299c399850` | `6c01c6dd18d777d0f5716520109a45026818eb99669c636b19fc5499c8251e34` |
| `42da5bd78fa32167ba96303bdac3c708464f06ef:tests/repository-hosts.test.mjs` | `e83d9343e0c4b8f124954a18f12d943fef216603` | `9ac7e37f7c9bcd950d7efbf1ae4143e065e52642ce7d51f284101154bff9ab19` |

| `015a81b:docs/backlog/sprints/19.md` (current primary original) | `481551d59c27930c232411dc2352f29ea5ea3b29` | `f938535c77934961ca02248309fd7a9d7e7e16a538386567dc7a67c6e6dec67f` |

## Original evidence pins

| Original evidence | Bytes | SHA-256 |
|---|---:|---|
| `/private/tmp/root-p19-ci-38047850513-api.zip` | 353804 | `42da3a064ae5e55cdd50018c39693ba974bf9f860c6a66b97289e19cd227fd32` |
| `/private/tmp/root-p19-ci-38047850513-node-api.log` | 844587 | `b99d39d5ab0feaf025570430a4b8b45e4ae6d83d42aa0fed425d2e5c070fb220` |
| `/private/tmp/root-p19-ci-38047850513-python-api.log` | 75447 | `bcd4f31344ec0cfed272763abbedbb9f3efbbb65daf18b2c2ca82be85771e2c4` |
| `/private/tmp/root-p19-ci-38047850513.json` | 2913 | `6be361e0fe8cd4f14dbfd500107f952c74815fdcf9e8813d87217e8f5dc34a4e` |
| `/private/tmp/root-p19-ci-38047850513-checkout-api.log` | 6800 | `7403b536e974d306882606952f3b883a5eb686124114be66f89ac25b6de0def2` |
| `/private/tmp/root-p19-ci-38047850513-commit.json` | 2582 | `91fca7008942323785767bc5a1e33f22541fabe8624b5a03d026acb6a3a7713b` |
| `/private/tmp/root-p19-ci-38047850513-296-proof-raw.txt` | 6935 | `495e5c3ef9e0cd97a13ae0ee095e6af84fddd3e57e8de717ad4b2f795e87ca10` |
| `/private/tmp/root-p19-ci-38039072785-api.zip` | 267823 | `aeda719a7e413ef113a30c62b3b7424a50b2e6d7d5bfffe99d534ad94a4c9d07` |
| `/private/tmp/root-p19-ci-38039072785-node-api.log` | 604840 | `4da106415900c2fe32ea5ace907e3e3a26caef149d44aec37f164f6962fcb64f` |
| `/private/tmp/root-p19-ci-38039072785-failed-nodes-only.txt` | 7000 | `ae122642229df303a6608c6b5ff407f22104741b172db3af326e66327574cd56` |
| `/private/tmp/root-p19-ci-38047558246-api.zip` | 353898 | `3c34cac67bacfbedcba9a878e57e35b9e93bb8819ed4ce97ea06c231f91179d3` |
| `/private/tmp/root-p19-ci-38047558246-node-api.log` | 838211 | `ae3d7ba1428fbab0a9b3ae1f7f53679b59f252ba4ff495b8c075cf7b61970ebb` |
| `/private/tmp/root-p19-ci-38047558246-failed-nodes-only.txt` | 2078 | `63818d8280c94ab40d0f8dce8b9f382810600077f10c95db3b97b4b65bba339b` |
| `/private/tmp/p19-296-42da-trace.mjs` | 2313 | `efbc61cf74e50ee770ddb311ec059f00b07239c05b7fbc871bdd6e8cffa805ab` |
| `/private/tmp/p19-296-42da-trace-paths.txt` | 113246 | `897894bee88568176aa2f34f7b2519c377921bda1fa207032d0a0a401ec49f11` |
| `/private/tmp/p19-296-42da-trace.raw` | 2229 | `3344d82520240fe76c215d70239dbb60a3d60de306a0d84ac398fb7e37b8d6a7` |
| `/private/tmp/p19-296-42da-trace.json` | 276097 | `addade054f5f3cf0966b909b22c69e8ab1c5b4cf2884738c3afc540c2e3a6fca` |
| `/private/tmp/JOB-20261010-0835-eb7f-terra-c-input-receipt.md` | 4858 | `2fec2b294001d1a6dbd2ea17688193be95e7a829bd16b589381f089cc0be7c28` |

## Disposition

Return the bounded implementation to developer-terra-c for the accepted fact paths above, retaining first-red and fault/restored originals and all current guards. Root alone publishes this exact HOLD and handles subsequent Starts, pushes, comments, merges and End. A fresh corrected immutable head needs its own current evidence and independent gate. No source/test/runtime or binding-document edit was made by this reviewer.

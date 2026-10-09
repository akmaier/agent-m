# ITM-287/288/289 independent release-test gate

**MEASUREMENT**

Decision: PASS only the test-only PR270 exact head `156d6838784841b2586c0eaf96d2bc73bd1fa23b` into sprint/18.
Decider: po-sol, gpt-6.1-sol, independent of developer-terra-e/gpt-5.6-terra and the guarded source authors.
Job: JOB-20261009-2010-p18v, original published Start blob `3c005315a185ebbadf51d8685cc8edd55a9aa27c`
at main `1e26e0dcf8c7b0ec073a59654b6c429ad364faf6`. Actual Taken: 2026-10-09 20:13:57 UTC, clock.
Decision at: 2026-10-09 20:32:02 UTC, clock.
Isolation: `.agent/worktrees/agent-po-sol-verify-18`, branch `codex/p18-corrected-source-release-gates`, from that main.
Usage/cost: null/null. Root alone publishes, rechecks, merges the approved exact head and Ends the jobs.

## Scope and original readings

This decision covers the three new release cases for delivered287/288/289 public modules. The source correction265,
public caller271, combined selected tree, Sprint review and Retrospective remain separate. The immutable corrected286
source HOLD remains in force; the independently established persistent-key defect is not waived by this release PASS.

Personally read the new original Start before the new worktree. Retained the16 previously personally read full originals
only after verifying their exact unchanged blobs. Read the additional selected items, original source/test Starts/Taken,
independent source gates and accepted affected use cases/architecture in full. The pinned process-model commit remains
`ef33e2f501289930960f13b55936e9b557003993`; SPEC§5/11–13, the Team2 declaration/default DoD and that model govern this
assigned independent gate. Textbook chapter13 was consulted first for the process question; no process rule was invented.
Concrete original pins at the published job base are:

| Original | Blob | Reading |
|---|---|---|
| AGENTS.md | `7e8f20ca35cd48a5250d143b07a469d46986f123` | retained, exact unchanged |
| SPEC.md | `1de56e76de63bfe5f3f4bb98820adad801041def` | retained, exact unchanged |
| README.md | `37284376636ddf07efa58b63be4ff8a2ea12300a` | retained, exact unchanged |
| docs/process_team2.md | `eb772d456a24c145fe3f98778509f207e34e172d` | retained, exact unchanged |
| docs/participants_team2.md | `aba8b680f7df66e2807701294c960a3c29fb0148` | retained, exact unchanged |
| docs/process-models/scrum-wip.md | `72fdea87d0c468ffcd53ae3a6d564623c686e22d` | retained, exact unchanged |
| docs/backlog/sprints/18.md | `4baa3e2dc03985871e9d74976d91b48c1de41df7` | retained, exact unchanged |
| docs/backlog/ITM-286-the-bridges-automatic-tunnel-runtime.md | `a72531b3b3567c085a00990294c048f4452b400a` | retained, exact unchanged |
| docs/use-cases/UC-003-configure-a-model-endpoint.md | `82081a084479172f2f8f704211351b052edea8e6` | retained, exact unchanged |
| docs/use-cases/UC-011-hand-a-job-to-a-local-cli-session.md | `982753a5278bdcb9e0f895d30d1cc274fe2ba80f` | retained, exact unchanged |
| docs/use-cases/UC-044-install-and-pair-the-bridge.md | `6c80417a691b105488b2426c25245ae7f39a33a7` | retained, exact unchanged |
| docs/architecture/ARC-040-the-bridge.md | `603620210312a514d004a58887157c04dbafe8c6` | retained, exact unchanged |
| docs/architecture/ARC-052-ssh-in-the-bridge.md | `3fee08bacbb70bd95ecdfac91417f06f9a07d95c` | retained, exact unchanged |
| docs/architecture/MOD-tunnels.md | `0d7ed13e3e793bf081636b53c1ae64c7f15485f9` | retained, exact unchanged |
| docs/architecture/MOD-bridge-http.md | `2792f1d3a1a66eec9750fac85949ee78874e2956` | retained, exact unchanged |
| docs/architecture/MOD-bridge-client.md | `c1605d3972e8a38f8a282acfbbb64223e9b7b617` | retained, exact unchanged |
| docs/jobs/JOB-20261009-2010-p18v.md | `3c005315a185ebbadf51d8685cc8edd55a9aa27c` | read original now |
| docs/jobs/JOB-20261009-1837-a286.md | `4d4bb87583947dc47b674cc1f122153d2136d634` | read original now |
| docs/gates/20261009-2000-development-release-testing-286.md | `cbee8c6454e5c38508431df38122025c0571dc8c` | read original now |
| docs/architecture/ARC-038-the-site.md | `1a583b96fa01cb37f2d277bd70036ce60dfdef83` | read original now |
| docs/architecture/MOD-browser-store.md | `058fd3b05cc14cb361575f16a2059f174417e8ac` | read original now |
| docs/architecture/MOD-release-evidence.md | `dbd34f3c7bf089692abf8e0b0cb4f4dba18a2047` | read original now |
| docs/architecture/MOD-settings-pages.md | `6357592c6ff7a2dd528ae959c918ad4ec1a903a4` | read original now |
| docs/architecture/MOD-test-pages.md | `25cf2dca00274bbbc2867b993891f10b6015b6c2` | read original now |
| docs/backlog/ITM-287-canonical-remote-session-setup.md | `e9af7ee373afdf6e38c32c3f11baed4f9c2c5291` | read original now |
| docs/backlog/ITM-288-canonical-settings-export-import-controls.md | `1ec50f70d61d1f5dd8ede92bbb147e9ccef24642` | read original now |
| docs/backlog/ITM-289-open-the-waiting-release-report.md | `d4cffaaa23ea7053f55638baf0786f135fe1a211` | read original now |
| docs/gates/20261009-1931-development-release-testing-287.md | `4057d54e8bdb3ae4b8b0008a89c34dde73679471` | read original now |
| docs/gates/20261009-1933-development-release-testing-288.md | `4d0ce041c1dc6273fb77e4d8fb131f85d16e5e54` | read original now |
| docs/gates/20261009-1933-development-release-testing-289.md | `9464df0f3a6dcae9c919ca5eb7af6d4267eaa097` | read original now |
| docs/jobs/JOB-20261009-1837-b287.md | `1768886ae34bba6b077a0d119aedde79ebbc5dd6` | read original now |
| docs/jobs/JOB-20261009-1837-c289.md | `71c82ca72eb718f1696825120c2ee0f34ee3c890` | read original now |
| docs/jobs/JOB-20261009-1837-d288.md | `fd71e5f9c3467174f3f4d8a6d4145051a1d83006` | read original now |
| docs/jobs/JOB-20261009-1934-e18.md | `a2dffb7722ec2a96bae11ada9d76c1c9f00dbc35` | read original now |
| docs/use-cases/UC-013-release-a-version.md | `0a2ec7e3cc6770f66381e21d128754f64aabb2ea` | read original now |
| docs/use-cases/UC-042-manage-settings.md | `a8c595676ef0afd54290024c928b7268c49dfbe9` | read original now |
| docs/use-cases/UC-047-be-told-what-waits-for-your-acceptance.md | `9c3cf6e0500518f2e8af47f1efc160d351378f21` | read original now |

The actual final source, public routes, canonical storage/catalogue/export codec, releaseReport/acceptAndRelease,
notification check/worker and existing callers were read before probes. Whole same-scope original cases were read:
settings-pages-bridge-remote-sessions, settings-pages-export-import, test-pages-pending-release-report,
browser-store/settings-export/settings-list/jump-host, settings-pages-bridge, module Bridge endpoint/handoff,
release-itm-283-browser-store, test-pages-release, release-evidence, notifications, release-sprint-07-uc-047-notifications,
and the legacy Settings Python cases. These old cases were not run locally. The current legacy settings-view caller was
read in full: its separate old export/import path is not the canonical public module path tested here.
Read pins are retained in `/private/tmp/p18v-release-read-pins.json`; all exact final source/test blobs and hashes are
in `/private/tmp/p18v-release-evidence-manifest.json`.

## Independent authorship and actual delivered sources

PR270 differs from actual base `9811ca04c06d67f99ce52715d476fffe6e7874c8` only by three NEW files:
`tests/release-itm-287-remote-sessions.test.mjs`, `tests/release-itm-288-settings-export.test.mjs`,
and `tests/release-itm-289-pending-report.test.mjs`. No existing test, fixture, expected result, helper, source or
accepted document is changed. E began287 after source merge `87b0bf367ae363bea427291f1994d6e348cbbbd6`;
root supplied288 merge `cabd6ab7bc08434d207035430dc72abda01a4045` at19:37:48 UTC and289 merge
`9811ca04c06d67f99ce52715d476fffe6e7874c8` at19:38:04 UTC, before that release writing.
E incorporated them by ordinary merge `a47af5617b017546245b1f81f59f1c52fb05143d`, with no rebase.
The four authored test commits260b722/c09d8b2/b4a6b82/156d683 carry version/participant/model trailers;
the fifth relevant history entry is the ordinary merge, not a new guarded behavior.

Independently inspected full actual metadata/parents/path history of175 commits touching the guarded modules and
callers, including tunnels/bridge-client/bridge-http/browser-store/settings-pages/test-pages/release-evidence,
notifications and their dashboard callers. The matcher covers current Participant trailers and predecessor inline
`Item: … developer-sonnet-e` metadata. Known positives are the final Terra-E test commit and actual Sonnet-E
release-only commit `b4f110061aa5f97a3f65d1cacd0ca70beb62d25d`; neither is inferred from a filename or summary.
The one E-labelled guarded-history entry `50ef591af8b9b19cd193d6c95c083209e2735b74` is an integration merge.
All22 guarded blobs in this broader path set match at least one actual parent
`d9e0133678306877a41b3642e32938cabe03c9ac` / `4b39fc344b0217597506851fbb81141a9a61be3b`.
There is no novel E-authored guarded source blob. The full175 metadata records, release history and per-blob parent
matches are `/private/tmp/p18v-release-independence.json`; the reproducible caller is `/private/tmp/p18v-history.py`.
This is an inspected inheritance result, not a claim of zero E-labelled history entries.

## Actual case paths and bounded outcomes

TST-287901 reaches `src/settings-pages/index.mjs` public Bridge route → `bridge.mjs:212` saveRemoteSession →
line221 public allocatePort → line224 canonical writeSetting → lines145–154 real tunnelCommands/proxyConfiguration.
It asserts lowest free inclusive40101 persisted as `remote-session:beta` with exact `{port,token}`, preserves the
existing rich alpha record, reopens beta, observes hidden token and explicit Show, checks reverse loopback command,
configured HTTPS origin in both public proxy outputs, named exhaustion and missing jump-host setup, and no fetch.
The real builders render forward/service text too; the final case does not independently assert every forward/service
character. Generated commands/configuration are text; no SSH process, tunnel, webserver or HTTPS test follows.

TST-288901 reaches public Settings route → `settings.mjs:139–144` catalogue label/grant notice → lines147–194
controls → public `browser-store/export.mjs:89` exportSettings with real WebCrypto → line104 importSettings →
line111 added canonical raw writes → exact complete added/kept UI text. It compares all11 constructed implemented
literal/family values in plain export, all absent imported values, the two existing products/Bridge raw byte strings,
and the full ordered added/kept result. A real locked export restores all11 values. Wrong passphrase and malformed
export are awaited to their named settled result before asserting the entire raw destination unchanged.
The notice asserts every represented secret label and absence of all seven secret bytes. Actual source maps the
catalogue's grant strings before constructing the download control; the case does not compare every grant word or
assert notice DOM order independently. It establishes implemented catalogue transfer, not unsupported mailbox/
foreign catalogue support, a personal export, actual browser download or replacement of the legacy controls.

TST-289901 reaches public Release route → `release.mjs:138` pendingCandidate → reportsAwaitingAcceptance and
recordsNewestFirst → line111 paintCandidate → lines122–124 actual snapshots/releaseReport/renderArtifact →
line88 explicit acceptance click → lines95–97 report blob/path/acceptAndRelease → `report.mjs:331` recomputed hash
→ line369 report/approval/changelog commit → line374 tested-commit tag. The fixture supplies a real-shaped selected
completed candidate/tag/job/result record with a failing test. Opening/refreshing writes nothing, actual report includes
levels/tests/requirements and the failing limitation, explicit supplied person/reason yields the matching report blob,
hash-derived approval path, limitation/changelog and tag on the tested commit. Missing reason writes nothing;
refusal is named, incomplete result exposes no acceptance, and no pending candidate preserves the new-release form.
The renderer's permitted source fallback is observed in this controlled DOM. This is an actual public service path
with controlled Host effects, not real human acceptance, deployment/tag publication, notification banner/browser
click, or a claim of every possible rate/catalogue/full-use-case combination.

## Own selected positives and same-case faults

Disposable exact-head archive: `/private/tmp/p18v-release-exact`. First selected positive command:

```sh
node --test --test-reporter=tap tests/release-itm-287-remote-sessions.test.mjs tests/release-itm-288-settings-export.test.mjs tests/release-itm-289-pending-report.test.mjs
```

Own complete baseline `/private/tmp/p18v-release-positive.log`:3pass/0fail,327.285292ms. Then each unchanged final
case was selected alone with `node --test --test-reporter=tap --test-name-pattern='^TST-ID:'` and its explicit file.
Each relevant fault actually failed that same case with exit1, then restoring the exact source bytes passed that same
case with exit0. Test bytes remained unchanged and all guarded source bytes match git show of the exact approved head.

| Case | Own production fault | Actual failure node | Exact restored same case |
|---|---|---|---|
|TST-287901|bridge.mjs:224 writes remote-session:wrong|case:26 canonical beta actual null, expected40101/beta-token|1pass/0fail|
|TST-288901|export.mjs:111 corrupts added endpoint:e key|case:37 actual fault-secret, expected endpoint-secret|1pass/0fail|
|TST-289901|release.mjs pending branch paints new-release form|case:17 actual New release, expected Release candidate|1pass/0fail|

No per-assertion mutation quota is imposed. Complete bounded12second commands, original/fault/restored source SHA256,
unchanged test SHA256 and each complete output/hash are `/private/tmp/p18v-release-faults.py` and
`/private/tmp/p18v-release-own-faults.json`; logs `/private/tmp/p18v-release-TST-ID-fault.log` and `-restored.log`.
Author's distinct final156d receipt `/private/tmp/JOB-20261009-1934-e18-actual-release-test-receipt.md` and all seven
`/private/tmp/e18-final2-*.log` were read: all3positive, own canonical-write/forced-export-lock/pending-branch faults
failed the same author cases and exact restorations passed. Earlier b4a6 proof is identified as earlier, not final.

## Real declarations and entire tested graph

Archived the actual CI merge tree and fed all2015 tracked paths to the real testDeclarations/traceGraph/tracesTo
callers, including accepted SPEC requirement nodes and architecture/use-case originals. Actual133 parsed declarations,
522 graph nodes/155edges,0unread. Each new numeric ID is unique across the whole tree, first in its actual test title,
with contiguous lowercase level/module/guards/given/input/expect fields, nonempty canonical values and level=release.
All named requirement guards return the corresponding actual release declaration through tracesTo.
Full reproducible graph `/private/tmp/p18v-trace.mjs`, result `/private/tmp/p18v-release-canonical-trace.json`;
this is not header grep, a hand-built graph or only a new-file uniqueness check.

## Complete actual Linux CI and inherited named outcomes

GitHub run37985184237 completed SUCCESS on exact156d6838. Independently read its actual final metadata and complete
7404-line raw `/private/tmp/sprint18-ci37985184237.log`, including checkout/setup, every named outcome and end.
Raw SHA256 `05790af8311e126efebc3e7bddcb006e054d4c6aeeda5634050f6812da35b4bc`.
Both jobs actually checked out `946d40befd065f7f9381d1bd4fe9f298194b6e47`; parents are actual base
`9811ca04c06d67f99ce52715d476fffe6e7874c8` plus exact head `156d6838784841b2586c0eaf96d2bc73bd1fa23b`.
Tree `ca208aabd4a47c38d8fbe2c593438734aa0873b5` equals independently computed merge-tree of those exact parents.
The current PR head/base captured in `/private/tmp/p18v-pr270.json` match those pins.
Node20:10:29→20:11:32 UTC63seconds, Python20:10:30→20:11:35 UTC65seconds; both within120seconds.
Node1078total/1070pass/0fail/0skip/8TODO. Python399total/388ordinaryOK/5skip/6expected failures.
All1075 inherited named Node outcomes and all399 Python outcomes were compared individually with prior actual
37983034628, excluding that other tree's10 new286 cases. Every inherited name/status is identical; only the three
newE cases are added here. Complete per-name comparison/raw hashes/checkouts/summary are
`/private/tmp/p18v-ci-all-outcomes.json`, parser `/private/tmp/p18v-ci-read.py`; totals alone were not used.
TODO/skip/expected remain limited outcomes. Historical same-head Sprint17 native flips remain flaky, never passed;
these current distinct green runs do not rewrite those receipts.

## Decision boundary

Root may publish this gate and merge only exact156d6838 after its live unchanged-head/check/target recheck. This CI
base contains delivered287/288/289; it does not contain the selected286 runtime or the later public caller271.
No approval extends to an untested combination, corrected source head, full UC003/002/042/047, shell composition,
trusted real-browser HTTPS, actual human acceptance or deployment. The later combined aggregate and closing gates
need their own actual merged/tested tree. No local broad/full/native/desktop-shell/Electron, computer UI/browser,
clipboard/focus/settings/device/accessibility audit/cleanup, personal export/data, external/system SSH or paid service
occurred. Selected nonnative DOM/storage/WebCrypto/constructed Host only; full/native GitHub Ubuntu CI only.
No child, external publication or source/test/document-contract change occurred; no fixed manual3-round cap.
Complete private evidence manifest SHA256 `b69d68b4c040536246b938510a96e361f4ce9d1f3d4d090a20eae8e341e12e17`.

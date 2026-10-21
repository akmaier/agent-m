---
gate: Development → Release testing
job: JOB-20261021-0529-b103
decider: po-sol
role: Product Owner
decision: passed
on:
  - 08d7f156e476eb8f392f0e80ac293f10938f65a5
  - https://github.com/akmaier/agent-m/pull/1270
date: 2026-10-21 11:14 UTC
---
# Development → Release testing: ITM-1172

**REGISTER**

## Reason

ITM-1172 passes on exact head `08d7f156e476eb8f392f0e80ac293f10938f65a5`. The full PR, five commits and changed source/test were read. Only `src/test-pages/runs.mjs`, the shared `test-runs` topic in `src/site-frame/explanations.md`, and the appended TST-1172001 in `tests/test-pages-runs.test.mjs` change. Public `runs` detail calls `explain("test-runs")` at line 370; the frame reads its topic and renders the folded `details.explain`. The literal test checks that fold and the UC-028 guidance to repair or remove flaky tests, not retry until green. The original thirteen case bodies, the ITM-773 files, result calculations and run-start paths are unchanged. The last commit only prefixes the new test's title with its declared identifier for the supported JUnit reader. Accepted TestPages/SiteFrame contracts and the published Sprint103 Selection admit this scope; no formal change is accepted here.

Tests-only `6ac19a13` is genuinely red in run `39551965322`, job `119062962344`: the public page has zero explanations, expected one, with ERR_ASSERTION at line 297. Exact final-head run `39553892980` has all 23 checks successful, each within two minutes (maximum 100 seconds), without a retry. Its native Node13 job `119069046941` tests checkout `489fc38d15f2fa760a7a9033c7d746ffac28a380`, merging this head into `ac8c288ec6d8c6d0220c6b24395ef28344acc674`; TST-1172001 is literal `ok 355`, with 384/384 shard tests passing. This is Development evidence, not an all-level Release pass.

The new case's actual counter-proof is recorded in PR comment [6314520667](https://github.com/akmaier/agent-m/pull/1270#issuecomment-6314520667). I read the immutable baseline at test-results commit `35ec60af`, fault receipt `abc8742e` (`20261021-1111-on-demand-3260.md`) and restored receipt `22230b61` (`20261021-1112-on-demand-4036.md`), all naming this head and TST-1172001/unit. The temporary topic changes only the required sentence to "A flaky test is repaired or removed; retry it until green." The actual single-case command exits 1 at 11:11 UTC, with testCodeFailure/ERR_ASSERTION at line 305 and the faulty rendered text; the exact restored case exits 0 at 11:12 UTC. The fault record is explicitly uncommitted. The original JUnit files match their recorded SHA-256 values `05102e972c249e7e80bb5b102ae1012999c6b8bb3436fc997af5837f476339e4` and `2b490c020eef78aeda7547740c2483ae98af672d063512407b20b35fac8d69e5`. Restored Git blobs are runs `62a1dd1f768e73d715d13aa6d64ac981a34c465d`, topic file `03990c712c4064be0201a973ddb9bc88b6c57d20`, test `b4a72517f41c02c3a433e5422e0063494ac27558`; all three SHA-256 pins independently match the handoff. No retrospectively reconstructed eight-receipt set is relied upon. Human approval authorized the remaining measurements, not this gate decision.

Earlier head `7edfa66d` and run `39552762158` retain both TST-1082001 outcomes: original job `119065471050` failed through test lines 406/411 → builder 220 → check 215/182 with TunnelCheckFailed; the single failed-job retry `119066167785` passed the same case on checkout `16ab064a`. Its observed outcome is flaky, never a stable passed case or a claimed source fix. Immutable `0601-pull-request-cf01` and `0602-pull-request-cf02` records preserve the flip for sprint feedback and separately scoped BridgeBuild diagnosis. No additional retry or unrelated repair is a condition of this bounded item.

Reviewed main is `c7f06b6a40f5c73f130201ab0a01dfcd95401d69`; the actual sprint ref remains `ac8c288ec6d8c6d0220c6b24395ef28344acc674`. Its intervening main delta changes only own sprint/item/job/gate records; approved inputs, roles and other-team selections/holds are unchanged from the positive-controlled native planning measurement. Team1 assigns po-sol as Product Owner; developer-terra-b implemented and measured this work. I authored no source, tests, measurements or SM closure. After this record is published unchanged, SM may merge only this exact head into `sprint/team1/103`, with fresh head/target/CI guards. Changed relevant source, accepted inputs, item scope or other-team holds require reassessment; unrelated job/gate metadata does not. No main merge, ITM-773 pass, Release-phase pass, formal acceptance or next Selection is authorized.

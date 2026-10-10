# Confidence interval wording source gate

**MEASUREMENT — 2026-10-10 07:45:37 UTC**

**PASS** only PR297 head `2c00922bd1569a727bb1585a871c4154af55d4eb` into approved sprint/19
`3ffb4f03ce1c78485277db3d5802dfe6f03faad1`, decided independently by po-sol.
This exact source pair may proceed to independent release testing. Public257/293 verification after delivery,
whole ITM293/257 DONE, aggregate acceptance and human release acceptance are not decided here.

## Binding condition and actual sequence

SPEC §11, **AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST**, states: “The first commit of an implementation
job that adds or changes behaviour contains only tests, and the product's CI run on that commit is red.”
SPEC §13's default Definition of Done retains this condition; Team2 adds no exception. The scrum-wip
Development → Release testing gate requires “CI is green on it and the Definition of Done holds”.

Original fresh implementation JOB-20261010-0730-2c2f starts at07:30:02 UTC; C's actual Taken is07:31:12.
Its first commit `f687b17b0eb3082f5829d834a901d8946da9150b`,07:32:31 UTC, changes only
`tests/release-evidence.test.mjs`: existing TST-293003 now explicitly requires the generic confidence-interval
wording while retaining its guard/rates and Wilson/numeric assertions. Own product CI38034902688 is red:
Python07:34:47–07:35:49,62s, passes; Node07:34:47–07:36:01,74s, has one non-TODO failure,293003.
Only after that completed red, source commit2c009 at07:37:28 changes report.mjs140. No test changes after f687.
The earlier held PR296 and E's earlier red are not substitutes for this new job's first commit.

## Failure node, correction and verification

Accepted UC013 alternative3b requires the lower rate to be shown “as a finding with its confidence interval”
and leaves the author's decision and reason. Accepted MOD-release-evidence requires each finding's guards.
Actual path: `docs/assets/dashboard/release-view.mjs:11` → public `src/test-pages/release.mjs:122–124`
paintCandidate.load reads candidate/results and calls releaseReport → `src/release-evidence/report.mjs:211–216`
collects declarations, reads results and rateComparison → limitationsText143–147 selects worse rows and guards →
rateFindingText128–140 computes/formats the interval → report Limitations text → unchanged public renderArtifact.

Own first red fails at `tests/release-evidence.test.mjs:414`: expected `/confidence interval/`; actual Limitations
already contains `TST-010: A SAMPLE REQUIREMENT; finding; current 6 of 10; running version 8 of 10; two-sided
95% Wilson score interval for current rate: 31.3%–83.2%.` The generic phrase is missing at formatter140.
The sole source correction adds `(confidence interval)` after the existing exact Wilson phrase. The formula,
z1.959963984540054, confidence level,31.3%–83.2% bounds, rates, guards, schema/interface, reason/refusal,
person-decision and acceptance/tag paths remain unchanged. Own final CI passes the same003 at the real
releaseReport output boundary, including generic wording414 and numeric/method assertion415.
Known-positive complete reports/recorded-reason acceptance and negative incomplete/reason-missing/tag refusal
remain positive. No independent public assertion is weakened; E's public006/022 are not in this source PR tree.

The original retained counter-proof is TST-293003, not the Start's label293031: deliberate formatter return-empty
fault at04:35:33 fails the same case at its guard/rates prefix; exact restoration by04:35:44 passes.
Personally read receipt SHA256 `188e010ae6bb96d6ebfae6a5f46547caacb0c61649a311285bf26d0f95f8978f`.
Its restored source SHA256 `9a16242a053f5282dd032f3607a3d513c9e81a4f319da958e6c404f03d06feda`
equals f687's source. It is historical displayed-tool-output evidence: split streams and separate endpoints were
not captured; no new mutation run or invented bytes are claimed. The new generic assertion adds no test case.

## Exact CI and delivery

Live PR297 independently read OPEN with exact2c009/3ff and both checks SUCCESS. Complete own Ubuntu
CI38035114055: Node07:38:27–07:39:31,64s; Python07:38:27–07:39:32,65s. Both finish within120s.
Node1114 total,1106 passed,0 failed,8 inherited TODO; Python396 tests,5 skipped,6 expected failures.
Required293003, Settings290109–113, runtime286903 and E291901 pass. Historical failures/TODOs remain.
Both checkout logs name `15d61bd984756bfa0bc9f6fc14c5e846388ecff6`; read retained GitHub commit API parents
are `[3ffb4f03ce1c78485277db3d5802dfe6f03faad1,2c00922bd1569a727bb1585a871c4154af55d4eb]`;
tree `7df02d15ea034e45f0a2f59a54619ba7f44e0446` equals the exact local source-head tree.
First-red checkout5e970fed733ed8abd1b3c1117865743d84703bfb has parents3ff/f687 and tree
b3badd8852334bc059174811443cbfea8c66c98b equal to f687's tree. No rerun was requested.

Complete retained artifacts `/private/tmp/root-p19-ci-38035114055.log` (832551 bytes), `.json`, `-commit.json`
have SHA256 respectively `3514db14a27d7004c1d354dfdb56c1b910dc075d233acc632f022dbbf4e4918d`,
`f3c0455aea4611b076860be67e7a8d0420dc5cbb7716682a32f6e44188a82e03`,
`873cf1d600e7a9a2c775a2d77d5ad79e37fedc0951f67f5720b21059d625812a`.
First-red38034902688 raw/meta/API hashes respectively
`2dee307ec9ede8b48947c27ce674981711b076626106de41ff1f41660a8f7bb2`,
`832a6c17ee0ac97592d0d066763e4a402d83e6d2046997d1111f1181b9877177`,
`30bec2ce2d1f38549109b4b693cc65b4485712a0b16aad5d4d26a7d1c5e19dd3`.
I inspected complete retained metadata, checkout/setup/completion, failure-node streams, summaries and named outcomes;
I do not claim to have personally read every unrelated raw-log line or performed product runtime locally.

## Original inputs and independence

Personally read full published original JOB-20261010-0738-91cf at3c0b090 before dedicated Taken07:41:02 UTC
and root's fresh assigned isolated worktree. Retained previously personally full-read AGENTS, all2135 SPEC lines
with truncated spans recovered, README, process/Team2 declarations, both participant registers, scrum-wip,
selectedITM293, acceptedUC013, release-evidence/result-records/test-pages/test-document contracts and ARC043
only after exact unchanged git blob comparison against9d11549. Fresh current PRIMARY Sprint19 all220 lines
and order118, original new C Start/Taken, actual two-commit history, full current formatter and owned test,
public caller and result-rate producer originals were read; unchanged caller/source blobs were verified.
Earlier relevant original unit/public/result/declaration tests are retained as personally read originals;
another agent's inventory or gate is not a substitute for them. Textbook chapter13 original TDD passage was read.

SPEC §13 states: “A gate's decision recorded by the participant that did the work the gate checks does not pass it.”
Actual guarded history attributes formatter to TerraC/predecessorSonnetC, public caller to TerraD/predecessorSonnetD,
pending ordering to TerraB and result producer to predecessorSonnetA. This reviewer and predecessorpo-opus authored
none of the guarded implementation. Shared Git account does not establish participant authorship.

Only this gate document is committed, with a byte-identical comment body for root to publish. Root alone publishes,
merges the approved exact pair and records Ends. No source/test/accepted artifact/selection/process/model/participant/
DoD edit or local/native/UI/device runtime action occurred. Usage:null; cost:null.

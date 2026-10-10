# Confidence interval wording source gate

**MEASUREMENT — 2026-10-10 07:21:18 UTC**

**HOLD** only PR296 head `127ddad16766bea6881261a45a6c6b54b09b68d4` into approved sprint/19
`3ffb4f03ce1c78485277db3d5802dfe6f03faad1`, decided by po-sol. This exact source merge is not authorized.
The one-line correction and its green CI are retained evidence; the implementation-job first-commit condition fails.
No independent public257/293 release, whole use case, aggregate or closing gate is decided.

## Binding condition and failure

SPEC §11, **AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST**, states:
“The first commit of an implementation job that adds or changes behaviour contains only tests, and the
product's CI run on that commit is red.” SPEC §13's default Definition of Done retains that condition;
Team2's Definition of Done adds no exception. The scrum-wip Development → Release testing gate requires
“CI is green on it and the Definition of Done holds”.

Fresh implementation JOB-20261010-0704-606a starts from approved3ff. Its only branch commit is127ddad,
which changes `src/release-evidence/report.mjs` and contains no tests-only first commit. The published Start
explicitly directed this source-only correction after E's independent public tests-only red. Actual red
CI38032899567 belongs to E's PR293 head `cb0ffe0cdd84a8a58eb393785535a6e905b551bd`; it is not C0704's
first job commit. Prior ITM293 tests-only `ddea56d71c668b07062af9f4a6f685866783a5b0` belongs to the earlier
implementation sequence, not this newly recorded job. Neither evidence supplies the missing condition.
The visible report wording changes; no refactoring declaration or accepted process exception establishes another route.

The bounded corrective route is a fresh correctly recorded implementation job whose first commit changes only the
existing owned test to require the generic confidence-interval wording, with its own actual product-red CI read
before the same minimal formatter correction. This requests no unrelated tests or new counter-proof quota.
The current attempt remains HOLD; a future changed head requires its own gate.

## Diagnosis and source review

Accepted UC013 alternative3b requires the lower rate to be shown “as a finding with its confidence interval” and
leaves the author's decision and reason. Accepted MOD-release-evidence's Limitations format retains each finding's guards.
Actual path: `docs/assets/dashboard/release-view.mjs:11` → public `src/test-pages/release.mjs:122–124`
`paintCandidate.load` reads candidate/results and calls `releaseReport` → `src/release-evidence/report.mjs:211–216`
reads result-records' rateComparison → `limitationsText` at143–147 selects the worse row and declaration guards →
`rateFindingText` at128–140 computes and formats the interval → unchanged report text → public renderArtifact.

In actual red38032899567, original public TST-257006 fails at
`tests/release-itm-257-public-flow.test.mjs:197`: expected lower-rate text followed by “confidence interval”;
actual Limitations held the guard, finding, current6of10, running8of10 and “two-sided 95% Wilson score interval”
31.3%–83.2%, but omitted the generic wording. TST-257022 reaches the same rateFlow failure.
The sole source diff adds `(confidence interval)` after the exact Wilson phrase at report.mjs140. The formula,
z1.959963984540054, method, confidence level, numerical interval, rates, guards, public return/schema,
acceptance/reason/refusal and tag paths remain byte-identical outside that line. No independent assertion is weakened.

Own source CI's TST-293003 passes at the actual releaseReport output boundary, retaining the guards/rates and
31.3%–83.2% Wilson assertion. It does not assert the newly added generic wording. E's independent public006/022
are absent from this source PR tree and remain for independent verification on delivered source; current green
source CI is not evidence that those public cases passed on the corrected combination. Known positive complete
report and recorded-reason acceptance, negative incomplete/reason-missing/tag refusal, result-reader improved and
no-baseline cases, and the public route's existing flow remain positive in this CI.

## Exact CI and delivery pins

Live PR296 was independently read as OPEN, exact127ddad into3ff, with both current checks SUCCESS.
Complete Ubuntu CI38033753719: Python07:14:46–07:15:50 UTC,64s,396 tests,5 skipped,6 expected failures;
Node07:14:46–07:16:23 UTC,97s,1114 tests,1106 passed,0 failed,8 inherited TODO. Both jobs finish within120s.
Inherited Settings109–113, runtime286903 and E291901 pass; old failures and TODOs are not rewritten or erased.
Both checkout logs name `20f42fd7d4126fa9ad90317c9c8e35f769d24199`. Independently read GitHub commit API
parents are `[3ffb4f03ce1c78485277db3d5802dfe6f03faad1,127ddad16766bea6881261a45a6c6b54b09b68d4]`;
tree `95cd7e80cb28e0a091916381edf79a08412db1ed` equals the exact local head tree. No rerun was requested.

Complete retained raw `/private/tmp/root-p19-ci-38033753719.log`,835616 bytes, SHA256
`cda18d13de6e6c6fe29eeb66f93d3d0d55e57b3f6f752a5f719daf13bf9587bd`; metadata `.json` SHA256
`c31cf204041358207c88620f599b50a03b1a34834c7617d1187907977d9f04f7`.
Red38032899567 raw SHA256 `adb899a4179a566acbed3ecdcf1e4f13c7ac97e4c2ab3c1b7a2caecbc45492d9`,
metadata `4aff95af8af330785b14aa5c3bb021015f2e04ae2cdb9a33086737fa2ec625c0`, checkout API
`75df183faf671744e7f157e7d1a159fa6f3556d9cf13b3a5e368d6091a2eabb3` are retained alongside it.
I inspected originals, metadata, exact diff, checkout/setup/completion, failure-node streams and required outcomes;
I do not claim to have personally read every unrelated line of the complete raw logs.

## Originals, chronology and independence

Personally read the full published original JOB-20261010-0715-ffa3 before dedicated UTC Taken07:17:12 and root's
fresh isolated worktree from9d11549. Personally read original AGENTS, full2135-line SPEC in bounded outputs
with truncated spans recovered, README, process/Team2 declarations, both participant registers, scrum-wip,
current PRIMARY Sprint19 all220 lines and order118, selectedITM293, acceptedUC013, release-evidence/result-records/
test-pages/test-document contracts and approval pins, affected ARC043, full actual formatter/public caller/interfaces,
result-rate producer and relevant original release-evidence/test-pages-release/result-records/declaration/public257 tests.
Textbook original chapter13 TDD passage was consulted for the process question; it creates no exception to the SPEC.

C's final input ledger SHA256 `037ea43df72596f91aa80fa7e9511e69790a06ec47cafbc1a8639b194985719f` was read
as an authorship/input receipt, not as a substitute for those originals. It honestly distinguishes the earlier161-line
worktree plan from current primary220 and retains premature unpublished8b92/9b73 objects. Actual tree/blob remains
authoritative over discrepant selection metadata.

SPEC §13 states: “A gate's decision recorded by the participant that did the work the gate checks does not pass it.”
Actual guarded history attributes the formatter to TerraC/predecessorSonnetC, public caller to TerraD/predecessorSonnetD,
pending-order work to TerraB, and result producer to predecessorSonnetA. This reviewer authored none of the guarded
implementation; po-sol/predecessorpo-opus's gate records are not implementation. Shared Git account is not authorship.

Only this gate document is committed. Root alone publishes the byte-identical comment body, records Ends and performs
any later independently approved merge. No source/test/accepted artifact/selection/process/model/participant/DoD edit,
local product runtime or native/UI/device action occurred. Usage:null; cost:null.

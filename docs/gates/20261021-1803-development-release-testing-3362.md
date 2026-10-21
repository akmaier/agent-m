---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - c39375bb09113f6377a1b0dd6e84a5f62dcc6293
  - https://github.com/akmaier/agent-m/pull/1280
date: 2026-10-21 18:03 UTC
---
## Reason

ITM-919 passes Development into Release testing on this exact PR1280 head for sprint/team1/107.
Independent po-sol (gpt-6.1-sol), JOB-20261021-1707-3362, authored no Source, test or proof execution.
Original Start, current accepted inputs,107Selection/919, job instructions, required readings, full PR body,
commits/diff, old tests and actual evidence were read. This is the first formal decision, not a rework decision.

First tests-only af2354a4c68fa59ecba928baf719aa338415a85c contains only the two scoped tests. Actual automatic
39640472515/node0 job119362330861 fails TST-919001 on table456/client318 at390px; node7 job119362330815
fails TST-904117 on tables399/563 and two SVG700 widths versus [], and904126 on table439/page476 versus [].
Tests-only2fb restores1280px controls;66a3 corrects the selector against actual Mermaid nesting. Their actual reds
and the subsequent failing Source heads remain. SM's correction of its new every-text-visible overconstraint is
not permission to weaken old text sizes: a362 restores the unconditional all-text size assertion, retained at c393.

Only five files changed, within the two accepted modules and published old-test exception:
- src/implementation-pages/backlog.mjs: column-title data-labels on native tables; working pre > code.language-mermaid
  caller -> renderMermaid -> replaceWith -> post-insertion fitChartViewport -> phone-only reducePhoneAxisLabels.
  Width/resize drawing and deliberate label reduction preserve the source series, all plotted values and merge times.
- src/implementation-pages/roles.mjs: column-title data-labels on role, assignment and edit tables; controls unchanged.
- src/site-frame/look.css: one shared below600px stacked-table rule and labels, not per-route duplicate styles.
- tests/dashboard-backlog-layout.test.mjs: named390px no-overflow policy and actual rendered geometry/axis control;
  system declaration TST-919001. The four table parts/own containers, margins/document fit,1280px auto|scroll,
  unconditional all-text effective-screen-CTM/body size within1px, text/axes positives, line width and contrast>=3 stay.
- tests/site-usability.test.mjs: only resolved904117/126 width TODO reasons removed; literal [] and other inputs,
  expectations and findings unchanged. No helper, fixture, staging, workflow, private legacy or formal edit exists.

The old component17px/640px controls and focus/closed-sprint-count callers are unchanged. Earlier Source's unsupported
query and lost closed-chart merge points were corrected in owned Source, not waived in helpers or old expectations.
Visible positive axis counts use actual axis groups and chart/window geometry; fewer drawn phone labels, not smaller
fonts or counting hidden nodes, is the new outcome. Requiring every text node visible is not added back as a gate rule.

Fresh native Host.pullRequestFacts at2026-10-21T18:00:14.492Z returns exact c393 CI success, all23 head checks
success and no remaining checks; packet /private/tmp/agent-m-po107-gate919-3362-native-1792605614493.json.
Actual canonical39645317811/node0 job119379217535 passes919001 at17:37:28Z. Final PR body/head were reread
after receipt correction. Earlier828 green with a weakened old size guard is not accepted as the reviewed head.

Effective isolated fault6dc3cd16c82bfa300bfd9daadd286336b07e6c40 differs from c393 only by removing
if (phone) reducePhoneAxisLabels(chart) at backlog:458. Actual39646064257/node0 job119381842038 fails919001
at layout:302: expected phone count less than desktop, observed [[390,15],[1280,15]], false versus true.
Restore cb42a9d0e8a2c96638a00504a97cdbaa2439e16d has the exact entire c393 tree
8668a9b09d975c8538e298a363e4243dae7109cd, empty diff;39646247735/node0 job119382485109 passes919001
at17:43:26Z and the run succeeds. PR1282 is closed unmerged at17:45:02Z. Source1280 never contains the fault.
The earlier glyph-unit fault c3716bae passed and is explicitly non-effective, not counterproof; PR1281 history stays.

Read all fourteen original immutable receipts through Host/ResultRecords at1d6216003e5ffe51ed27e213007d0b831e31ac6e,
then the append-only2219 correction at13c53adb30dc6ecda695cbd07e1585c3f541a849. These are fifteen records,
not fifteen new executions: ten local attempt records, four committed-CI records and one classification correction.
Local on-demand/uncommitted:true records retain five passed TAP captures and five not-run/partial geometry attempts,
including four Electron-before-geometry failures and an uncaptured wrapper boundary; missing exits/clocks/JUnit are
not invented.2219 names component for the same15 dashboard-backlog-teams passes, original17:11:50Z and variant;
2218 remains byte-identical blob2415bbf9ccc3ff2745765cfcd48092dcc122f731. Committed proof variants are pull-request
records, not local/uncommitted runs. Native ResultRecords derives canonical pass, ineffective pass, effective failure
and exact-restoration pass separately. No replay, rewritten measurement or extra durable-hash obligation was imposed.

This satisfies the selected Acceptance and Development DoD under the accepted Frame/Implementation contracts.
TST-919001 remains implementer-authored system evidence, not independent release or whole-UC coverage. Existing
independent release artifacts and their actual later all-level outcomes remain for the normal release gate; no sprint
end/closure, main delivery, formal acceptance, tag or deployment is authorized here. SM publishes this record unchanged
then performs its fresh exact-head integration guard. PO writes only this immutable gate; no tests/probes/faults,
Source/helper edits, CI retry, push or merge were performed.

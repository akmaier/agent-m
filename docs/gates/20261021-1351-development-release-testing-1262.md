---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - 411c7c631bbf47fc9f7c61d286fe4474fb5304bb
  - https://github.com/akmaier/agent-m/pull/1274
date: 2026-10-21 13:51 UTC
---
# Development → Release testing: ITM-1163

**REGISTER**

## Reason

ITM-1163 passes on exact head `411c7c631bbf47fc9f7c61d286fe4474fb5304bb`. This is the second and final Development gate within Sprint105, following the one permitted rework of requirement-specific implementer provenance. The first rejection, `20261021-1334-development-release-testing-57df.md`, remains unchanged. The original Start JOB-20261021-1343-1262 and SM's completed-candidate handback authorize this assessment, not a merge by this PO. The previously read AGENTS, SPEC, process/model, PO instructions, UC-030 and accepted module originals are unchanged.

The failure path is repaired at its node: `src/release-evidence/audit.mjs:135-143` derives implementers from the current requirement's item/use-case traces, compares the release test's recorded writers with those implementers, and line 146 assigns that local `writtenByImplementer` boolean to the current row's test. Only qualifying IDs enter the global Set at line 144; line 159 uses its size solely for the distinct-test summary. Thus the shared-test regression has R1 true, R2 false, summary 1. `src/trace-pages/audit.mjs:40` remains a consumer of row flags; its existing count-click path filters to R1 alone. This matches accepted MOD-release-evidence blob `1d3c23effa9bd150d31b6b01b41ac34f1f89c37a`, Interfaces, and ITM-1163 Acceptance without a formal-text change.

All four PR commits, their complete deltas and changed files were read. Only `src/release-evidence/audit.mjs` and `tests/release-evidence-audit.test.mjs` in MOD-release-evidence, and `src/trace-pages/audit.mjs` and `tests/trace-pages-audit.test.mjs` in MOD-trace-pages, change. The rework adds only TST-1163003 and TST-1163004 in tests-only `6add58bd737e531ee65837a1c8e9a62e53e775c7`, then changes only the provider's row loop in `411c7c63`. The original TST-1163001/2 bodies and existing expectations are unchanged by the rework. Across the entire PR, the sole old expected-result change remains the explicitly scoped TST-756003 additive shape: false/false, false/true, false/false for TST-756101/102/103, with their previous fields preserved. Each of the four new cases names its owned module, UC-030 and THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE. No view-side provenance rule, evidence format, export change or other scope is added.

The original tests-only red run `39605947502` and first candidate green run `39606775621` remain the evidence already inspected for the original two cases. Actual rework-red run `39609798570` fails TST-1163003 at test line 209 with [true,true] instead of [true,false], and TST-1163004 at line 278 with R1 and R2 instead of R1 alone, both ERR_ASSERTION. At `2026-10-21T13:51:12.675Z`, the native Host.pullRequestFacts(1274) returns the exact checked head, the same four scoped files, commit CI states failure/success/failure/success for d0ea9f26/1965c2a7/6add58bd/411c7c63, and all 23 head checks successful. The aggregate of workflow `39610567513` still reports `in_progress`, with no terminal conclusion, in the separate read at 13:51 UTC; it is not described as terminal. The existing native CI condition is satisfied: github.mjs `ciOf` derives commit CI from checks, `pullRequestFacts` supplies those checks, and product-process/done.mjs requires head CI success and no failure/cancelled/timed-out/queued/running head check. No additional aggregate-completion condition is imposed.

I read all six new actual immutable receipts through the existing Host/Snapshot and ResultRecords schema path, the six raw local JUnit XML captures and their empty stderr captures, and PR comment [6317614518](https://github.com/akmaier/agent-m/pull/1274#issuecomment-6317614518). Under `runs/6add58bd737e531ee65837a1c8e9a62e53e775c7/`, the records are:

| Record | Immutable commit | Case and actual outcome |
|---|---|---|
| `20261021-1342-on-demand-b301.md` | `a368109c6eac0ddeec7014c4b563551cdb38eb0e` | TST-1163003 baseline passed |
| `20261021-1342-on-demand-b302.md` | `c4c3c7b38afd92c5f3dc97aba4ae9a50ab0d50f2` | TST-1163004 baseline passed |
| `20261021-1342-on-demand-b303.md` | `d4a12d8102a5053811ee1ce8549403b750e6d119` | TST-1163003 propagation fault failed |
| `20261021-1342-on-demand-b304.md` | `f2a18793d03cdffb854e16e82b2b844d2371ced2` | TST-1163003 restored passed |
| `20261021-1343-on-demand-b305.md` | `9e44cedadda68ead0b97c166058b800258f453ab` | TST-1163004 propagation fault failed |
| `20261021-1343-on-demand-b306.md` | `76065496cb8864fefb588410862fec361634811b` | TST-1163004 restored passed |

Both literal source faults replace `byImplementer: writtenByImplementer` with `byImplementer: byImplementer.has(id)`. The captures show the actual rejected propagation at the provider assertion (true/true versus true/false) and through the public page (R1+R2 versus R1). Independent in-memory hash reconstruction from the checked Git blob matches fault SHA-256 `5ca17d4ab831afe3c0d246a10ced7b27fbe7aa28fb294c66fae07ed0b83a5214`; exact restored provider SHA-256 is `cd22bff38e244b485d1e57f2a453bd44e5746726c1bc8a60fa7d8c91a925db22`. Frozen test-file pins match `b5566b1e6f97ccb7588917a1672fd2d862fba490b848345f9feeae2d6e200ae9` and `285f25a0f14bc961557a6e770beb8757806ff4b1b45448f46920b349779d421d`; the unchanged page pin remains `f7bf6168c60789a280db6ef5c0d18b8489713b49e05e0c57fbaf3c2861a5dbc5`. The new receipts say `occasion: on-demand`, `uncommitted: true`, participant developer-terra-b, over tests-only 6add58bd: focused manual proof, not committed-head CI. The six original receipts and their original `occasion: commit` labels remain immutable, with their previously inspected actual meaning; no old proof was replayed or relabeled.

I authored none of the checked source, tests or proof measurements, and ran no test, probe or planted fault. This pass concerns only Development for ITM-1163 on the named head. SM retains publication, fresh exact-ref/check guards and merge responsibility. It grants no formal acceptance, Sprint105 end decision, SM Review/Retrospective authorship, main merge or ITM-730 source acceptance.

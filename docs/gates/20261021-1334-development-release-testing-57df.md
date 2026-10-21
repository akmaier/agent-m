---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 1965c2a712ae46de54efdb7537518778a89d015a
  - https://github.com/akmaier/agent-m/pull/1274
date: 2026-10-21 13:34 UTC
---
# Development → Release testing: ITM-1163

**REGISTER**

## Reason

ITM-1163 is rejected on exact head `1965c2a712ae46de54efdb7537518778a89d015a` for one condition: its provider flags do not preserve the accepted requirement-specific implementer provenance (item Acceptance, second bullet). MOD-release-evidence's accepted blob `1d3c23effa9bd150d31b6b01b41ac34f1f89c37a`, Interfaces, defines `byImplementer` as a release test whose writer is "an implementer of the requirement (above)"; the summary separately counts distinct tests. In `src/release-evidence/audit.mjs:133-140`, `auditRows` combines qualifying IDs from all requirements into one Set; line 149 assigns that global membership to every row holding the test. For a release test guarding R1 and R2 whose writer implemented R1 but not R2, the code assigns true to both entries instead of true for R1 and false for R2. `src/trace-graph/derive.mjs:23-31` derives the items/use cases separately for each requirement, so sharing a guarding test does not make the writer an implementer of both. `src/trace-pages/audit.mjs:40` then consumes the wrong true flag and includes R2 in the implementer filter. The distinct-test summary can correctly remain 1 while the row flag is wrong. This is a static data-flow finding at the assignment node, not a claim that an additional fixture was executed. The single permitted rework concerns this condition only, preserving distinct-test summary counting and the accepted old-expectation boundary.

The full PR description, both commits, full diff and changed files were read. Tests-only `d0ea9f26c4f0c11723f8e1b85031b7843630e45a` changes only `tests/release-evidence-audit.test.mjs` (owned by MOD-release-evidence) and `tests/trace-pages-audit.test.mjs` (owned by MOD-trace-pages); the source commit changes only those modules' `src/release-evidence/audit.mjs` and `src/trace-pages/audit.mjs`. The only old expected-result change is TST-756003's explicitly authorized additive booleans, with the exact three pairs false/false, false/true, false/false; its previous fields and other old expectations are preserved. TST-1163001 and TST-1163002 name their modules, UC-030 and THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE. The view uses supplied flags, without inventing provenance or counting rules. The existing fixtures do not exercise a shared test with different requirement implementers.

Actual first-red run `39605947502` on the tests-only head ended with node (1) and node (5) failed and the other 21 jobs successful. The non-TODO failures are the expected missing row flags at release-evidence test lines 177 and 194, and all six rows instead of A FIFTH RULE at trace-pages test line 264. Final run `39606775621` is completed, successful, on the exact checked head, with all 23 automatic jobs successful. Those outcomes do not resolve the static provenance defect above.

I read the actual six immutable result records through the existing Host/Snapshot and ResultRecords schema path, their local JUnit XML captures and empty stderr captures, and PR evidence comment [6317072437](https://github.com/akmaier/agent-m/pull/1274#issuecomment-6317072437). Under `runs/d0ea9f26c4f0c11723f8e1b85031b7843630e45a/`, the records are:

| Record | Immutable commit | Case and actual outcome |
|---|---|---|
| `20261021-1315-commit-a101.md` | `b43d1c5e14743af5b3717e0e34aac242e560b3e0` | TST-1163001 baseline passed |
| `20261021-1315-commit-a102.md` | `85fc491135b4a90f8dbbe36aefa89ca0e49e56b6` | TST-1163002 baseline passed |
| `20261021-1315-commit-a103.md` | `ddc40cb177845c6823514c9607a73b0d36d34032` | TST-1163001 provider fault failed |
| `20261021-1315-commit-a104.md` | `e4c03df49999ca9802822c469b0791a70298b4ef` | TST-1163001 restored passed |
| `20261021-1316-commit-a105.md` | `bed31ff914db1eaacba550f3320356fb77c647c3` | TST-1163002 view fault failed |
| `20261021-1316-commit-a106.md` | `8037201ce202f0255e7a0f292719d9fcd8dce9f0` | TST-1163002 restored passed |

The literal provider fault changes `worse: worse.has(id)` to `worse: false`: TST-1163001 observes false instead of true at line 194. The literal view fault changes the worse predicate to `() => false`: TST-1163002 observes no rows instead of A FIFTH RULE at line 264. Independent hash reconstruction from the checked Git blobs matches the recorded fault SHA-256 values `a9ebf034dafab1704a12aaa606a5bc7555de424dc5978ea39e714a3f892446f2` and `796591e2533fc66e596431fa8dd7fba06920cc737df326a3f674b00fcb365d05`, respectively. Restored provider/page pins are `55e72cfc8f6cebe3e7239e3860d27abc88364a5d7b620a13a8a7bc5bf6892e53` and `f7bf6168c60789a280db6ef5c0d18b8489713b49e05e0c57fbaf3c2861a5dbc5`; unchanged test pins are `fc90ebafd01109a086471928d322a76ee49ea51fb47208b54f0ec82a6e79a67a` and `727dbe138d66963371773388cdad27384efe1d7cde6e7fd1ec87a8d216ea62c0`. No fault was written or test rerun by this PO.

The six records retain `occasion: commit`, participant developer-terra-b and `uncommitted: true`. Their actual meaning is manual focused verification on uncommitted source over the tests-only commit, not six automatic CI runs or committed-head outcomes. MOD-result-records, Data and resultsAt, explicitly excludes uncommitted records from commit aggregation; the final automatic CI is separate evidence. No receipt-label change or additional proof obligation is imposed. I authored none of the checked source, tests or proof measurements. This gate neither accepts formal artifacts nor authorizes a merge; ITM-730's parallel work is outside the checked head and this decision.

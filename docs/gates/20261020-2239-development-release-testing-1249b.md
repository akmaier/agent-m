---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 24bd6b0660b571412053a918e1b7382187b7acc0
  - https://github.com/akmaier/agent-m/pull/1249
date: 2026-10-20 22:39 UTC
---
# Development → Release testing: ITM-658, the specification view names a failed read through the frame

**REGISTER**

## Reason

Pull request #1249 into `sprint/team1/102` passes on `24bd6b06`. CI is green on 23 of 23 checks (run 39508428953). CI
on a sprint branch leaves release tests out. The rejection on `5f3c46a4` (`docs/gates/20261020-2217-development-release-testing-1249.md`)
is answered.

1. **The rejected point is fixed, tests first.**
   - `9d9b0d3b` holds only tests: TST-658002 in `tests/trace-pages-audit.test.mjs`. Its CI is red: job 118918982737
     reads `not ok 324 - a failed listTags is named through the frame in the audit view, never read as no release`, then
     "# fail 1" and "# cancelled 0".
   - `24bd6b06` is the fix, in `src/trace-pages/audit.mjs` and `flow.mjs`. On `#audit`, a failed `listTags` now reads
     "The tags could not be read:" followed by `readProblem`'s element, and never "No release is tagged". So ITM-658's
     acceptance, "A failed `listTags` never says that no release is tagged", holds on both views.
2. **The earlier commits.** They stand as recorded at the rejection:
   - `218c460e`: "# fail 5";
   - `5703ee4b`: "# fail 6";
   - `2743cf66`: the code;
   - the merges `015410a1` and `efa63169`, and the fix `5f3c46a4` after the merge.
   The pull request changes only `src/trace-pages/` and tests that name MOD-trace-pages, as ITM-658 bounds it.
3. **The replay**, in a clean worktree at `24bd6b06`, with a private `TMPDIR`:
   - **The module's tests:** `tests/trace-pages*.test.mjs` and `tests/system-itm-599-gaps-view.test.mjs`, 177 of 177
     pass, none `todo`.
   - **The counter-proof:** with `src/` checked out at the sprint branch `8f2488eb`, the specification and audit test
     files fail 7 of 50.
   - **The release tests that name MOD-trace-pages:** 7 files and 50 cases. 48 pass and none fails. The two `todo` cases
     are the known findings ITM-657 and UC019-S10.
4. **The merge.** `git merge-tree` with `sprint/team1/102` at `8f2488eb` is clean.

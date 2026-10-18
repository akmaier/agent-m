---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - a2011e18379b82fe88fffc15c45ae3399f4bbd75
  - https://github.com/akmaier/agent-m/pull/861
date: 2026-10-18 07:56 UTC
---
# Development → Release testing: ITM-724, the whole architecture as a recipe, and what a change of it rests on

**REGISTER**

## Reason

ITM-724 (MOD-approvals: the recipe `whole-architecture`, and `rests-on-accepted` with `architecture: true`). Pull request
#861 into `sprint/team2/89` passes on `a2011e18`.

1. **Red first, tests only.** `227e4fd9` changes only `tests/approvals-strategies.test.mjs`, and run 39108768281 is red.
   - Its six new tests fail on the base code, because the recipe and the architecture's part are missing.
   - Four of them also pass on the head's code unchanged.
   - The two fixture slips were in TST-724001 (the file order) and TST-724006 (the stand-ins `identifier-kept` and
     `accepted-use-cases` for `prepareJob`). The second commit changes only how those two tests prepare their fixture.
   - The corrected file fails all six on the base code too. So the red commit shows the Acceptance's tests failing for
     the missing behaviour. No stub.
2. **Green.** Run 39108946663 passes all 12 jobs on the merge of `a2011e18` into `8c96301e`.
   - `git merge-tree` merges the head into `sprint/team2/89` at `42006a80` (#857) without a conflict (tree `2798d253`).
   - #860 (ITM-887) changes `index.mjs`, `status.mjs` and `tests/approvals-status-of.test.mjs`. #861 changes
     `strategies.mjs` and `tests/approvals-strategies.test.mjs`. No file is in both.
   - #860 reads release reports in `statusOf` only, not in `statuses`, which this item reads.
3. **Scope.** Two files changed:
   - `src/approvals/strategies.mjs` is a part that MOD-approvals' Parts names.
   - `tests/approvals-strategies.test.mjs` is an existing test whose header names MOD-approvals. It gains tests and two
     changed header lines. No expected result changed.
4. **Tests.** TST-724001 to 724006 each name the module and the requirements they guard. I replayed five counter-proofs in
   a checkout of the head (724001, 724002, 724003, 724004 and 724006), and each fails as recorded.
5. **Acceptance holds.**
   - Every ARC and MOD file is one part, keyed by `artifactSchemas().decision` or `.module`.
   - `prepareJob("change-architecture")` finds every strategy.
   - With `architecture: true`, the open and changed files are named. Without it, nothing of the architecture is named.
   - The findings for requirements and use cases stay as they are.
6. **Release tests (agreement 83).** I ran these on the head with `LC_ALL=C`, after the Bridge packages were installed.
   - No release test imports `src/approvals/` directly.
   - The 29 `release-*` and `system-*` files that reach `strategies.mjs` through imports, `system-uc-008` and
     `system-uc-022` among them: 218 tests, 214 pass, 0 fail, 4 todo.
   - The traceability release test, `approvals-strategies` and `workflow-entries-job-workflow`: 25 pass, 0 fail. "no
     secret value" passes.
7. **Reading** (AGENTS.md §6a.6, §6a.7).
   - MOD-approvals.md:142-144 says "where the parameters ask for it" and names no parameter. It names none for the
     requirements and use cases either.
   - `JobContext.params` is `Record<string, unknown>` (MOD-job-runner.md:202).
   - The item's dated section reads it as `architecture: true`, and the code follows that reading.
   - The name is a word the module file does not contain, so the module line is drafted:

DRAFT for akmaier: in MOD-approvals.md, `rests-on-accepted` (Interfaces, `approvalStrategies`), replace "and, where the
parameters ask for it, every file of the architecture that is not accepted" with "and, when the parameter
`architecture` is true, every architecture decision and module file that is not accepted; the requirements and use
cases are those of the parameters `requirements` and `useCases`".

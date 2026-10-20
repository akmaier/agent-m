---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b1b1ad22a04443720bff1059dcc55806afb6afb2
  - https://github.com/akmaier/agent-m/pull/1259
date: 2026-10-20 22:52 UTC
---
# Development → Release testing: ITM-1160, a participant a linked source forbids

**REGISTER**

## Reason

Pull request #1259 into `sprint/team1/102` passes on `b1b1ad22`. CI is green on 23 of 23 checks (run 39510738708). CI
on a sprint branch leaves release tests out. The rejection on `11d24121`
(`docs/gates/20261020-2242-development-release-testing-1259.md`) is answered.

1. **The plan path is covered, tests first.**
   - `f72b9cb2` holds only tests: `tests/implementation-pages-implement-plan-places.test.mjs`, TST-1160101 to 104. Job
     118929212686 reads `not ok 47` and `not ok 49`, then "# fail 2" and "# cancelled 0".
   - `281126f1` holds only tests: TST-1160105. Job 118930136023 reads `not ok 47`, `49` and `51`, then "# fail 3".
   - `b116faa9` is the fix. The plan path's job context carries the places `placesOf` reads, and each ticked step offers
     only the holders whose place the job's content permits, naming the content withheld.
   - So UC-024 5b holds on both of the page's paths.
2. **The surviving mutant.** `capable.length === 0` in `drawJobs` is ITM-733's branch, `holders.length === 0` at the
   base `83ee5208`, renamed here. It is not behaviour this item adds, so its survival is no finding of this gate.
3. **The earlier commits** stand as recorded at the rejection. The pull request changes only
   `src/implementation-pages/implement.mjs` and two new test files that name MOD-implementation-pages. The merge
   `b1b1ad22` has an empty `git show --cc`.
4. **The replay**, in a clean worktree at `b1b1ad22`, with a private `TMPDIR`:
   - **The module's tests:** `tests/implementation-pages*.test.mjs`, 108 of 108 pass, none `todo`.
   - **The counter-proof:** with `src/` checked out at the sprint branch `83ee5208`, the two new files fail 5 of 11. The
     6 that pass are the counter-proofs, which hold before the code as after it.
   - **The release tests that name MOD-implementation-pages:** 3 files, 24 of 24 pass.
5. **The merge.** `git merge-tree` with `sprint/team1/102` at `83ee5208` is clean.

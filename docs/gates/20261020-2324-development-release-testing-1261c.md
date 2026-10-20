---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c4b5d51e518f17132f17d54f46827feacec12a5d
  - https://github.com/akmaier/agent-m/pull/1261
date: 2026-10-20 23:24 UTC
---
# Development → Release testing: ITM-649, a guards entry names a requirement or a use case, nothing else

**REGISTER**

## Reason

Pull request #1261 into `sprint/team1/102` passes on its merged head `c4b5d51e`. CI is green on 23 of 23 checks (run
39514538429). The pass on `1c206bbe` (`docs/gates/20261020-2317-development-release-testing-1261b.md`) stands for
everything before it.

1. **The commits after `1c206bbe`.**
   - `d8f91d48` merges `sprint/team1/102` at `40148b92`, with ITM-767.
   - `270d1c2a` cleans the 12 `guards: UC-029 (step N)` entries of ITM-767's unit test
     `tests/trace-pages-test-detail.test.mjs` to `UC-029`, in a commit of its own. That is the cleanup ITM-649 does for
     the headers it finds.
   - `c4b5d51e` merges `1c206bbe` back in.
   - Both merges have an empty `git show --cc`, and `1c206bbe` and `40148b92` are both ancestors of the head.
2. **The replay**, in a clean worktree at `c4b5d51e`, with a private `TMPDIR`:
   - **The module tests:** test-document, trace-pages and web-links-file, 212 of 212 pass.
   - **All 72 release-test files:** 435 pass, 0 fail, 9 `todo`, as at the base.
   - **Findings:** `testFindings` over every declaration in `tests/` gives 0 findings under `A REFERENCE NAMES THE
     IDENTIFIER, NOT THE POSITION`. The same script gives 1 finding on a planted `guards: UC-005 (step 3)`.
3. **The merge.** `git merge-tree` with `sprint/team1/102` at `40148b92` is clean.

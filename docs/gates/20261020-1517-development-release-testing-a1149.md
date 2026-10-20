---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 00fb4b5f37166763d80f55c676c40d80400ba9f1
  - https://github.com/akmaier/agent-m/pull/1221
date: 2026-10-20 15:17 UTC
---
# Development → Release testing: ITM-1149, passed — the backlog route takes its facts from productFacts

**REGISTER**

## Reason

ITM-1149 (MOD-implementation-pages), pull request #1221 into `sprint/team1/99`, passes on `00fb4b5f`.

- **Four commits, all with the trailer `developer-sonnet-b`.**
  - `2ec3fa4a` holds only tests: `tests/implementation-pages-backlog-stored-facts.test.mjs`.
  - `c1eb64f0` changes `src/implementation-pages/backlog.mjs`, which takes its facts from `productFacts` with the scope
    `work`, and the tests named below.
  - `04e80021` merges `sprint/team1/99` (`b293a275`, after ITM-789). Its one conflict, `contextOf`'s header, keeps the
    export and the new body (`git show --cc`).
  - `00fb4b5f` changes the warning's text into a constant, and the `model_version` of two python fixtures.
- **The red,** run 39443285205, job 118698474175 on `2ec3fa4a`: `# fail 3`, `# cancelled 0`, exactly tests 40, 42 and
  43. TST-1149002, the counter-proof, passes before the code.
- **The points, judged:**
  1. **The assertion removed from TST-1149003.** The red test served the instance and the product from one host. The
     code reads the model from the instance's own host, as MOD-progress-measures' `productFacts` does, so the test now
     gives the instance a host of its own. Its calls are not counted, so "the model version was asked for" can no longer
     be read there.
     - What the Acceptance asks is still asserted: the warning names the commit and `NotFound`, there is no model-derived
       part, and the items are listed. The warning comes only from a model version that was asked for and not read.
     - Narrowing the row match to the backlog part counts the backlog's rows only. The other parts list the same items.
     - No expectation the item asks is weakened.
  2. **The changed existing tests** are of level `unit`, `component`, `system` and `module`. None is of level `release`.
     - Their counts follow `productFacts`' reading of a product with no stored facts: the stored facts asked for, the
       facts in batches, and the instance at the model's commit.
     - `load-per-view` checks the first wave exactly, and adds that no file is read twice. That stays within
       `A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672-675), which bounds a request's size and forbids a
       second read of a file.
  3. **The fallback to today's catalogue is gone,** as the Acceptance asks. So the fixtures that relied on it name a model
     version their instance holds.
  4. **Scope `work`** reads neither the test files nor the results branch, which the backlog does not show.
- **CI:** 23 of 23 checks passed on the head (run 39446326083).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/99` (`b293a275`) is clean.
- **Replayed in a clean worktree at the head,** with the Bridge's packages installed as CI installs them and a temporary
  folder of its own:
  - The 190 tests of `tests/implementation-pages*`, `tests/progress-measures*`, `tests/dashboard-backlog*` and
    `load-per-view` pass.
  - `test_progress_derived` and `test_parallel_sprints` are OK.
  - The release tests that touch the backlog, MOD-implementation-pages or MOD-progress-measures pass: 12 files with 142
    tests, none failed.
  - Counter-proof: with the sprint branch's `backlog.mjs`, exactly tests 40, 42 and 43 fail.

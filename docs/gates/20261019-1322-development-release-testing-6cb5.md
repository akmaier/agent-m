---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 09b587ce2e6d3b00a2e8e753262b1749423a93cf
  - https://github.com/akmaier/agent-m/pull/1065
date: 2026-10-19 13:22 UTC
---
# Development → Release testing: ITM-855, the links to test-results and to the run when the records cannot be read

**REGISTER**

## Reason

ITM-855, pull request #1065 into `sprint/team2/96`, passes on `09b587ce`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `488e1e40` holds only the tests, and CI failed on it.
2. **Scope.** Only `src/test-pages/runs.mjs` and `tests/test-pages-runs.test.mjs` change.
3. **The accepted text.**
   - MOD-repository-hosts' `WebLinks` gives `commitRuns(commit)` and `branch(name)` (MOD-repository-hosts.md:149-151).
   - MOD-test-pages uses `webLinks` for "the runs of a commit, the branch `test-results`" (MOD-test-pages.md:158).
   - The notice now links both, in place of the page of all runs.
4. **Readings accepted.**
   - "The run on the server" (UC-028 2b) is the commit's runs page, since nothing can be read to give a run's identifier.
     This is the reading recorded at sprint 89's start.
   - TST-760009, which pinned the old `actions` link, changes with it. It is a unit test of the same module, so no release
     test is touched.
5. **Counter-proofs** F1 to F5, as listed in the pull request.

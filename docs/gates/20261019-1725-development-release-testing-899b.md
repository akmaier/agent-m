---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 0e8a0e4abd4d4c65ec7e027de0dcab04e697bc0c
  - https://github.com/akmaier/agent-m/pull/1111
date: 2026-10-19 17:25 UTC
---
# Development → Release testing: ITM-1081, a CI run names the runner label it waits for, so that the schedule page shows a row's own queued runs

**REGISTER**

## Reason

ITM-1081, pull request #1111 into `sprint/team2/97`, passes on `0e8a0e4a`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `50e7bc87` holds only tests, and CI run 39292111636 failed on it.
2. **The accepted text** (`cad31cde`, accepted).
   - MOD-repository-hosts' `ciRunLabels(id)` is built over the two adapters: GitHub's jobs' `labels`, GitLab's jobs'
     `tag_list`, each once.
   - The schedule page lists under a self-hosted row only the queued runs whose labels hold the row's label.
3. **The changed test.** TST-850002 in `tests/test-pages-schedule.test.mjs` gives its runs labels now. The file is
   `Level: unit` of MOD-test-pages, not a release test, so the implementer may change it, though ITM-850 was another's.
   Its assertion follows the accepted text's new meaning of "the row's runs".
4. **Scope.** `src/repository-hosts/` and `src/test-pages/schedule.mjs`, the item's two modules, and their tests.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 89d4cdf396046ffd3e913f0fb1e750175f7bf5b4
  - https://github.com/akmaier/agent-m/pull/1236
date: 2026-10-20 21:08 UTC
---
# Development → Release testing: ITM-809, the progress facts name the default branch's results and the instance (second gate)

**REGISTER**

## Reason

ITM-809, pull request #1236 into `sprint/team2/98`, passes on `89d4cdf3`, unchanged since its rejection. CI is green on 23 of
23 checks. The first gate's reasons for the code stand.

1. **Red first.** Helper pull request #1239 has a CI run at the tests-only commit `35692aea` (run 39497082703). It shows 3
   failures, and they are this item's new tests:
   - node (12) fails the `resultCommits` cases of `productFacts` (scope `all` and `work`) and the callers on facts
     without a graph;
   - node (13) fails "stageShares — at this repository's size it reads the records of the newest commit and no file";
   - node (14) fails the Tests stage, flaky and unrun tests not passing, no older commit asked once settled, the unknown
     facts, the instance's own full bar, and `currentStage` returning null.
   - The other `not ok` lines in those logs are the nested runs of counter-proof tests, and the jobs fail on the new tests.
2. **The reading** is named in the pull request (issuecomment-6301426075): one passage each of AGENTS.md §6a.2, SPEC.md
   `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`, and chapters 9, 11, 12 and 13. Each heading quoted was found in its
   file.
3. **Scope.** The pull request changes TST-827002 in `tests/main-page-home.test.mjs`, which names only MOD-main-page. The
   card's Tests stage reads "0 %, 0 of 2 requirements guarded by a passing test" instead of unknown.
   - `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` (SPEC.md:1442-1445) admits only "tests that name one of those
     modules".
   - Moving the expectation into a progress-measures test would leave TST-827002 failing, because the card shows the
     stage this item changes. So the test belongs to the item.
   - The item now names MOD-main-page among its modules, for this test alone. No code of MOD-main-page changes.
   - `conflicts` finds MOD-main-page held by no item of team 1.
   - TST-827002 is a unit test, so its implementer may change it.
4. **No release test changes.**

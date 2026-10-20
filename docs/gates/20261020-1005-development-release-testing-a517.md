---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 75832182035e0f806f00978d8d98e258661cf167
  - https://github.com/akmaier/agent-m/pull/1190
date: 2026-10-20 10:05 UTC
---
# Development → Release testing: ITM-766, the tests view of MOD-trace-pages

**REGISTER**

## Reason

ITM-766, pull request #1190 into `sprint/team2/97`, passes on `75832182`. CI is green, on 20 of 20 jobs. The branch holds
`sprint/team2/97`.

1. **Red first.** `6b53aa5c` holds only `tests/trace-pages-tests-view.test.mjs` (TST-766001 to 009), and its CI failed:
   one job failed and nineteen passed.
2. **The Acceptance.** The cases state the tree, each grouping, each filter, the empty level, Incomplete, the broken link,
   a tag's outcomes and 1b. Three planted faults in `src/trace-pages/tests.mjs` fail them. Only `src/trace-pages/` and
   tests that name MOD-trace-pages change.
3. **The changed existing test.** TST-600154 (`tests/trace-pages-subject.test.mjs`, level unit) used the key `tests` as a
   view the route does not draw. The route now draws it, so the case takes `audit` at `v1.0`. Its expected result is
   unchanged, and it still compares two versions. A unit test may be changed by its item's implementer.
4. **f's readings.**
   - Outcomes come from `resultsAt` alone, and the level counts follow the active filter. Both are within UC-029 steps 1
     to 3.
   - **Both further readings stay.** A test whose module the version lacks gets a broken group of its own, and a test
     with no module goes under "no module".
     - Neither is a feature added in advance. In the grouping by module, a test's module is its group. Without these
       rules, such a test would drop out of the tree.
     - UC-029 2a says such a test "is not moved to another group". The broken group is the same rule that
       `tests.mjs:79` applies to every grouping, and "no module" is one fallback (`:84`). YAGNI would remove code that
       speculates. Here, removing it would mean code that hides a test.
     - No case pins either reading. That is noted here, and no item is registered.

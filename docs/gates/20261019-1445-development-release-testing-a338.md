---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 0a834d1c314bf713928340aa98084acda016d72e
  - https://github.com/akmaier/agent-m/pull/1089
date: 2026-10-19 14:45 UTC
---
# Development → Release testing: ITM-764, Generate tests — review the cases and write them

**REGISTER**

## Reason

ITM-764, pull request #1089 into `sprint/team2/96`, passes on `0a834d1c`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `22747f10` holds only the tests, and CI failed on it. f gives 17 counter-proofs. One removal flag that
   duplicated another was dropped, so that its fault is caught.
2. **Scope.** `src/test-pages/generate.mjs`, `index.mjs` and the test. `index.mjs` hands `routeStrategies`, which the
   accepted view already names (MOD-test-pages.md:104-105), for the writer of `write-tests`.
3. **Readings accepted:**
   - where the proposal is read from;
   - "the flags" are the last round's findings.
4. **The level `user`.** The answer schema of `propose-tests` lists no `user`, while MOD-test-document.md:54 has it. So `user`
   is reached only by reclassifying a case. This is registered as ITM-1085 (MOD-job-catalogue).
5. **`sourceStrategies` and `resourceStrategies`.** The tests register both, as other views' tests do.
   - MOD-job-catalogue.md:142-143: `write-tests` and `run-tests` have `resources: product`, and each names MOD-resource-list's
     `resource-pins` among its recipes (`src/job-catalogue/kinds/write-tests/kind.md:19`, `run-tests/kind.md:13`).
   - So the test pages need `resourceStrategies` too. The draft of ITM-1083 (`e51447bf`) names only `sourceStrategies`. The
     review's "only `sourceStrategies` is missing" was wrong, and so was my report of it.
   - A second draft for MOD-test-pages adds `MOD-resource-list.resourceStrategies`. It is reviewed before it goes to akmaier.
   - The page works now where another view of the page hands both. That is the same condition as at ITM-763.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9371a67e3e7b3f32d9d363774999a5f373a1d812
  - https://github.com/akmaier/agent-m/pull/837
date: 2026-10-18 02:24 UTC
---
# Development → Release testing: ITM-788, the release test of the Definition of Done

**REGISTER**

## Reason

ITM-788 (MOD-product-process, release tests), pull request #837 into `sprint/team2/87`, passes on `9371a67e`.

1. An item of release tests adds no behaviour, so its first commit need not be red.
2. CI run 39089691364 passed all twelve jobs on "Merge 9371a67e into 8130e378". The base no longer holds ITM-872.
3. Only test files changed: `tests/test_definition_of_done.py` is the loader and `tests/test_definition_of_done.md`
   holds the eight cases. This is the check file that SPEC.md names for all three requirements.
4. TST-788001, 788002 and 788003 each guard one of THE DEFAULT DEFINITION OF DONE IS THE JOB RULES, A PRODUCT DECLARES
   ITS DEFINITION OF DONE and A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS. Each names
   MOD-product-process and `level: release`, and each has counter-proofs recorded in the pull request.
   - I replayed four faults in `src/product-process/done.mjs`, in a checkout of the head merged with the base. Each
     made its tests fail: the declared conditions skipped (788002, 788003); a red head CI ignored (788001, 788003); the
     gate state ignored (788001, 788003 on both gate cases); a first commit holding code ignored (788001, 788003).
   - A fifth fault, a green head reported as red, failed every case that is all met (the mergeable counter-proof).
5. The Acceptance holds. Without a declaration, `workflow.done` is the five job rules. `check: lint` written into the
   repository's own `docs/process.md` is added as a sixth condition. One missing condition gives exactly one finding,
   and with all conditions met there is none.
   - The writer is developer-sonnet-g. By the commits' trailers, `done.mjs`, `declaration.mjs`, `gates.mjs` and
     `workflow.mjs` were written by developer-sonnet-a and developer-opus-a. No commit under `src/product-process/`
     names developer-sonnet-g; the same grep finds the seven other developer trailers there.

**Agreement 83.** I installed the Bridge packages as CI does. On the head these pass: `test_definition_of_done`
(3), the traceability release test release-sprint-02-d (8), `test_expected_results_stated` and `test_test_levels` (8).

**The gate records the test hands to doneCheck.** The test passes only the pull request's own gate records (fixture
records naming `/pull/834` for fixture pull request #834), as sprint 87 decided. I accept that reading:
- the requirement says "every gate the workflow places before the merge is recorded", meaning for the pull request;
- `gateStates` reads the newest record of a gate across the product, so another pull request's rejection would fail
  this one.

The question for akmaier stays open: which gate records a pull request's check reads. The module file says only "the
product's gate records".

**Noted, not a condition.** The case named "declared: check lint declared and missing, every job rule met without it"
declares nothing. As data it shows that a missing lint check is no finding without a declaration, but its name says
otherwise.

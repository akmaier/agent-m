---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3e90404a2ce5443311c199f683ed894081eb06ca
  - https://github.com/akmaier/agent-m/pull/820
date: 2026-10-18 00:23 UTC
---
# Development → Release testing: ITM-861, a derivation page without a token says how to store one

**REGISTER**

## Reason

ITM-861, pull request #820 into `sprint/team1/81`, at head `3e90404a`. Run 39082364569 passed every job. It changes four
lines of `src/review-pages/jobs.mjs` and adds a test file, +133/−2.

**Red, then code.** The tests-only commit `9f5895ea` was red in run 39082194988 on exactly the four new cases: without a
token, and following the step, on `spec-entry/draft` and `decision/draft`.

**The acceptance is met.**
- `showRequirementsDraft` and `showArchitectureDraft` take `context` from `where`, as `showDraft` does.
- Without a token, both pages show the step to store a token (`#add/<address>`), and the `ReferenceError` is gone.
- With one function fixed, only that page's cases pass, which is the counter-proof.

**No release-test item is needed.** No release test was changed, and the new cases are MOD-review-pages' own. The
sprint pull request's run in mode=all shows whether a release result moved, and the end gate reads it.

**Process.** A mistyped path was created by the Write tool and removed at once, so the listing before and after is the
same. It goes to the feedback.

**Finding, registered.** Any error thrown inside a page reaches the person as a read problem with the step to store a
token. This is ITM-865, read against UC-008 1a and UC-020 2a.

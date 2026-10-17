---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d9a4056800fa715eb2d6831f53d744b51c19b333
  - https://github.com/akmaier/agent-m/pull/807
date: 2026-10-17 23:02 UTC
---
# Development → Release testing: ITM-780, what a new version of the declared model changes

**REGISTER**

## Reason

ITM-780 (UC-031 6a, MOD-implementation-pages) is pull request #807 into `sprint/team2/82`, at head `d9a40568`. It
changes `src/implementation-pages/process.mjs` (+66/−4) and adds `tests/implementation-pages-model-version.test.mjs`.

**The five checks hold.**
1. The tests-only commit `9efbc870` was red in run 39077063814, on exactly TST-780001 to 780004.
2. Run 39077163170 on the head is green.
3. The change stays in the module's folder and its test file. Each new import is in the module's Uses.
4. Each of the five tests names UC-031 6a and its requirement. I replayed all five recorded counter-proofs in a checkout of
   the head, and each fails. That includes TST-780005's (the comparison always shown), the test that passed on the red
   commit.
5. For a changed model, the page shows both workflows, the difference and both lists of findings. For an unchanged model it
   shows none of them, and nothing is written.

**Readings accepted.**
- Findings are shown as `<kind>: <what>`.
- "The declaration as it would be saved" is the saved declaration with `model_version` set to the current instance commit.
  Unsaved edits are left out.
- The comparison is shown only when the model is in both catalogues and the versions differ. Neither UC-031 6a nor the
  module file asks for one when the model is missing at the declared commit.
- The class names are the developer's choice.

**Observation for the review.** If the declared commit cannot be read, `readSnapshot` fails and the route throws.

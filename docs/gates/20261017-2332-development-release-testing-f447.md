---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e3b66b0dca7e456c12911e68891f63cf6e541171
  - https://github.com/akmaier/agent-m/pull/816
date: 2026-10-17 23:32 UTC
---
# Development → Release testing: ITM-852, a job's start page reads the instance once

**REGISTER**

## Reason

ITM-852, pull request #816 into `sprint/team1/80`, at head `e3b66b0d`. It is mergeable, and run 39079147943 passed twelve of
twelve. It changes two lines of `src/review-pages/jobs.mjs` and adds two test files.

**Red, then code.** The tests-only commit `4abe529a` was red in run 39078931512 on exactly TST-852101, 102, 201 and 202, the
requirements and architecture derivations, with and without a token. The code was pushed after the run had ended.

**The acceptance is met.**
- `showRequirementsDraft` and `showArchitectureDraft` hand `sourcesOf` the instance's snapshot that `loadStage` built.
  That is the pattern of `ownSource` (`subjects.mjs:85-86`).
- **On the uc-006 harness's fixture** (a product of ten files, the instance's files), the instance's requests go from 7 to 4
  with a token and from 8 to 5 without, on both pages. The use-case page stays at 3 as the control. The known positive,
  TST-844201 and 202 at 4 and 5 on the same fixture, still passes (sprint 79's agreement).
- Counter-proofs are caught. All 60 MOD-review-pages files, release and system files among them, give the same result for
  each file on the base and the head. ITM-018 passes.

**Readings accepted.**
- "Hands it the one `loadStage` built" means the two pages that call both functions.
- `requirements-draft.mjs` and the accept click stay as ITM-848 left them.

**Process.** A mistyped path was created by the Write tool and removed at once, so the folder listing before and after
is the same. It goes to the feedback.

**Findings.**
- **A real fault:** both derivation pages call `tokenStep(context)` without `context`, so without a token they end in
  "context is not defined". This is ITM-861, registered, test first.
- `test_expected_results_stated` fails in worktrees without the Bridge build's dependencies, the known gap.

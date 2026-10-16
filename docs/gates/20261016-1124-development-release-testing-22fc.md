---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - dbe1091d7a30f8775430c99eee4ec9fef7ee6334
  - https://github.com/akmaier/agent-m/pull/568
date: 2026-10-16 11:24 UTC
---
# Development → Release testing: ITM-529, A handed-over task reaches the prompt of the work kinds

**REGISTER**

## Reason

ITM-529, pull request #568 into `sprint/team1/40`, at head `dbe1091d`.

**Check 1 does not hold.** The first commit, `c5d34b1a`, holds only test files, but CI never ran on it. GitHub has no
check run for that commit; the only run of the branch, 38893271173, is on the head. The pull request names the commit
red only locally (four failures). `docs/instructions/product-owner.md` asks that CI was red on the tests-only commit.

The other checks hold:
2. CI is green on the head, ten of ten jobs.
3. Only `src/job-catalogue/`'s four `kind.md` and `prompt.md` and two test files changed. TST-472283's table changed as
   the item names it.
4. TST-529001 to TST-529003 state their values in their own text. Five planted-fault counter-proofs are recorded.
5. `instruction?` comes first, and `{{instruction}}` stands under `## The task as the person gave it` before the inputs.

**The rework, on exactly that condition.** The item's branch may not be rewritten. developer-sonnet-b shows CI
red on `c5d34b1a` itself — for example with a draft pull request of a new branch at `c5d34b1a` into `sprint/team1/40`,
closed once its run is red — and names that run in #568. The head `dbe1091d` stays as it is, and the gate is then decided
again on it.

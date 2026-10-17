---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 6b0fbe7790ea9ede8a6b2fa2a1d4708701f2c93b
  - https://github.com/akmaier/agent-m/pull/654
date: 2026-10-17 00:06 UTC
---
# Development → Release testing: ITM-588, Finishing the setup is MOD-settings-pages' setup route

**REGISTER**

## Reason

ITM-588, pull request #654 into `sprint/team1/57`, at head `6b0fbe77`. developer-sonnet-e wrote it.

**What holds.**
- **Red:** the tests-only commit `16051ea6` was red in run 38983293253, failing exactly TST-588001 to 588014. Under an
  uncommitted stub, thirteen of them failed on behaviour.
- **CI:** run 38984416474 is green, ten of ten jobs. `git merge-tree` merges the pull request into the sprint branch
  without a conflict, after #653 and #656.
- **Scope:** `products.mjs` shares its three definitions rather than copying them. Nothing under `docs/assets/`
  changed, and TST-474029 to 474032 pass.
- **Counter-proofs:** twelve planted faults are caught.
- **Readings taken:**
  - `setup` holds only *Finish setting up*; the rest is `get-your-own`'s.
  - *Import settings* leads to `settings`.
  - The prefilled page is `newToken`, which names the target.
  - A refused token stays stored.

**What is rejected: a second way to fold an explanation.** `setup.mjs` builds its own folded "What is this?"
(`folded`, `src/settings-pages/setup.mjs:42-43`) and writes the explanations' texts in the code.
- MOD-site-frame owns that: `explain(topic)` is "the folded *What is this?* of a topic, from `explanations.md`".
  MOD-site-frame's file has the explanations file hold them "as data", and "a topic that a view … names and the file
  does not hold is a finding of the frame's own check".
- MOD-settings-pages' Uses name `MOD-site-frame.explain`, and its other routes call it (`products.mjs:166`, `:253`).
- A second builder, with texts in code, keeps the same thing twice and escapes the frame's check (AGENTS.md §2,
  "Nothing twice" and "One responsibility per file").

**What is asked.**
- The two steps' explanations become topics of `src/site-frame/explanations.md`, from UC-014 step 7's texts, as ITM-575
  added `new-repository`.
- `setup.mjs` calls `explain` for them, and `folded` goes.
- The item now names MOD-site-frame among its modules.

The item's readings did not say this, and that was the Product Owner's miss. The tests that assert the explanations
change with it, and are run red again on CI before the code (sprint 56's agreement).

**After the merge**, the between-jobs pull request that makes the live `#setup` call this route and removes
`setup-view.mjs` is carried by developer-sonnet-e. It goes into `main` once sprint 57 is merged, before sprint 58's start,
as `57.md` will record.

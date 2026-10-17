---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 6b2da2df33e905db41db7631c5173e96e9e8fb1b
  - https://github.com/akmaier/agent-m/pull/677
date: 2026-10-17 02:55 UTC
---
# Development → Release testing: ITM-578, A flagged candidate is split into entries of its own

**REGISTER**

## Reason

ITM-578, pull request #677 into `sprint/team1/62`, at head `6b2da2df`. developer-sonnet-d wrote it.

**What holds.**
- **Red:** the tests-only commit `0d39bd89` was red in run 38995792829. Node (3) failed TST-578001 and 578003 to 578007,
  and TST-578002 pins what stays.
- **CI:** run 38996508188 is green, and GitHub reports the pull request mergeable.
- **Scope:** only `candidates.mjs` and `jobs.mjs` of MOD-review-pages, and one test file.
- **Counter-proofs:** six planted faults are caught.
- **Other suites:** the UC-019 table is the same on the base and on the head, and ITM-018 passes.

**Readings taken.**
- **"Each part becomes an entry of its own" (UC-005 6a).** MOD-spec-changes' accepted `queue-entries` writes "one entry
  per section the candidates touch". So two parts of one section are two requirements of their own in that section's
  entry (TST-578005). That reading changes no text, and the use case's word "entry" is satisfied by what each part is
  written as: a requirement with its own four fields.
- **The refusals of a part without a name or a rule, or with another's name** (TST-578006, 578007). A part written so
  would break `A REQUIREMENT HAS FOUR FIELDS` and the names' uniqueness. Keeping a written requirement within the SPEC
  is the item's own concern, not an invented check.
- **The first part's rule becomes editable on *Split*.** "Keeps what it had" is its values at the split. Dividing a rule
  into two needs both to be edited.

**What is rejected, and what is asked.**
1. **A part may be lost (the lead, measured now, not later).** Splitting a `change` candidate copies its `of`, so both
   parts would change the same requirement under its name. `entrySections` replaces a change's block by that name, so
   the second could overwrite the first.
   - Measure it with a test that splits a `change` candidate and writes it.
   - If a part is lost, the second part of a split `change` is written as `new`: a requirement of its own beside the
     changed one, which is what 6a asks each part to be. Its `of` stays empty for the person.
   - The test is red on CI before that code (sprint 56's agreement).
2. **The write of an unsplit derivation changed, untested.** *Write proposals* now hands `writeResult` the draft and
   classes from `editedResult`, the panel as the person left it, where it handed the drafted `outcome.draft` before.
   - That is within the item: "writes the draft as left", and the writer's text says "as the person left them".
   - A change of behaviour needs a test of its own. Add one that changes a class and an `of` without splitting and
     shows what is written. Its counter-proof is the old line planted back.
3. **`classesFrom` (`jobs.mjs`) has no caller left.** It is this pull request's own leftover. Remove it here, after a
   grep of `src` and `tests`, including the release tests, for its name.

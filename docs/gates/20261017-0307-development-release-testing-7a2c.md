---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 45e8c9e725f20dbf8a7a608677de3a77f070b94a
  - https://github.com/akmaier/agent-m/pull/677
date: 2026-10-17 03:07 UTC
---
# Development → Release testing: ITM-578, A flagged candidate is split into entries of its own

**REGISTER**

## Reason

ITM-578, pull request #677 into `sprint/team1/62`, at head `45e8c9e7`. It is the rework of the rejection on `6b2da2df`
(`docs/gates/20261017-0255-development-release-testing-e5fc.md`). No pushed commit was rewritten.

**The three requests are met.**
1. **A split `change` loses no part.**
   - The tests-only commit `917f5b80` adds TST-578008, which splits a `change` of A LOAN HAS A DUE DATE.
   - Run 38997015437, node (3), was red on it. The totals read `# fail 1` and `# todo 0`, and the one failure is TST-578008:
     the second change replaced the first. So the lead was a real loss.
   - The fix, in `editedResult`, writes a part that would change what its candidate changes as `new`, with an empty `of`.
2. **TST-578009 tests the unsplit write with an edited class and `of`.**
   - It pins behaviour the first commit already changed, so it could not be red. That is why the request named a
     counter-proof.
   - Planting the old `outcome.draft` line back fails 009, and also 005 and 008.
3. **`classesFrom` is removed.** A grep of `src` and `tests` for its name finds one hit on the base `6b2da2df` (its own
   definition, the known positive), and none on the head.

**What else holds.**
- CI run 38997261851 is green on the head, and the pull request is mergeable.
- The scope is still `candidates.mjs`, `jobs.mjs` and the item's test file.
- Seven planted faults are caught.
- The UC-019 table is 29 of 29 on the base and on the head.
- The full local suite fails the same 30 tests as the base, and ITM-018 passes.

**The coordinator's question: the panel shows `change`, and the writer writes `new`.**

That does not fit "writes the draft as the person left it". What is written differs from what the panel shows, and the
person is not told.

It does not block this gate, for two reasons:
- Without the rewrite, a part is lost, and that is the worse error.
- The panel showing `change` follows the reading settled at the start. That reading says the second part has "the same
  class, `of`", and the item followed it.

ITM-634 is registered to make the panel and the write agree:
- On *Split*, the second part of a `change` shows `new` with an empty `of`.
- A part set to change what another part changes is refused, as a duplicate name is.
- The silent rewrite goes.

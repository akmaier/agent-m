---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 496d7fa44ea15fa6059aec4adbb1fec63d818796
  - https://github.com/akmaier/agent-m/pull/706
date: 2026-10-17 08:03 UTC
---
# Development → Release testing: ITM-576 with ITM-660, a file that is only hashed is recorded with the note where its copy is kept

**REGISTER**

## Reason

ITM-576, with ITM-660 folded in, pull request #706 into `sprint/team1/68`, at head `496d7fa4`. developer-sonnet-e wrote
it.

**Red.** The tests-only commit `0bec8721` was red in run 39015382414 (`failure` on `0bec8721`):
- node (2): `# fail 6`, `# todo 4` (existing findings), which are TST-576001 to 576006;
- node (7): `# fail 3`, which are TST-576007, 576008 and the changed TST-472755.

Nothing else failed, and no expected value changed between the red and the green.

**The code against the readings in the item.**
- The version's file table has a third column, `Kept at`: the note, or `—` for a stored file, with `|` written `\|`. The
  Files cell and `filesOf` are unchanged, as the reading after the grep stop settled.
- Both writers refuse a file not kept that has no note.
- The library form asks "Where your copy is kept". Save stays enabled, and the refusal is the module's, not a check of
  the page's own (nothing twice).
- `src/source-register/index.mjs`'s header states what holds and names no item: ITM-660, by sprint 67's agreement.

**What else holds.**
- CI is green, ten of ten in run 39015666923, and the pull request is mergeable.
- Seven planted faults are caught.
- The full suite fails the same 30 local tests on base and head.
- **The token budget:** Save's host calls are identical on base and head, so no read is added.
- The Python checks and ITM-018 pass.

**Rulings.**
1. **`NoteMissing { file }`, where the accepted text says `{ name }`, is accepted, and a one-word draft for akmaier is
   committed with this gate.**
   - The module's `failure(name, message, fields)` spreads the fields after the error's name. A field `name` would make
     `error.name` the file's name and no longer `NoteMissing`, which breaks the convention every error of the module
     keeps: its `name` is its kind.
   - The developer measured that, and carried the file as `file`, as `HashMismatch { file, … }` does in the same text.
   - So the text's own intent, that the refusal names the file, is met by the only reading that keeps its errors
     working.
   - The draft changes `NoteMissing { name }` to `NoteMissing { file }` in both places of MOD-source-register's file.
2. **The five tests changed through the shared fixture `HASHED` are accepted:** TST-472903, 472904, 472927, 472928 and
   472930.
   - The fixture gained a note, as TST-472755's setup did, and every assertion is unchanged.
   - The draft run found them, as sprint 64's agreement intends.
   - My readings named the files, not these cases, and that is the start's gap.
3. **The rebase was of an unpushed commit**, and no pushed commit was rewritten. It stands.

**Findings** (sprint 63's agreement):
- **A note with a line break is written raw**, and its row then spans two lines. This is registered as ITM-663.
- ***+ New version* does not ask for the note yet**, though `versionCommits` refuses without one. That page is ITM-591's,
  which now carries this.

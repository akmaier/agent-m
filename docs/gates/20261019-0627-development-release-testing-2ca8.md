---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 0ee4ac159ced674a89fb87954e89d427148c4fcc
  - https://github.com/akmaier/agent-m/pull/956
date: 2026-10-19 06:27 UTC
---
# Development → Release testing: ITM-954, the recipes mail-batch and reply-inputs, and the writer mail-drafts

**REGISTER**

## Reason

ITM-954, pull request #956 into `sprint/team2/95`, passes on `0ee4ac15`. That head is a plain merge of `4f30de5f` with
the sprint head `705b34dc`, and its tree equals their automatic merge. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** The tests-only commit `b63d305a` fails TST-954001 to TST-954009 (run 39207850579). The condition's
   tests-only commit `a6d377e8` is red too (run 39209076836).
2. **Scope.** Only `src/mail-handling/index.mjs`, the new `strategies.mjs` and `tests/mail-handling-strategies.test.mjs`
   changed.
3. **The pre-gate's condition holds** (comment on #956, on `8fc3d2f0`).
   - `mail-batch` puts the people of all chosen mails into `context.params.people` as one People, where the built
     `people-search` reads them.
   - Replayed: on a draft naming the mail's person, `people-search` now finds 2 hits; it found 0 before.
   - With that line removed, TST-954002 and TST-954010 fail. TST-954011 is the counter-proof.
   - The mail-handling and personal-data tests pass, 108 of 108.
4. **The accepted text.** The item quotes MOD-mail-handling at `be10efd1`, and the current accepted blob is `6cd79c5f`. In
   the item's part, only `reply-inputs` changed: it gained the optional `question` (draft `48002942`). The item builds
   without `question`, which is a later item's (NEW-039-4). The readings accepted at the pre-gate stand:
   - the parameter shapes;
   - "Release: not known" for null;
   - registration left to the program's composition.
5. **The reading.** developer-sonnet-h read SPEC.md and the four chapters for this round, and named a passage of each.

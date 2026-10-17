---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2b677bc16c094c626e9c1fa5895aeef026bd31d2
  - https://github.com/akmaier/agent-m/pull/722
date: 2026-10-17 11:05 UTC
---
# Development → Release testing: ITM-611, A section edit's fallback pages say which file changed since the edit began

**REGISTER**

## Reason

ITM-611, pull request #722 into `sprint/team1/71`, at head `2b677bc1`. It is the rework of the rejection on `ebd0be44`
(`docs/gates/20261017-1052-development-release-testing-2e7f.md`). `ebd0be44` is an ancestor of the head, so nothing was
rewritten.

**The red of the rework.** The tests-only commit `454fd1ff` was red in run 39026756876, with 8 failures against
`ebd0be44`'s code:
- TST-611009, 610 and 611, changed to the counts asked;
- TST-611012 to 611016, new, for an edit opened on the current head and for `null`, in both functions.

TST-611006 to 611008 now move the default branch before the click, so the path for an earlier commit is still reached,
and they stay green.

**The four requests are met.** `pathsWhenOpened` (`propose.mjs`) is shared by both functions, as I read it in the diff:
- for `openedHead` `null`, it reads nothing, and every file is not existing;
- for `openedHead` equal to `snapshot.commit`, it uses that snapshot's paths;
- otherwise, it reads the snapshot at `openedHead`.

**The requests per click without a token**, as the committed tests pin them:

| Click | Opened on the current head | Opened earlier | `null` |
|---|---|---|---|
| `proposeSection` | 7, the base's | 9 | 7 |
| `saveEntry` | 9, the base's | 11 | 9 |

With a token they stay 13 and 15. The common case costs what it cost before the item, and the two more requests fall
only on an edit opened before the head moved.

**What else holds.**
- CI is green, ten of ten in run 39027161365, and the pull request is mergeable.
- Four planted faults are caught.
- The UC-019 table gives the same 29 receipts.
- The draft run has the base's 30 local failures, and ITM-018 passes.
- The rulings of the rejection on the unnamed tests and the reading of `differs` stand.

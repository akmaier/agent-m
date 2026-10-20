---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - db039164e1917c214b5ed4056dd29bc6608bbd22
  - https://github.com/akmaier/agent-m/pull/1235
date: 2026-10-20 20:22 UTC
---
# Release testing → Sprint review: sprint team1/101

**REGISTER**

## Reason

Sprint team1/101, pull request #1235 of `sprint/team1/101` into `main`, on head `db039164`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-733 | #1234 | `c7cb81a1` |
| ITM-932 | #1232 | `9d43302e` |
| ITM-736 | #1231 | `ae0851e6` |
| ITM-1129 | #1233 | `4b039110` |

- The first-parent line from `1850c3f9` is these four merges and no direct commit.
- `git show --cc` prints nothing for any of them.
- **The unfinished items are in 101.md:**
  - ITM-1160 waits for `04132d07`;
  - ITM-767 left for its drafts `be70bf16` and `c496dedf`;
  - ITM-649 waits for `d6d24cbe`.

**The release tests.** Run 39490907763 ran on `db039164` as a pull request into `main` and passed all twenty-three jobs on
its first attempt.
- **The sixteen node logs** (`end101/<job>.log`) each end with `# fail 0` and `# cancelled 0`: 5,501 tests and 53
  todos.
  - These are the 54 of sprint 100's end gate, but one.
  - TST-513027, "alternative 4a: a hand-over of a change of requirements runs …", is no longer a todo, and passes
    (ITM-1129).
- **The seven python logs** each end with `OK`: 612 tests, with the one known expected failure of `test_verbatim`.
  `test_conversation_not_recorded` and TST-1056101 pass.
- **Every job ends within two minutes.** The longest is node (5), at 88 s.

---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2117d74e58b1e066050bb09aab422314ddb8bc79
  - https://github.com/akmaier/agent-m/pull/1263
date: 2026-10-20 23:31 UTC
---
# Release testing → Sprint review: sprint team1/102

**REGISTER**

## Reason

Sprint team1/102, pull request #1263 of `sprint/team1/102` into `main`, on head `2117d74e`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-667 | #1247 | `1bc50422` |
| ITM-769 | #1250 | `9223ab3b` |
| ITM-768 | #1248 | `0c3cbba5` |
| ITM-658 | #1249 | `24bd6b06` |
| ITM-1160 | #1259 | `b1b1ad22` |
| ITM-767 | #1262 | `31c7de0b` |
| ITM-649 | #1261 | `c4b5d51e` |

- The first-parent line from `f8a117bb` is these seven merges and no direct commit.
- `git show --cc` prints nothing for any of them.
- **Unfinished:** none of the selection. ITM-919 left the sprint for its draft `3ef0fce2`, as 102.md records.

**The release tests.** Run 39515041103 ran on `2117d74e` as a pull request into `main` and passed all twenty-three jobs
on its first attempt.
- **The sixteen node logs** (`end102/<job>.log`) each end with `# fail 0` and `# cancelled 0`: 5,662 tests and 53
  todos, as many todos as at sprint 101's end gate.
  - The five release tests that ITM-649's first head broke pass: TST-375101, 965201, 969201, 1041101 and 513201.
  - ITM-018's traceability cases pass in node (9), `ok 174` to `ok 181`.
  - One case is skipped, the real Linux build of the Bridge, which only the overnight runs start.
- **The seven python logs** each end with `OK`: 612 tests, with the one known expected failure of `test_verbatim`.
  `test_conversation_not_recorded` passes.
- **Every job ends within two minutes.** The longest is node (6), at 78 s.

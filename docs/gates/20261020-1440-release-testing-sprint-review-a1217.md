---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 04abad61072d76a205ecaf54d6bf4697ca3e54a3
  - https://github.com/akmaier/agent-m/pull/1217
date: 2026-10-20 14:40 UTC
---
# Release testing → Sprint review: sprint team1/98

**REGISTER**

## Reason

Sprint team1/98, pull request #1217 of `sprint/team1/98` into `main`, on head `04abad61`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-1155 | #1210 | `621fb0cf` |
| ITM-1156 | #1211 | `36564744` |
| ITM-1110 | #1214 | `2e900d1c` |
| ITM-1116 | #1215 | `92fb59ae` |
| ITM-1142 | #1216 | `edcb27e3` |
| ITM-1154 | #1213 | `bed5d284` |

- The first-parent line from `70025189` is these six merges and no direct commit.
- `git show --cc` prints nothing for any of them.
- ITM-1114 and ITM-1098 are done with no code, as 98.md records.
- The unfinished item, ITM-1129, is in 98.md, waiting for its draft.

**The release tests.** Run 39440821356 ran on `04abad61` as a pull request into `main` and passed all twenty-three jobs.
- **The sixteen node logs** (`end98/<job>.log`) each end with `# fail 0` and `# cancelled 0`: 5,429 tests and 52 todos.
  The todos are the same 52 as at sprint 97's end gate. One test is skipped, the real Linux build of `buildPlatform`.
- **The seven python logs** each end with `OK`: 612 tests.
  - The one expected failure is the known one of `test_verbatim`.
  - TST-1130013 is no longer an expected failure, and it passes (ITM-1154).
- **Every job ends within two minutes.** The longest is node (15), at 64 s.

---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - df492f2cb9f06053dee897dd1690496dcb68d901
  - https://github.com/akmaier/agent-m/pull/1208
date: 2026-10-20 13:17 UTC
---
# Release testing → Sprint review: sprint team1/97

**REGISTER**

## Reason

Sprint team1/97, pull request #1208 of `sprint/team1/97` into `main`, on head `df492f2c`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-657 | #1193 | `26b8177a` |
| ITM-1131 | #1196 | `ba3d1bfe` |
| ITM-1076 | #1195 | `7d2a1aa9` |
| ITM-1079 | #1194 | `bac899a9` |
| ITM-1139 | #1197 | `de03dbb3` |
| ITM-1115 | #1198 | `78748a06` |
| the release test of *Send* | #1199 | `a05d5231` |
| ITM-1143 | #1200 | `1208e9f2` |
| ITM-1120 | #1201 | `89176575` |
| ITM-1121 | #1203 | `deb60e15` |
| ITM-1117 | #1202 | `e16163c6` |
| the plan tests after #1202 | #1206 | `be93dde6` |
| ITM-1118 | #1204 | `b9e9e284` |
| ITM-1119 | #1207 | `2e6b93ee` |
| ITM-1157 | #1209 | `473ef621` |

- The first-parent line from `1d9cd123` is these fifteen merges and no direct commit.
- `git show --cc` prints nothing for any of them.
- **#1199's record:** the merge `614e664d` names the record of #1197 in its body. #1199's record is
  `docs/gates/20261020-1207-development-release-testing-a1199.md` (`bda606a0`), and the merge is its gated head.
- The unfinished items, ITM-1153, ITM-1154, ITM-1129, ITM-1155 and ITM-1156, are in 97.md, each with its draft.

**The release tests.** Run 39428520770 ran on `df492f2c` as a pull request into `main` and passed all twenty-three jobs.
- **The first run stopped python (2) at its limit,** run 39423540794 and its rerun. ITM-1157 split the python tests into
  seven shards.
- **The sixteen node logs** (`end97/<job>.log`) each end with `# fail 0` and `# cancelled 0`: 5,399 tests and 52 todos.
  - 47 todos are the known findings of sprint 96's end gate.
  - The new ones came from `main` with team 2's sprints: TST-905117 (#mail), TST-905120 (#replies), TST-1041110 and
    TST-965202.
  - TST-513027 is ITM-1129's finding, which waits for its draft.
- **The seven python logs** each end with `OK`: 612 tests, with two expected failures:
  - the known one of `test_verbatim`;
  - TST-1130013, whose decorator goes with ITM-1154.
- **The release tests this sprint changed pass:**
  - `ok 124 - release · ITM-129 UC-024 …`;
  - `test_conversation_not_recorded` and `test_no_secret_written`, every case `ok`.
- **Every job ends within two minutes.** The longest node job, node (8), took 82 s, and the longest python job,
  python (6), 59 s.

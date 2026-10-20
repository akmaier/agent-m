---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4b29ab2827cbfaeb408ad2d3e6304b3059d00e82
  - https://github.com/akmaier/agent-m/pull/1223
date: 2026-10-20 16:43 UTC
---
# Release testing → Sprint review: sprint team1/99

**REGISTER**

## Reason

Sprint team1/99, pull request #1223 of `sprint/team1/99` into `main`, on head `4b29ab28`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-737 | #1218 | `cc1c007c` |
| ITM-789 | #1220 | `5357c95a` |
| ITM-1149 | #1221 | `00fb4b5f` |
| ITM-1068 | #1219 | `921d7e9f` |
| ITM-595 | #1222 | `1bae9aee` |

- The first-parent line from `24f28d90` is these five merges and no direct commit.
- `git show --cc` prints nothing for any of them.
- #1219 carries `main` at `197060d8`, merged in on its branch. Its gate checked that this brings nothing but `main`'s own
  content.
- ITM-1158 is done with no code.
- ITM-1129 stays outside the sprint until team 2's ITM-842 reaches `main`.

**The release tests.** Run 39459556652 ran on `4b29ab28` as a pull request into `main` and passed all twenty-three jobs.
- **The sixteen node logs** (`end99/<job>.log`) each end with `# fail 0` and `# cancelled 0`: 5,456 tests and 52 todos,
  the same 52 as at sprint 98's end gate.
- **The seven python logs** each end with `OK`: 612 tests, with the one known expected failure of `test_verbatim`.
- **The release tests this sprint changed pass:** `release-sprint-15-spec-toggles`, changed by developer-sonnet-d for
  ITM-595: `ok 132 - the release dashboard toggles current requirements without writes …`.
- **Every job ends within two minutes.** The longest is node (8), at 78 s.

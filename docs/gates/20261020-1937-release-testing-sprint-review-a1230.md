---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b8e2d6b8b1ea43d39f16c6c942b3d68ac62b68b8
  - https://github.com/akmaier/agent-m/pull/1230
date: 2026-10-20 19:37 UTC
---
# Release testing → Sprint review: sprint team1/100

**REGISTER**

## Reason

Sprint team1/100, pull request #1230 of `sprint/team1/100` into `main`, on head `b8e2d6b8`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-732 | #1226 | `f082a790` |
| ITM-783 | #1224 | `752d1a5f` |
| ITM-784 | #1227 | `9b4fa2be` |
| ITM-721 | #1225 | `7ee4744b` |
| ITM-596 | #1228 | `924aee0e` |

- The first-parent line from `1db2ada7` is these five merges and no direct commit.
- `git show --cc` prints nothing for any of them.
- ITM-649 left the selection for its draft (`d6d24cbe`). ITM-1129 waits until team 2's ITM-842 reaches `main`.

**The release tests.** Run 39484402761 ran on `b8e2d6b8` as a pull request into `main`.
- **One job failed on the first attempt:** python (5), job 118840956844, `FAILED (failures=1)`. The failing test was
  TST-1056101 of `tests/test_bridge_settings.py` (MOD-desktop-shell, level `release`), one boolean differing in the
  settings read back.
  - The sprint changes neither MOD-desktop-shell nor the Bridge.
  - The same test passed at sprint 99's end gate, and on the job's rerun (attempt 2, job 118842017918), `OK`.
  - It is recorded here as its first sighting. If it repeats, it is registered.
- **After the rerun, all twenty-three jobs pass:**
  - **The sixteen node logs** (`end100/<job>.log`) each end with `# fail 0` and `# cancelled 0`: 5,485 tests and 54
    todos. Those are the 52 of sprint 99's end gate and the two width findings of `#arc` and `#module`, which name
    ITM-1159.
  - **The seven python logs** each end with `OK`: 612 tests, with the one known expected failure of `test_verbatim`.
- **Every job ends within two minutes.** The longest is node (5), at 80 s.

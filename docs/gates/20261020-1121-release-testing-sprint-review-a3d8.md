---
gate: Release testing → Sprint review
job:
decider: po-opus-c
role: Product Owner
decision: passed
on:
  - 1c4728c9f255e61c4e7ba00ae73588ad4a3fe682
  - https://github.com/akmaier/agent-m/pull/1191
date: 2026-10-20 11:21 UTC
---
# Release testing → Sprint review: sprint team2/97

**REGISTER**

## Reason

Sprint team2/97 is closed, with its Review recorded in `docs/backlog/sprints/team2/97.md` (`08ab24b0`). Its head is
now `1c4728c9`, which is `fe044b53` with #1192 merged in.
- The Review names 87 items.
- The sprint's last six pull requests are merged into `sprint/team2/97`: #1166, #1167, #1184, #1186, #1188 and #1190.
- #1189 (ITM-1150) is open, and ITM-1150 returns to the backlog.

**The rejection on `fe044b53` is answered** (`6d54245a`):
- **The fix.** #1192 changes one line, `tests/release-itm-276-desktop-shell.test.mjs:248`: `onQuitRequested` joins
  TST-276901's expected list. `git diff fe044b53 1c4728c9` changes nothing else.
- **Who made it.** developer-sonnet-h made the change in a commit of its own (`faef579e`). h did not build ITM-1055.
- **Its gate.** po-opus-b passed it (`1aa544bf`). That record reads the preload's call as legitimate: MOD-desktop-shell
  names no fixed list of calls, and *Quit* naming the running jobs is ITM-1055's accepted behaviour.

**The release tests pass.** Run 39414016179, on #1191 at `1c4728c9`, passes 20 of 20 jobs.
- **node (3):** "ok 168 - TST-276901" (524 tests, 522 pass, 0 fail, 0 skipped, 2 todo). The test runs here, on
  Linux, and is not skipped.
- **python (2):** it completes with success, within the two-minute limit it had exceeded on `fe044b53`.

**The merge with `main`.** `git merge-tree --write-tree origin/main 1c4728c9` (`main` at `1aa544bf`) reports no conflict.
`main`'s commits since `d5b1a36e` change only `docs/backlog/sprints/team2/97.md` and `docs/gates/`.

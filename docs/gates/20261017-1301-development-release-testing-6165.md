---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d0c33d20804aa0a04fd53365ac9882865964d1db
  - https://github.com/akmaier/agent-m/pull/728
date: 2026-10-17 13:01 UTC
---
# Development → Release testing: ITM-574, a dashboard page loads with a bounded number of requests

**REGISTER**

## Reason

ITM-574, pull request #728 into `sprint/team1/72`, at head `d0c33d20`. That head is the merge of #729 into the item branch,
after the rejection on `cb51c796` (`docs/gates/20261017-1239-development-release-testing-eb82.md`). Its checks passed:
node 0 to 7 and python 0 to 1. The rework changes 17 files, +51/−61.

**The three points of the rejection are met.**
1. **The second reader of the declaration is gone.** `git grep model_file` finds nothing in
   `src/site-frame/dashboard-app.mjs`. backlog-view reads the model in one request of its own.
   - The `#backlog` case of `load-per-view.test.mjs` was corrected first, in `51809178`. It was red in run 39033985293:
     its one failure is that case, and the todo is `#spec`'s case naming ITM-680.
   - The case now expects `commit`, `tree`, `batch 7` and `file docs/process-models/fixture.md`.
2. **Every test the item changes names a module of the architecture in its header.** Each `Module:` line was checked on
   the head against the module files; `app-harness.mjs`, already naming MOD-site-frame, is the known positive.
   - The twelve tests and helpers (`helpers.mjs` and `test_no_backend.py` now have the line) name the module that takes
     them over.
   - The two release files name MOD-site-frame. #729 made that change, by a participant who builds none of ITM-574.
3. **The tests import `APP_FILE`** where they used the path: architecture-view and dashboard-shell. The other two named
   it only in a comment, which now names `APP_FILE` (`72.md`, 12:58 UTC).

**Measured again, with a script written whole.** On this repository's 4433 files, with a token, the start page is
known to be 3, and it held. The counts:

| Page | Before ITM-574 | Now |
|---|---|---|
| start page | 51 | 3 |
| `#arc` | 74 | 3 |
| `#spec` | 125 | 15 |
| `#backlog` | 691 | 11 |

- `#backlog`'s 11 are: the commit, the tree, 7 batches holding 687 files, one read of the process model, and the pull
  requests.
- `#spec`'s 15 include 3 commits, 3 trees and 4 single reads through the trace route's own hosts, which is ITM-680.

**Whole files on the head** (sprint 70's agreement):

| File | Pass | Todo |
|---|---|---|
| release-sprint-01 | 34 | 2 |
| release-sprint-02-a | 17 | 2 |
| release-uc-003 | 6 | 0 |
| load-per-view | 14 | 1, ITM-680 |

No other expected value changed. ITM-018 passes, and the fetch spy saw no network.

**Process.**
- The re-measurement split no path, and nothing refused it. The old script's split goes to the retrospective, as `72.md`
  says.
- The brief says to write scratch files with the shell, and the order said to use the Write tool for this one script.
  The order applied to that file only. The brief stands.

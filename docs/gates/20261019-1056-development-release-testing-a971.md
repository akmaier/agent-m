---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a8e5cdead741c088fc718dfeba4321b68e9a1755
  - https://github.com/akmaier/agent-m/pull/1020
date: 2026-10-19 10:56 UTC
---
# Development → Release testing: ITM-971, passed — a job's page shows its inputs, its log, its cost and the gate it waits at

**REGISTER**

## Reason

ITM-971 (MOD-main-page), pull request #1020 into `sprint/team1/93`, passes on `a8e5cdea`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `d6061f44` holds only tests, with additions to the page's test harness.
  - `a8e5cdea` holds the code: `src/main-page/` only.
- **The red,** run 39240114973, each job with `# cancelled 0`:
  - `# fail 8`: TST-971001 to 008;
  - `# fail 1`: TST-827001;
  - `# fail 1`: TST-509007.
  The last two change their route lists to include `job`, as this item's output.
- **The Acceptance holds:**
  - the inputs shown;
  - a Bridge job's log grows as it streams;
  - a CI job's log is a link, and a gone log says so;
  - usage without a price shows *price unknown* and no amount;
  - a waiting job names its gate and decider.
- **The readings stand:**
  - Only a `check:` decider is shown as deciding by itself.
  - The cost is the ledger's row cost.
  - Commits, pull request, CI runs, the gate's decisions, *Cancel* and *Retry* are other items', ITM-972 and ITM-974 among
    them.
- **CI:** run 39240475248 passed 20 of 20 on its second attempt. The first failed only TST-938007, a stand-in window test
  this item does not touch. ITM-1020 is about that kind of test under CI's load.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`b66bdec1`) is clean.
- **Replayed in a clean worktree at the head:**
  - `main-page-job`, `main-page-home` and `main-page-jobs` pass 60 of 60.
  - Counter-proof: with an unknown cost written as "0", exactly TST-971005 fails.

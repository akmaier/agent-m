---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 4788c5ce59b3c437a554c8fdfa0c8412c2089fa0
  - https://github.com/akmaier/agent-m/pull/1009
date: 2026-10-19 10:22 UTC
---
# Development → Release testing: ITM-970, rejected — a cancelling job stands last, where the code says it stands within running

**REGISTER**

## Reason

ITM-970 (MOD-main-page), pull request #1009 into `sprint/team1/93`, is rejected on `4788c5ce`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-b`.
- The red is `49de723b`, run 39235737209, node (0): `# fail 3`, exactly TST-970001 to 003, with `# todo 0` and
  `# cancelled 0`.
- The list groups by state with *Waiting at a gate* first and the newest first within a group (UC-036 step 2). Filters
  narrow every group, and this tab's job leads the running group.
- CI passed 20 of 20, and `git merge-tree --write-tree` onto `sprint/team1/93` (`c80a4a5f`) is clean.

**What fails.**
- **The comment.** `src/main-page/jobs.mjs:100` says "`cancelling` is shown within running", and the pull request reads it so.
- **The code.** `GROUPS` (`:101`) does not hold `cancelling`, a state of MOD-job-ledger's `JobState`
  (MOD-job-ledger.md:156). So `place` puts a cancelling job after *ended without record*, under a header of its own.
- **The tests.** None has a cancelling job, so none sees it.

**What passes on the next head.**
- A cancelling job stands within the running group, as the code's comment and the reading say.
- A test shows it, with a counter-proof.

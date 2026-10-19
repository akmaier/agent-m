---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 75440e43e7ab35d64c79b987aeae95afb91737a7
  - https://github.com/akmaier/agent-m/pull/1043
date: 2026-10-19 12:11 UTC
---
# Development → Release testing: ITM-801, passed — a person passes or rejects a gate on the job's page

**REGISTER**

## Reason

ITM-801 (MOD-main-page, and MOD-site-frame for `tokenKeyOf`), pull request #1043 into `sprint/team1/93`, passes on
`75440e43`.

- **Five commits, all with the trailer `developer-sonnet-c`.**
  - `4de6233a` holds only tests.
  - `ab3b1300` holds the code. It includes the `tokenKeyOf` export of `src/site-frame/index.mjs`, as akmaier accepted it at
    `abcd6af5`.
  - `4ed30fda` merges `sprint/team1/93`. Its resolution is read below.
  - `68cb0cea` holds only tests: TST-801002 and 003 wait in real time instead of counting turns of the event loop. The code
    is unchanged.
  - `75440e43` merges `1f8365bd`, with an empty `git show --cc`.
- **The resolution of `4ed30fda`.** `git show --cc` holds `src/main-page/jobs.mjs` only.
  - It keeps the sprint branch's file, with ITM-974's *Retry*.
  - It inserts this item's gate block, with its imports.
  - It names the item's failure text `gateFailure`, since *Retry* already defines `decisionFailure`.
  - The replay below shows both items' tests pass together.
- **The red,** run 39248506831, job 118046246202: `# fail 4`, `# todo 0`, `# cancelled 0`, exactly TST-801001 to 004.
- **The code meets MOD-main-page.md:121-123** ("for a person who may decide it, *Pass gate*" and *Reject*, through `mayDecide`
  and `recordGateDecision`).
- **The readings stand:**
  - the person is the one the stored token names, through `tokenKeyOf`;
  - the participant whose work is checked is the job's;
  - `on` is the job's inputs, else the head;
  - a gate a CI check decides gets no buttons.
- **CI:** 20 of 20 checks passed on the head (run 39249797870).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`bc901c55`) is clean.
- **Replayed in a clean worktree at the head:**
  - `main-page-job-gate`, `-job-retry`, `-jobs`, `-job` and `-job-cancel` pass 35 of 35.
  - Counter-proof: without the gate block on the page, exactly the 4 gate tests fail, and the retry tests still pass.

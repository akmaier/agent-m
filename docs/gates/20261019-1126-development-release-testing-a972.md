---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b700f96b12bb9ae946c427eedc5739ed279f3feb
  - https://github.com/akmaier/agent-m/pull/1030
date: 2026-10-19 11:26 UTC
---
# Development → Release testing: ITM-972, passed — Cancel on a job's page, and the job shown as cancelling until its runtime confirms

**REGISTER**

## Reason

ITM-972 (MOD-main-page, and MOD-site-frame for its topic), pull request #1030 into `sprint/team1/93`, passes on `b700f96b`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `64b0bcb5` holds only tests: the new `tests/main-page-job-cancel.test.mjs`, and the explanations test expecting eight
    states.
  - `b700f96b` holds the code: `src/main-page/jobs.mjs` and the topic `job-state-cancelling` in
    `src/site-frame/explanations.md`.
- **The red,** run 39243859478, each job with `# cancelled 0`:
  - `# fail 5`: TST-972001 to 005;
  - `# fail 1`: the eight states' explanations.
- **The code meets MOD-runtimes.md:203-207 and UC-036 6a.**
  - *Cancel* is offered for a queued, running or waiting job, and a confirmed click calls `cancelJob` once.
  - A confirmed cancel shows the job cancelled from its record.
  - An unconfirmed one shows it cancelling, appends nothing, and reads the job again.
  - In the list, a cancelling job stands within the running group with its explanation. That is what ITM-970 and ITM-975
    left to this item, and MOD-job-ledger.md:157 says it.
- **The reading of the cancelling state stands.**
  - `liveState` reports no `cancelling` today, and the texts name no runtime report of it. So the page keeps the jobs it
    asked to cancel in memory, for as long as their runtime still lists them.
  - SPEC.md:1787-1789 asks that a dashboard "stores" no status of its own. Memory that ends with the page is not stored, and
    after a reload the job's state is again what its record and runtime give.
- **CI:** 20 of 20 checks passed on the head (run 39244186362).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`e00d991b`) is clean.
- **Replayed in a clean worktree at the head:**
  - `main-page-job-cancel`, `main-page-jobs-explanations`, `main-page-jobs` and `main-page-job` pass 28 of 28.
  - Counter-proof: with `64b0bcb5`'s `jobs.mjs`, TST-972001 to 005 fail.

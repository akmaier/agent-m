---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e1bf473145f305a45b57ca30b550c96ee32d8b03
  - https://github.com/akmaier/agent-m/pull/1041
date: 2026-10-19 11:59 UTC
---
# Development → Release testing: ITM-974, passed — Retry on a job's page, for a failed, cancelled or ended job

**REGISTER**

## Reason

ITM-974 (MOD-main-page), pull request #1041 into `sprint/team1/93`, passes on `e1bf4731`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-c`.**
  - `965af113` and `ccca3382` hold only tests.
  - `e1bf4731` holds the code: `src/main-page/jobs.mjs`.
- **The red,** run 39247590521 on `ccca3382`, each job with `# cancelled 0`:
  - `# fail 5`: TST-974001 to 005;
  - `# fail 1`: TST-971008, which now expects the route's subject.
- **The code meets MOD-main-page as akmaier accepted it at `4383565c`, and the rulings of 93.md.**
  - *Retry* is offered for a failed, cancelled or ended job.
  - It reads `productFacts` with the scope `work`, then `startable` for each holder. It offers those it admits with their
    routes, the job's own participant first.
  - Where none may start the item, it shows the reasons and queues nothing (UC-036 7a).
  - A tab job, or one whose task travelled with its hand-over, opens the prompt bar through the job route's `subject`, with
    the kind and parameters.
- **The readings stand:**
  - a reason that names the retried job itself does not count against the retry;
  - the parameters are held in memory;
  - the button reads "Retry the job".
- **CI:** run 39247999294 passed on the head, 20 of 20.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`59642136`) is clean.
- **Replayed in a clean worktree at the head:**
  - `main-page-job-retry`, `main-page-job` and `main-page-jobs` pass 26 of 26.
  - Counter-proof: with `ccca3382`'s `jobs.mjs`, the 5 retry tests fail.

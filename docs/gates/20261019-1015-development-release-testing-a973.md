---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8565675a50bd7c3509e1e001a9ed94491dedcd9b
  - https://github.com/akmaier/agent-m/pull/1006
date: 2026-10-19 10:15 UTC
---
# Development → Release testing: ITM-973, passed — retryJob queues a new job that names the one it retries

**REGISTER**

## Reason

ITM-973 (MOD-runtimes), pull request #1006 into `sprint/team1/93`, passes on `8565675a`. It was rejected on `7a459f82`
(20261019-1010).

- **Commits:** `8565675a` sits on `7a459f82` with one parent and the trailer `developer-sonnet-c`. Nothing is rewritten.
  The red stands as recorded at the rejection.
- **The rejection's cause is gone.**
  - `retry.mjs` no longer checks capabilities, refuses with `NotHolderOfRole`, or imports `kindOf` and `eligible`. A search
    for them finds nothing, where at `7a459f82` it found all three.
  - The test of `NotHolderOfRole` and its fixture are removed.
  - `retryJob` refuses only `TaskNotInRecord` and what `queueJob` and the host refuse (MOD-runtimes.md:220-224).
- **CI:** run 39235722248 passed on the head, 20 of 20.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`b24eee6b`) is clean.
- **Replayed in a clean worktree at the head:**
  - `tests/runtimes-retry.test.mjs` passes 4 of 4.
  - Counter-proof: without the hand-over check, exactly "a job whose task travelled with its hand-over is not retried
    here" fails.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 11592906158f71517d940a10ddaec8f6ee62afa1
  - https://github.com/akmaier/agent-m/pull/1072
date: 2026-10-19 13:42 UTC
---
# Development → Release testing: ITM-850, the schedule page shows an unregistered self-hosted runner

**REGISTER**

## Reason

ITM-850, pull request #1072 into `sprint/team2/96`, passes on `11592906`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `1de7b146` holds only the tests, and CI failed on it.
2. **Scope.** Only `src/test-pages/schedule.mjs` and `tests/test-pages-schedule.test.mjs` change.
3. **The accepted text.** MOD-test-pages.md:108-110 asks, for a row on a self-hosted runner, for:
   - the server's runner page;
   - the label the runner must carry;
   - a folded explanation;
   - the row's runs shown as queued.
   The page shows each, with `webLinks().runners`. Counter-proofs: F1 to F7. Run here: 14 of 14 pass; with the runner page
   removed, 2 fail.
4. **Readings accepted, with their limit named.**
   - No runner state is read, so "online" shows only as runs leaving `queued`.
   - `CiRun` (MOD-repository-hosts.md:135-136) has no runner or label, so every queued run of the default branch is
     listed under each self-hosted row, as runs that wait for a runner. That is what the accepted interface allows. The
     row's own runs need a text change, registered as ITM-1081, which waits for team 1's pending drafts on
     MOD-repository-hosts.

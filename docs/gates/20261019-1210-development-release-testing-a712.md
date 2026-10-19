---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - cc82e44bb858f592920c41def7893288f8cda389
  - https://github.com/akmaier/agent-m/pull/1046
date: 2026-10-19 12:10 UTC
---
# Development → Release testing: ITM-712, passed — the fakes of the batch request answer as GitHub does

**REGISTER**

## Reason

ITM-712 (MOD-repository-hosts), pull request #1046 into `sprint/team1/93`, passes on `cc82e44b`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `4591b859` adds `tests/repository-hosts-batch-fake.test.mjs` and makes four tests import the shared fake. Two of them
    are component tests of MOD-spec-changes.
  - `cc82e44b` adds the fake, `tests/repository-hosts-batch-fake.mjs`, whose header names MOD-repository-hosts.
  - No product code changes.
- **The red,** run 39249310110: five jobs each with `# fail 1` and `# cancelled 0`. Each fails on its file, on the missing
  helper. As read at ITM-960's gate, a file that fails as a whole is a red run (SPEC.md:1426-1427).
- **The fake answers GitHub's batch request by the commit before the first colon.** It gives a blob or `null`, and
  `NOT_FOUND` for an unknown repository.
- **The survey of the other 14 fakes** is a comment on the pull request. The eight that ignore the commit wait for their
  modules' own items.
- **CI:** run 39249560711 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`bc901c55`) is clean.
- **Replayed in a clean worktree at the head:**
  - The five files pass 23 of 23.
  - Counter-proof: with the expression split at the last colon, 2 tests of the fake fail.

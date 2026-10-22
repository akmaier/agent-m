---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c3f8abbdb6a10edb3fd40b9ca734852c695bda7f
  - https://github.com/akmaier/agent-m/pull/1301
date: 2026-10-22 20:07 UTC
---
# Development → Release testing: ITM-796, the resolved merge with ITM-795

**REGISTER**

## Reason

#1301 passed on `dbf6f726` (`docs/gates/20261022-1958-development-release-testing-1232.md`). Its head is now `c3f8abbd`,
which merges `sprint/team2/103` with #1302 (ITM-795) and #1303. It passes again: the merge changes neither item's gated
behaviour.

1. **What the merge changes.**
   - Against the sprint branch (`bba81f04`), the head differs only in ITM-796's three files: `index.mjs`,
     `measures.mjs` and `tests/progress-measures-flow.test.mjs`.
   - Against ITM-796's gated head (`dbf6f726`), the head differs only by the sprint branch's content and by two lines
     of the fixture `V_MODEL`.
2. **`progressIn`'s order** (`measures.mjs`, `export function progressIn`).
   - A planned model returns first, with `planned: plannedProgress(facts, model)` and `flow: null`. That is ITM-795's
     gated path, unchanged.
   - Every other model then gets `flow` from `flowOf`, which is null without a numeric `wip`. A model with sprints
     returns its sprints and the same `flow`. That is ITM-796's gated path, unchanged.
3. **The fixture.** `V_MODEL` gains `phases: [], transitions: [], gates: []`, because a planned model now reaches
   `plannedProgress`. TST-796005's assertion is unchanged: `progressIn(FACTS({ model: V_MODEL }), NOW).flow` is null.
   ITM-795's own test file is unchanged.
4. **Runs.**
   - 99 of 99 `tests/progress-measures*.test.mjs` pass on the head, on this machine.
   - CI: the first run was 23 of 24. node (11) was cancelled after 2:46 (job 120056351279). Its full log shows a
     failure and a hang in TST-961005, not this item's; see below. The full rerun, run 39845096788, is green on 24 of
     24; node (11) took 54 s, and the slowest node shard 88 s.
5. **Release runs on the head, by this gate:**
   - traceability 8 of 8;
   - test levels and expected results: 7 pass and 1 fails, the same failure as on `main` on this machine.

## node (11): a finding under agreement 94

Agreement 94 (`docs/backlog/sprints/team2/94.md:484`): "A test whose outcome depends on which files the repository holds
is reported to both teams the first time it flips, and fixed before either team works around it."

The cancellation was not node (11)'s margin. The log, job 120056351279:
- the tests start at 20:01:45 (line 422);
- TST-961005 fails at 20:01:52, `Cannot parse privateKey: Malformed OpenSSH private key` (line 487), from
  `testSshServer` at `src/bridge-build/check.mjs:134`;
- the last test ends at 20:01:55 (line 512);
- nothing is written until the cancellation at 20:04:09 (line 517).

TST-961005's outcome depends on a random key that ssh2 sometimes cannot parse: 13 of 3000 calls on this machine. When it
fails, the answer server opened at `check.mjs:131` is not closed, by the reading of `check.mjs:216-220`. So the shard
hangs. It is registered as ITM-1182, and it goes to both teams. The shard balance is not the cause, so no item is
registered for it.

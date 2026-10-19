---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 706d279c44ee171a821356d1711308a5c5a184c7
  - https://github.com/akmaier/agent-m/pull/1073
date: 2026-10-19 13:42 UTC
---
# Development → Release testing: ITM-586, a queued run-tests job runs its levels on its commit and appends the run's result record

**REGISTER**

## Reason

ITM-586, pull request #1073 into `sprint/team2/96`, passes on `706d279c`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `11b98610` holds only `tests/result-records-run-tests.test.mjs`, and CI failed on it.
2. **Scope.** Only `src/result-records/` (`strategies.mjs` and a comment in `index.mjs`) and the new test change.
3. **The accepted text.** MOD-result-records.md:138 states the recipe `commit-and-levels` and :150 the writer
   `result-record` through `appendResult`. Counter-proofs: 7 planted faults. Run here: the test passes, 8 of 8; with
   `OutcomeWithoutLevel` renamed, it fails.
4. **Readings accepted.**
   - The fallbacks for commit, occasion, levels, command and participant.
   - No `## Failures` section.
   - An outcome without a level is refused. The record's `## Outcomes` has a `Level` column (MOD-result-records.md:83-84),
     so the refusal follows the format. The answer schema, which leaves `level` optional, is corrected by ITM-1080.
5. **Not this item's.** `resultStrategies` is registered nowhere yet. That is ITM-755 (MOD-workflow-entries,
   MOD-desktop-shell, MOD-prompt-bar), still open, so no new item.

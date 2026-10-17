---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d17c5074f10b73b3fa8b73b6264078302b807fde
  - https://github.com/akmaier/agent-m/pull/797
date: 2026-10-17 22:21 UTC
---
# Development → Release testing: ITM-849, the Python suite of a pull request runs in four shards

## Reason
ITM-849 (MOD-test-schedule) is declared as refactoring. Its one commit changes only `.github/workflows/tests.yml`, which
belongs to MOD-test-schedule by its Parts: the Python matrix from `[0, 1]` to `[0, 1, 2, 3]` and the count given to
`level.mjs` from 2 to 4. No other line or file changes, every job keeps `timeout-minutes: 2`, and no test's expected
result changes. CI is green on the head (run 39074517581, python shards 39/32/31/25 s in mode rest); the identical diff
ran in mode all in run 39073698881 at 58/38/60/32 s.

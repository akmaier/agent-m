---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1597b3257da102f795277117d1ee19c519dc1035
  - https://github.com/akmaier/agent-m/pull/1311
date: 2026-10-22 23:06 UTC
---
# Development → Release testing: ITM-1188, a hand-over passes the name of its endpoint's CI secret

**REGISTER**

## Reason

ITM-1188, pull request #1311 into `sprint/team2/104`, passes on `1597b325`. CI is green on 28 of 28.

1. **The decision at the stop is built as decided** (`docs/backlog/ITM-1188-*.md`, "Decided at the stop").
   - `handOverJob` (`src/runtimes/hand-over.mjs`) reads the secret's name from the route of the participant
     `prepared` was prepared for, `endpoint <name> secret <NAME>`, and passes it as the input `secret`. It passes a
     name, never a value.
   - Both templates declare `secret`. Each key stays one static line, so `tests/test_runtime_levels.py` holds.
2. **Red first, from the full job logs.**
   - At `036f12f0`, job 120131056982 fails the new cases 213 to 215: `handOverJob` passes the name, never the value,
     and both files declare the input.
   - The pinned template tests fail in jobs 120131057386 (`# fail 7`), 120131057008 (`# fail 4`) and 120131056848.
   - TST-548101 fails in job 120131056891.
   - At `b59debe9`, the prompt bar's hand-over test fails as well (job 120131976880, `not ok 155`).
3. **Tests outside the module are named:** TST-505008 (MOD-prompt-bar), TST-548101 (MOD-settings-pages), and TST-513010,
   the system test of UC-049, which now expects the name "CI_KEY" in `secret`.
4. **Counter-proofs: four.** One plants a dynamic `secrets[inputs.secret]` in the template, and TST-1188004 refuses it.
5. **The reading is named:** for an endpoint's hand-over the key comes from the input, and a CI agent keeps its route.

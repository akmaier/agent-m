---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 3e51399417a3ef4a1f83b4250130ecb2f5429118
  - https://github.com/akmaier/agent-m/pull/959
date: 2026-10-19 06:49 UTC
---
# Development → Release testing: ITM-1003, the Bridge's server tells which origin it is paired with

**REGISTER**

## Reason

ITM-1003, pull request #959 into `sprint/team2/95`, passes on `3e513994`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `02775913` holds only `tests/bridge-http-1003.test.mjs`, and run 39211136442 failed on it.
2. **Scope.** Only `src/bridge-http/pairing.mjs`, `src/bridge-http/server.mjs` and the new test changed.
3. **The accepted text.** MOD-bridge-http.md:84-88 at blob `58ee2fde`. `pairedWith()` is recorded only after the origin
   check (server.mjs refuses any other origin with 403 first) and the token check. It is kept in a variable of the running
   server, so it is in memory only. After `pairAnew` on the same data folder it is `null` again.
4. **The tests.** Each names its guards and its module. Re-run here: the MOD-bridge-http tests pass, 34 of 34.
   Counter-proofs:
   - TST-1003005: another origin, a wrong token, no token, no Origin header and a preflight;
   - TST-1003006: restart;
   - TST-1003007: another data folder.
5. **Callers** (agreement 92). The only caller in `src` is `src/desktop-shell/compose.mjs:70`, which spreads the result,
   so it gains `pairedWith` and changes nothing else.
6. **Readings ruled** (AGENTS.md §6a.7: the text is read as written):
   - A request answered `paused` counts. It "carried the token in force and came from `origin`", and the text names no
     status.
   - Only `pairAnew` resets the pairing; a token file rewritten otherwise does not. The text names only `pairAnew`.
     Requests with the old token are refused anyway, because the token is read on every request.
7. **The reading.** developer-sonnet-g read SPEC.md and chapters 9, 11, 12 and 13, and named a passage of each.

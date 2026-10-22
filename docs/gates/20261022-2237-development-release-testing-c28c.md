---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2f9a08035e2dcd1198f12370557b441e4b1cf5e9
  - https://github.com/akmaier/agent-m/pull/1309
date: 2026-10-22 22:37 UTC
---
# Development → Release testing: ITM-1182, the tunnel check's host key and its cleanup

**REGISTER**

## Reason

ITM-1182, pull request #1309 into `sprint/team2/104`, passes on `2f9a0803`. CI is green on 28 of 28.

1. **Red first, from the full job log.** The tests-only commit `90aef487` was pushed alone. Its only red is node (15),
   job 120125352456, with `# fail 3`:
   - `not ok 8`: the test SSH server takes only a host key that ssh2 parses;
   - `not ok 9`: when no key parses, the check fails with `TunnelCheckFailed` after a bounded number of tries;
   - `not ok 10`: when the SSH server cannot be built, the answer server is closed.

   These are TST-1182001 to 003 of `tests/bridge-build-tunnel-check-host-key.test.mjs` (unit, MOD-bridge-build).
2. **The fix follows the existing pattern.** `testSshServer` (`src/bridge-build/check.mjs`) generates the host key until
   `utils.parseKey` accepts it, at most 64 times, as `src/tunnels/index.mjs:41-45` does. A server that cannot be built
   closes the answer server and throws `TunnelCheckFailed`, MOD-bridge-build.md:100's error.
3. **The check targets the real failure.** On this machine, 19 of 4000 generated keys failed `parseKey`, and exactly
   those 19 failed `new Server`. So rejecting a key by `parseKey` removes the failure that cancelled node (11) of
   #1301 (job 120056351279).
4. **Counter-proofs, as the description lists them:**
   - a key accepted without `parseKey` fails 001 and 002;
   - leaving out `answer.close()` fails 003.
5. **Scope.** Only `check.mjs` and the new test change. The test imports `check.mjs` directly, since `index.mjs` does
   not export `tunnelCheck`. MOD-bridge-build.md is accepted at its blob (`160ad6a1`).
6. **The reading** is named in the description: AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, and the item.
   - h's readings are named and lie within the item: "succeeds with the next key, or fails", and the bound of 64.
7. **Runs on the head, by this gate:**
   - the new test and `tests/bridge-build-build-platform.test.mjs`, with traceability: 21 of 21;
   - test levels and expected results: 7 pass, and 1 fails as on `main` on this machine.

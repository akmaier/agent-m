---
id: ITM-902
title: The tests that need the SSH package take it from one helper that reuses the staged package
level: module
realises:
  - UC-003
  - UC-044
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-desktop-shell
  - MOD-tunnels
builds_on:
  - ITM-523
tests:
  - unit
  - release
  - system
origin:
  - found by po-opus-b at #865's gate, run 39111196726 attempt 1, job node (6) 117627510877
  - widened by po-opus-b at #866's gate: AGENTS.md §2 principle 2, nothing twice
---
# ITM-902 The tests that need the SSH package take it from one helper that reuses the staged package

**REGISTER**

## Outcome

`tests/desktop-shell-endpoint-composition.test.mjs` (header: MOD-desktop-shell) failed once and passed on the rerun of
the same commit `a104afa2`. It is flaky, and the fault is outside the item it was run for (#865 changes only
`src/job-catalogue/kinds/propose-tests/`).

**The path.**
- `tests/desktop-shell-endpoint-composition.test.mjs:35` calls `sshRuntime()` when the file loads.
- `:24` looks only in its own cache `$TMPDIR/agent-m-291-desktop-endpoint-ssh2-1.17.0`. That cache is empty on a fresh
  runner.
- `:25` therefore runs `npm install --no-save ssh2@1.17.0` against the registry, with a 40-second limit.
- `:26` asserts status 0. In the failed job, the file ran 56 s and the install gave status 1 with empty stderr:
  "ssh2 staging failed: 1 !== 0". The whole file failed, so TST-268001 never ran.
- But `.github/workflows/tests.yml:33` and `:77` stage ssh2 already, in `src/bridge-build/node_modules`.
  `src/bridge-build/package.json:12` pins it to `1.17.0`. On that path, the test's own known positive (version
  1.17.0, `utils.generateKeyPairSync` a function) holds. I checked this with `NODE_PATH=src/bridge-build/node_modules`.

ITM-523 fixed the same pattern, but only in `tests/release-itm-284-tunnels-key.test.mjs:29-33`: it uses the staged
package when present and falls back to the cache otherwise. No item covers this file.

**Widened at #866's gate.** The same preparation stands, copied, in eleven test files. Ten install `ssh2@1.17.0` from
the registry and never look in `src/bridge-build/node_modules`:
- `tests/desktop-shell-endpoint-composition.test.mjs`, `tests/mod-desktop-shell-settings.test.mjs`,
  `tests/release-itm-268-desktop-shell.test.mjs`, `tests/release-itm-269-endpoint-route.test.mjs`,
  `tests/release-uc-003-dashboard-https-bridge.test.mjs`, `tests/system-uc-003-dashboard-bridge.test.mjs` (MOD-desktop-shell);
- `tests/component-itm-294-https-reverse-tunnel.test.mjs` (MOD-desktop-shell and MOD-tunnels);
- `tests/tunnels-key.test.mjs`, `tests/tunnels-runtime.test.mjs`, `tests/release-itm-286-tunnels-runtime.test.mjs` (MOD-tunnels).

The eleventh, `tests/release-itm-284-tunnels-key.test.mjs:29-33`, holds ITM-523's fix as one more copy. Fixing the ten one
by one, as ITM-523 did, would make eleven copies of one rule — "take the staged package, else the cache". AGENTS.md §2
principle 2: nothing twice. So one helper serves all eleven.

- A new test helper `tests/ssh2-fixture.mjs`, whose header names MOD-desktop-shell and MOD-tunnels, exports one function.
  It is given the caller's cache folder and returns the `NODE_PATH` that holds `ssh2@1.17.0`.
  - It takes `src/bridge-build/node_modules` when that holds `ssh2/package.json`.
  - Otherwise it takes the caller's cache, and installs `ssh2@1.17.0` there only when the cache lacks it.
  - It checks the known positive of the package it selected: version `1.17.0`, and `Server` and
    `utils.generateKeyPairSync` are functions. A failing known positive throws, and the file fails.
- Each caller keeps its own cache folder name, so that files run in parallel never install into one folder.
- The eleven files replace their own staging with a call to the helper. A file whose known positive checks more than the
  package — the Ed25519 key fixture of the tunnels tests — keeps that further check where it is.

## Acceptance

- With `src/bridge-build/node_modules/ssh2` present, none of the eleven files runs `npm install`. With it absent, each
  installs into its own cache as before.
- A failing known positive still fails the file. A counter-proof is recorded: with no staged package, the helper given a
  cache that holds another version of ssh2 throws.
- Every test of the eleven files keeps its identifier, input and expected result, and passes.
- The install stands in the helper alone: `git grep -n '"ssh2@1.17.0"' tests` finds only `tests/ssh2-fixture.mjs`.
- Only fixture-preparation lines of the eleven files change, and the helper is added. No new test is added, so no red
  first commit applies.

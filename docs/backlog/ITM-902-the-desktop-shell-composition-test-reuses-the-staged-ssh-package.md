---
id: ITM-902
title: The desktop shell's composition test reuses the staged SSH package
level: module
realises:
  - UC-003
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - found by po-opus-b at #865's gate, run 39111196726 attempt 1, job node (6) 117627510877
---
# ITM-902 The desktop shell's composition test reuses the staged SSH package

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

Change only the fixture preparation in `sshRuntime()`, following ITM-523's pattern:
- Take `src/bridge-build/node_modules` when it holds `ssh2/package.json`. Otherwise keep the cache and its install.
- Keep the known-positive check for the package that was selected.
- TST-268001 keeps its identifier, input and expected result.

Nine other test files install `ssh2@1.17.0` and do not look in `src/bridge-build/node_modules`. Among them are
`tests/mod-desktop-shell-settings.test.mjs` and `tests/release-itm-268-desktop-shell.test.mjs`. They are not in this
item. Each one gets an item of its own when it is seen to flip.

## Acceptance

- With `src/bridge-build/node_modules/ssh2` present, the test makes no `npm install`. With it absent, the test installs
  into its cache as before. A failing known positive still fails the file.
- TST-268001 passes with no change to its input, expected result or declaration.
- Only fixture-preparation lines of `tests/desktop-shell-endpoint-composition.test.mjs` change. No new test is added, so
  no new-test counter-proof and no red first commit apply.

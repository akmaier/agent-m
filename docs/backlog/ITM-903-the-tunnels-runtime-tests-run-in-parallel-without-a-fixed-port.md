---
id: ITM-903
title: The tunnels runtime tests run in parallel without a fixed port or a shared cache
level: module
realises:
  - UC-044
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
modules:
  - MOD-tunnels
builds_on:
  - ITM-902
tests:
  - unit
  - release
origin:
  - found by po-opus-b at #868's gate, reported by developer-sonnet-f in #868
---
# ITM-903 The tunnels runtime tests run in parallel without a fixed port or a shared cache

**REGISTER**

## Outcome

Two test files of MOD-tunnels fail when they run at the same time on one host. Several clones run tests at once
here (AGENTS.md §5, parallel teams), so one commit can show both outcomes: A TEST THAT FLIPS ON THE SAME COMMIT IS
FLAKY. The fault is in the tests' fixtures, not in `src/tunnels/`.

**The path, on `c640da5e` (#868's head).**
- `tests/tunnels-runtime.test.mjs:110` (TST-286003) sets `remotePort = 42003`, a fixed number.
- `:109` the fixture's SSH server answers the `tcpip-forward` request with `remote.listen(info.bindPort, ...)`, so it
  binds 127.0.0.1:42003.
- A second run of the file binds the same port and fails: "EADDRINUSE: address already in use 127.0.0.1:42003".
  Six parallel runs of the file failed TST-286003 three times; one run alone passes.
- `tests/release-itm-286-tunnels-runtime.test.mjs:83` (TST-286902) has the same fixture with `remotePort=45202`.
  developer-sonnet-f reproduced it there, also on the base `851b6957`.
- Both files also name the same cache folder, `agent-m-286-ssh2-1.17.0` (`tests/tunnels-runtime.test.mjs:15`,
  `tests/release-itm-286-tunnels-runtime.test.mjs:16`). Without the staged package, the two files install into one
  folder when run in parallel. ITM-902 states that this never happens.

The fix:
- Each fixture takes a port that is free when it starts, from the system (listen on port 0, read it, close), instead of
  a fixed number.
- `tests/release-itm-286-tunnels-runtime.test.mjs` gets a cache folder name of its own.

## Acceptance

- Neither file holds a fixed remote port: `grep -nE '4200[0-9]|4520[0-9]'` finds none in the two files.
- Six parallel runs of each file pass, and so do the two files run together. Counter-proof: with `42003` put back,
  the six parallel runs fail with EADDRINUSE.
- No two files under `tests/` pass the same cache folder to `ssh2NodePath`.
- TST-286003 and TST-286902 keep their identifiers, input and expected results. Only how they prepare their fixture
  changes, and they pass.

---
id: ITM-1182
title: The tunnel check's test SSH server takes only a host key it can parse, and leaves nothing open when it fails
level: module
realises:
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-bridge-build
builds_on:
tests:
  - unit
origin:
  - node (11) of #1301 at c3f8abbd cancelled after 2:46, full job log 120056351279, reported by the coordinator on 2026-10-22
---
# ITM-1182 The tunnel check's test SSH server takes only a host key it can parse, and leaves nothing open when it fails

**REGISTER**

## Outcome

node (11) of #1301 at `c3f8abbd` was cancelled at the job's two minutes. It did not run out of margin: it failed, then
hung. Read from the full job log 120056351279:
- line 422, 20:01:45: `node --test` starts;
- lines 480-497, 20:01:52: TST-961005 (`tests/bridge-build-build-platform.test.mjs:340`) fails with
  `Cannot parse privateKey: Malformed OpenSSH private key`, raised by ssh2's `new Server` (`server.js:249`) from
  `testSshServer` (`src/bridge-build/check.mjs:134`), called by `tunnelCheck` (`check.mjs:187`) from `buildPlatform`
  (`builder.mjs:220`);
- lines 499-512, 20:01:55: tests 11 to 13 pass;
- line 517, 20:04:09: "The operation was canceled." Nothing is written for 2 min 14 s before it.

**The path.**
1. `check.mjs:131` starts the answer web server (`answer.listen`).
2. `check.mjs:134` builds the SSH server with a fresh `utils.generateKeyPairSync("ed25519").private` as host key.
3. ssh2 cannot parse some of the keys it generates itself. On this machine 13 of 3000 calls of
   `new Server({ hostKeys: [utils.generateKeyPairSync("ed25519").private] })` threw that error (ssh2 from
   `src/bridge-build/node_modules`).
4. `testSshServer` throws before it returns its `close`. In `tunnelCheck`, `server` stays null, so the `finally`
   (`check.mjs:216-220`) closes nothing, and the answer server from step 1 stays listening.
5. The open server, by this reading, keeps the test file's process alive, and the shard waits for it until the job's limit
   cancels it. That step is read from the code and the 2 min 14 s of silence, not shown by a run.

So about one call in 230 fails TST-961005 and blocks a node shard, on any pull request, whatever it changes.

**The existing pattern.** `src/tunnels/index.mjs:41-45` generates the bridge's own key the same way, and keeps generating
until `matchedPair` (which parses both halves with `utils.parseKey`) accepts the pair. The tunnel check's host key does
not.

## Acceptance

- `testSshServer` uses only a host key that ssh2 parses, following `src/tunnels/index.mjs:41-45`.
- When building the SSH server fails, `testSshServer` closes what it already opened, and the tunnel check fails with
  `TunnelCheckFailed` instead of hanging.
- A unit test hands the check an ssh2 whose key generation gives an unparseable key first. The check either succeeds with
  the next key, or fails, and in both cases the test's process exits. Counter-proof: today's `check.mjs` fails it.
- The first commit holds only the tests, and CI is red on it.

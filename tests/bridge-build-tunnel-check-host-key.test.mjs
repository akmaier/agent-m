// The tunnel check's test SSH server (ITM-1182) — the accepted text of docs/architecture/MOD-bridge-build.md: "the tunnel check: each platform's packaged
// app opens a reverse tunnel and a forward to a test SSH server and answers a request through them before anything is published"; Errors:
// "TunnelCheckFailed { reason }", with which "the platform's files are not handed on". ssh2 cannot parse about one in 230 of the ed25519 keys it generates
// itself (utils.parseKey then returns an Error and `new Server` throws "Malformed OpenSSH private key"); the check must use only a host key that parses, and
// must leave nothing listening when its SSH server cannot be built. Run: node --test tests/bridge-build-tunnel-check-host-key.test.mjs
//
// Module: MOD-bridge-build
// Guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: unit
//
// The check takes ssh2 as a parameter, so each test hands it a copy of the real ssh2 whose key generator it controls (and, in one test, whose Server it
// replaces). The packaged app is a path where no program lies: the check then ends at "could not be started", after the test SSH server is up, and no test
// waits for a tunnel. The answer server the check opens is found through http.createServer, which the check calls. Nothing reaches the network.
// Each test states its given / input / expect before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { tunnelCheck } from "../src/bridge-build/check.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const realSsh2 = createRequire(join(ROOT, "src", "bridge-build", "package.json"))("ssh2");
// A key ssh2 cannot parse: the shape of an OpenSSH private key whose body is not one.
const UNPARSEABLE = "-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA\n-----END OPENSSH PRIVATE KEY-----\n";
const EXECUTABLE = join(tmpdir(), "bridge-tunnel-check-no-such-app");

// Runs the check with a copy of ssh2 whose key generator is `generate` (called with the key type, as the real one) and whose Server is `Server`, and reports
// the error it ended with, the host keys handed to the Server, the number of keys generated, and every web server the check opened. Servers still
// listening are closed at the end, so that a check that leaves one open cannot keep this test's process alive.
async function checkWith({ generate, Server = realSsh2.Server }) {
  const opened = [];
  const createServer = http.createServer;
  http.createServer = (...args) => { const server = createServer(...args); opened.push(server); return server; };
  const hostKeys = [];
  let generated = 0;
  const ssh2 = {
    ...realSsh2,
    utils: { ...realSsh2.utils, generateKeyPairSync: (type) => { generated += 1; return generate(type, generated); } },
    Server: class extends Server { constructor(config, listener) { hostKeys.push(...config.hostKeys); super(config, listener); } },
  };
  let error = null;
  try {
    await tunnelCheck({ platform: "linux", executable: EXECUTABLE, appId: "probe.bridge", ssh2, timeout: 5000 });
  } catch (caught) { error = caught; } finally {
    http.createServer = createServer;
  }
  const stillListening = opened.filter((server) => server.listening).length;
  for (const server of opened) server.close();
  return { error, hostKeys, generated, opened: opened.length, stillListening };
}

// TST-1182001 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER
// given: an ssh2 whose first generated ed25519 key does not parse and whose later ones are the real ones; a packaged app that is not there
// input: tunnelCheck
// expect: the Server is built with a host key that ssh2 parses, the unparseable key is never handed to it, a second key was generated, and the check ends at the missing app (TunnelCheckFailed), not at the key
// Planted fault: today's check, which hands the first key to the Server whatever it is, fails with "Malformed OpenSSH private key".
test("tunnelCheck — the test SSH server takes only a host key that ssh2 parses, and generates another when one does not", async () => {
  const run = await checkWith({ generate: (type, n) => (n === 1 ? { private: UNPARSEABLE, public: "" } : realSsh2.utils.generateKeyPairSync(type)) });
  assert.equal(run.error?.name, "TunnelCheckFailed", String(run.error?.message));
  assert.match(run.error.reason, /could not be started/);
  assert.ok(run.generated >= 2, "a second key was generated");
  assert.ok(run.hostKeys.length > 0, "a Server was built");
  assert.ok(!run.hostKeys.includes(UNPARSEABLE), "the unparseable key was never handed to the Server");
  for (const key of run.hostKeys) assert.ok(!(realSsh2.utils.parseKey(key) instanceof Error), "each host key parses");
});

// TST-1182002 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: an ssh2 whose key generator never gives a key that parses
// input: tunnelCheck
// expect: the check ends with TunnelCheckFailed after a bounded number of keys (at most 64), no Server is built with a key, and no web server it opened is left listening
// Planted fault: a check that loops without a bound, or ends with a plain Error, or leaves its answer server open, fails.
test("tunnelCheck — when no generated key parses, it fails with TunnelCheckFailed after a bounded number of tries and leaves nothing open", async () => {
  const run = await checkWith({ generate: () => ({ private: UNPARSEABLE, public: "" }) });
  assert.equal(run.error?.name, "TunnelCheckFailed", String(run.error?.message));
  assert.ok(run.generated >= 1 && run.generated <= 64, `keys generated: ${run.generated}`);
  assert.deepEqual(run.hostKeys, []);
  assert.equal(run.stillListening, 0, "no web server of the check is left listening");
});

// TST-1182003 · level: unit · module: MOD-bridge-build
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: an ssh2 whose Server cannot be built (its constructor throws), with a key that parses
// input: tunnelCheck
// expect: the check ends with TunnelCheckFailed naming the Server's own message, and the answer web server it had opened is closed
// Planted fault: today's check, which lets the Server's error out with the answer server still listening (`server` stays null in its finally), fails both.
test("tunnelCheck — when the SSH server cannot be built, the answer server it opened is closed and the check fails with TunnelCheckFailed", async () => {
  const Broken = class { constructor() { throw new Error("the test server could not be built"); } };
  const run = await checkWith({ generate: (type) => realSsh2.utils.generateKeyPairSync(type), Server: Broken });
  assert.equal(run.error?.name, "TunnelCheckFailed", String(run.error?.message));
  assert.match(run.error.reason, /the test server could not be built/);
  assert.ok(run.opened >= 1, "the check had opened its answer server");
  assert.equal(run.stillListening, 0, "the answer server is closed");
});

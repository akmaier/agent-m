// Canonical tunnel plans and HTTPS proxy configuration for the Bridge client.
//
// Module: MOD-bridge-client
// Guards: UC-003; UC-011; UC-044; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE;
// A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; THE DASHBOARD WRITES THE TUNNEL COMMANDS;
// THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN;
// THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
// Level: unit
//
// Run: node --test tests/bridge-client-tunnel-plans.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { allocatePort, tunnelCommands, proxyConfiguration } from "../src/bridge-client/index.mjs";

const jumpHost = {
  hostname: "jump.example.test",
  user: "bridge-user",
  sshPort: 2222,
  portRange: [40100, 40103],
  httpsAddress: "https://jump.example.test",
};

const sessions = [
  { name: "gpu-box", port: 40100, token: "session-token-1" },
  { name: "lab-mac", port: 40102, token: "session-token-2" },
];

// TST-282001
// Precondition: a configured jump host has an inclusive range with two occupied ports.
// Input: allocatePort([40100, 40103], sessions), then an exhausted two-port range.
// Expected: the lowest unoccupied port is returned; exhaustion throws NoFreePort and names its range.
test("TST-282001: allocatePort chooses the lowest free inclusive port and names exhaustion", () => {
  assert.equal(allocatePort([40100, 40103], sessions), 40101);
  assert.throws(() => allocatePort([40100, 40101], [{ name: "one", port: 40100, token: "a" }, { name: "two", port: 40101, token: "b" }]),
    (error) => error?.name === "NoFreePort" && /40100.*40101/.test(error.message));
});

// TST-282002
// Precondition: one remote Bridge and one local Bridge have distinct key-file names.
// Input: tunnelCommands(jumpHost, gpu-box, 4715, { remote, local }).
// Expected: reverse and forward commands and their two plans agree on supplied ports and key files, use loopback-only
// ends and keep-alives, and the reverse service description retains the reverse command.
test("TST-282002: tunnelCommands keeps commands, plans, loopback ends and service aligned", () => {
  const result = tunnelCommands(jumpHost, sessions[0], 4715, {
    remote: "~/.ssh/agent-m-remote",
    local: "~/.ssh/agent-m-local",
  });
  assert.match(result.reverse, /ssh -N/);
  assert.match(result.reverse, /-R 127\.0\.0\.1:40100:127\.0\.0\.1:4715/);
  assert.match(result.reverse, /ServerAliveInterval=/);
  assert.match(result.reverse, /ServerAliveCountMax=/);
  assert.match(result.reverse, /agent-m-remote/);
  assert.match(result.forward, /-L 127\.0\.0\.1:40100:127\.0\.0\.1:40100/);
  assert.match(result.forward, /ServerAliveInterval=/);
  assert.match(result.forward, /ServerAliveCountMax=/);
  assert.match(result.forward, /agent-m-local/);
  assert.deepEqual(result.plans, [
    { direction: "reverse", jumpHost: "jump.example.test", user: "bridge-user", sshPort: 2222, remotePort: 40100,
      bind: "127.0.0.1", bridgePort: 4715, keyFile: "~/.ssh/agent-m-remote" },
    { direction: "forward", jumpHost: "jump.example.test", user: "bridge-user", sshPort: 2222, remotePort: 40100,
      bind: "127.0.0.1", bridgePort: 40100, keyFile: "~/.ssh/agent-m-local" },
  ]);
  assert.match(result.service, /agent-m-remote/);
  assert.match(result.service, /127\.0\.0\.1:40100:127\.0\.0\.1:4715/);
});

// TST-282003
// Precondition: two remote sessions are reached at the jump host's trusted HTTPS address.
// Input: proxyConfiguration for Apache and nginx with the instance Pages origin.
// Expected: both configurations require TLS/login before proxying, answer preflights locally, allow only that origin,
// and forward each session path to its loopback port without tokens or jump-host passwords.
test("TST-282003: proxyConfiguration emits authenticated instance-only Apache and nginx plans", () => {
  for (const server of ["apache", "nginx"]) {
    const configuration = proxyConfiguration(jumpHost, sessions, "https://owner.github.io", server);
    assert.match(configuration, /trusted certificate/i);
    assert.match(configuration, /https/i);
    assert.match(configuration, /login|auth/i);
    assert.match(configuration, /https:\/\/owner\.github\.io/);
    assert.match(configuration, /OPTIONS/);
    assert.match(configuration, /127\.0\.0\.1:40100/);
    assert.match(configuration, /127\.0\.0\.1:40102/);
    assert.match(configuration, /gpu-box/);
    assert.match(configuration, /lab-mac/);
    assert.doesNotMatch(configuration, /session-token-[12]/);
    assert.doesNotMatch(configuration, /password/i);
  }
});

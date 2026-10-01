// The tunnel commands (docs/assets/bridge-tunnel.mjs) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-bridge-tunnel
// Guards: EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-011
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import {
  jumpHostProblem, nextFreePort, addRemoteSession, tunnelCommands, tunnelBindProblems, probeLocalPort,
} from "../../docs/assets/bridge-tunnel.mjs";
import { withFetch, JUMP, BRIDGE_TOKEN } from "./helpers.mjs";

// ---------------------------------------------------------------- jump host and remote sessions (queue 2026-09-30, entries 01, 02)
// EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE · THE DASHBOARD WRITES THE TUNNEL COMMANDS · A REVERSE TUNNEL
// LISTENS ONLY ON THE JUMP HOST'S LOOPBACK (UC-011 1c)

test("EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so", () => {
  assert.equal(nextFreePort(JUMP, []), 20001);
  let list = addRemoteSession(JUMP, [], { name: "lab-pc", bridgePort: 8765, token: BRIDGE_TOKEN });
  assert.deepEqual(list, [{ name: "lab-pc", port: 20001, bridgePort: 8765, token: BRIDGE_TOKEN }]);
  list = addRemoteSession(JUMP, list, { name: "gpu", bridgePort: 8765, token: "" });
  assert.equal(list[1].port, 20002, "the next free one");
  // A freed port is the lowest free port again.
  const gap = addRemoteSession(JUMP, [list[1]], { name: "third", bridgePort: 8765 });
  assert.equal(gap[1].port, 20001);
  // A port chosen by hand must lie in the range and be free.
  assert.throws(() => addRemoteSession(JUMP, list, { name: "x", port: 20002, bridgePort: 1 }), /20002.*gpu/);
  assert.throws(() => addRemoteSession(JUMP, list, { name: "x", port: 20009, bridgePort: 1 }), /20001–20003/);
  assert.equal(addRemoteSession(JUMP, list, { name: "x", port: 20003, bridgePort: 1 })[2].port, 20003);
  assert.throws(() => addRemoteSession(JUMP, list, { name: "lab-pc", bridgePort: 1 }), /already/);
  // Counter-proof: a range with no free port refuses a new session and says so.
  const full = addRemoteSession(JUMP, list, { name: "x", bridgePort: 1 });
  assert.throws(() => nextFreePort(JUMP, full), /No free port.*20001–20003/);
  assert.throws(() => addRemoteSession(JUMP, full, { name: "y", bridgePort: 1 }), /No free port/);
  const ports = full.map((s) => s.port);
  assert.equal(new Set(ports).size, ports.length, "no two sessions share a port");
});

test("the jump host's settings are checked — a host, user or key name that could change the command is refused", () => {
  assert.equal(jumpHostProblem(JUMP), null);
  assert.equal(jumpHostProblem({ ...JUMP, host: "10.0.0.7" }), null);
  for (const bad of [{ host: "" }, { host: "-oProxyCommand=x" }, { host: "a b" }, { host: "jump;rm -rf ~" }, { user: "" }, { user: "a b" },
    { user: "-l" }, { portFrom: 20003, portTo: 20001 }, { portFrom: 80 }, { portTo: 70000 }, { portFrom: "x" },
    { reverseKey: "-----BEGIN OPENSSH PRIVATE KEY-----" }, { forwardKey: "~/.ssh/id ed" }, { reverseKey: "-i" }, { forwardKey: "a\nb" }]) {
    assert.ok(jumpHostProblem({ ...JUMP, ...bad }), JSON.stringify(bad));
  }
  assert.throws(() => addRemoteSession({ ...JUMP, host: "" }, [], { name: "a", bridgePort: 1 }), /host/i);
  for (const bad of [{ name: "" }, { name: "a|b" }, { bridgePort: 0 }, { bridgePort: 70000 }, { token: "has space" }]) {
    assert.throws(() => addRemoteSession(JUMP, [], { name: "a", bridgePort: 8765, ...bad }), Error, JSON.stringify(bad));
  }
});

test("THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other", () => {
  const s = addRemoteSession(JUMP, [], { name: "lab-pc", bridgePort: 8765, token: BRIDGE_TOKEN })[0];
  const c = tunnelCommands(JUMP, s);
  assert.equal(c.reverse, "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes " +
    "-i ~/.ssh/agent-m-jump -R 127.0.0.1:20001:127.0.0.1:8765 agentm@jump.example.org");
  assert.equal(c.forward, "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes " +
    "-i ~/.ssh/id_ed25519 -L 127.0.0.1:20001:127.0.0.1:20001 agentm@jump.example.org");
  assert.equal(c.url, "http://localhost:20001");
  // A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK: the jump-host end is bound to 127.0.0.1 explicitly.
  assert.match(c.reverse, / -R 127\.0\.0\.1:20001:/);
  for (const cmd of [c.reverse, c.forward]) {
    assert.deepEqual(tunnelBindProblems(cmd), []);
    assert.doesNotMatch(cmd, /0\.0\.0\.0|\*|GatewayPorts|\s-g\s/);
    assert.ok(!cmd.includes(BRIDGE_TOKEN), "no bridge token in a command");
  }
  // Without key file names the key option is left to ssh's defaults, and nothing else changes.
  const bare = tunnelCommands({ ...JUMP, reverseKey: "", forwardKey: "" }, s);
  assert.doesNotMatch(bare.reverse + bare.forward, / -i /);
  assert.match(bare.reverse, / -R 127\.0\.0\.1:20001:127\.0\.0\.1:8765 agentm@jump\.example\.org$/);
  // Counter-proof: every other bind address of either end is caught.
  for (const bad of ["ssh -N -R 0.0.0.0:20001:127.0.0.1:8765 u@h", "ssh -N -R *:20001:127.0.0.1:8765 u@h",
    "ssh -N -R :20001:127.0.0.1:8765 u@h", "ssh -N -R 20001:127.0.0.1:8765 u@h", "ssh -N -R 192.168.1.5:20001:127.0.0.1:8765 u@h",
    "ssh -N -L 0.0.0.0:20001:127.0.0.1:20001 u@h", "ssh -N -L 20001:127.0.0.1:20001 u@h", "ssh -N -R 127.0.0.1:20001:10.0.0.2:8765 u@h",
    "ssh -N -g -L 127.0.0.1:20001:127.0.0.1:20001 u@h", "ssh -N -o GatewayPorts=yes -R 127.0.0.1:20001:127.0.0.1:8765 u@h",
    "ssh -N u@h"]) {
    assert.ok(tunnelBindProblems(bad).length, bad);
  }
});

test("a remote session is tested by asking whether anything answers at its local port — no token, nothing else", async () => {
  const seen = [];
  const ok = await withFetch(async (u, init) => { seen.push([String(u), init]); return new Response(null, { status: 200 }); },
    () => probeLocalPort(20001));
  assert.equal(ok, true);
  assert.equal(seen[0][0], "http://localhost:20001/");
  assert.equal(seen[0][1].mode, "no-cors");
  assert.equal(seen[0][1].credentials, "omit");
  assert.deepEqual(seen[0][1].headers ?? {}, {}, "no token, no header");
  const down = await withFetch(async () => { throw new TypeError("Failed to fetch"); }, () => probeLocalPort(20001));
  assert.equal(down, false);
  for (const bad of [0, 70000, "20001/../x", "1e3", null]) await assert.rejects(probeLocalPort(bad), /port/, String(bad));
});

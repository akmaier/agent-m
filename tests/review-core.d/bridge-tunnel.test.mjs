// The tunnel commands of MOD-bridge-client (src/bridge-client/, allocatePort and tunnelCommands) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-bridge-client
// Guards: EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-011
// Level: unit
//
// Every expected value is written here; none is read from a document.

import test from "node:test";
import assert from "node:assert/strict";
import { allocatePort, tunnelCommands } from "../../src/bridge-client/index.mjs";
import { BRIDGE_TOKEN } from "./helpers.mjs";

// The jump host as the browser's store keeps it (MOD-bridge-client JumpHost), with a range of three ports.
const JUMP = { hostname: "jump.example.org", user: "agentm", sshPort: 22, portRange: [20001, 20003] };
const KEYS = { remote: "~/.ssh/agent-m-jump", local: "~/.ssh/id_ed25519" };
// A Bridge reached through the jump host, as the browser's store keeps it (BridgeEntry), at `port`.
const session = (name, port) => ({ name, port, token: BRIDGE_TOKEN });

// ---------------------------------------------------------------- remote sessions and their ports (UC-011 1c)
// EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE

test("EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so", () => {
  assert.equal(allocatePort(JUMP.portRange, []), 20001, "a new session gets the lowest port of the range");
  const sessions = [session("lab-pc", allocatePort(JUMP.portRange, []))];
  sessions.push(session("gpu", allocatePort(JUMP.portRange, sessions)));
  assert.equal(sessions[1].port, 20002, "the next free one");
  // A freed port is the lowest free port again.
  assert.equal(allocatePort(JUMP.portRange, [sessions[1]]), 20001);
  // A Bridge reached directly, at its own address, holds no port of the range.
  assert.equal(allocatePort(JUMP.portRange, [{ name: "here", address: "http://127.0.0.1:4711", token: BRIDGE_TOKEN }]), 20001);
  sessions.push(session("third", allocatePort(JUMP.portRange, sessions)));
  const ports = sessions.map((s) => s.port);
  assert.deepEqual(ports, [20001, 20002, 20003]);
  assert.equal(new Set(ports).size, ports.length, "no two sessions share a port");
  // Counter-proof: a range with no free port refuses a new session and says so, naming the range.
  assert.throws(() => allocatePort(JUMP.portRange, sessions), (error) => error.name === "NoFreePort" && /20001.*20003/.test(error.message));
});

// ---------------------------------------------------------------- the commands of both ends (UC-011 1c)
// THE DASHBOARD WRITES THE TUNNEL COMMANDS · A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK

test("THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other", () => {
  const lab = session("lab-pc", allocatePort(JUMP.portRange, []));
  const c = tunnelCommands(JUMP, lab, 8765, KEYS);
  const options = "-N -p 22 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes";
  assert.equal(c.reverse, `ssh ${options} -i ~/.ssh/agent-m-jump -R 127.0.0.1:20001:127.0.0.1:8765 agentm@jump.example.org`);
  assert.equal(c.forward, `ssh ${options} -i ~/.ssh/id_ed25519 -L 127.0.0.1:20001:127.0.0.1:20001 agentm@jump.example.org`);
  assert.deepEqual(c.plans.map((plan) => [plan.direction, plan.remotePort, plan.bind, plan.bridgePort, plan.keyFile]),
    [["reverse", 20001, "127.0.0.1", 8765, "~/.ssh/agent-m-jump"], ["forward", 20001, "127.0.0.1", 8765, "~/.ssh/id_ed25519"]]);
  assert.match(c.service, new RegExp(`ExecStart=${c.reverse.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), "the service keeps the reverse tunnel running");
  // A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK: the jump-host end is bound to 127.0.0.1 explicitly.
  assert.match(c.reverse, / -R 127\.0\.0\.1:20001:/);
  for (const cmd of [c.reverse, c.forward, c.service]) {
    assert.doesNotMatch(cmd, /0\.0\.0\.0|\*|GatewayPorts|\s-g\s/);
    assert.ok(!cmd.includes(BRIDGE_TOKEN), "no bridge token in a command");
  }
  // Another session and another SSH port change the commands accordingly.
  const gpu = tunnelCommands({ ...JUMP, sshPort: 2222 }, session("gpu", 20002), 4711, KEYS);
  assert.match(gpu.reverse, / -p 2222 .* -R 127\.0\.0\.1:20002:127\.0\.0\.1:4711 agentm@jump\.example\.org$/);
  assert.match(gpu.forward, / -L 127\.0\.0\.1:20002:127\.0\.0\.1:20002 agentm@jump\.example\.org$/);
  // Counter-proof: a command cannot be written without the key file of each end, or with a port outside 1–65535.
  assert.throws(() => tunnelCommands(JUMP, lab, 8765, { remote: "", local: KEYS.local }), /key file/);
  assert.throws(() => tunnelCommands(JUMP, session("lab-pc", 70000), 8765, KEYS), /port/);
});

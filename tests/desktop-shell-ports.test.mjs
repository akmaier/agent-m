// Tests of the port helper that the desktop shell's native Electron tests share (tests/desktop-shell.d/ports.mjs): the ports one launch
// takes — the Bridge's, the browser's debugging port and the main process inspector's — are chosen together, so that no two are the same.
// TST-276004 failed once in CI because `--inspect` and `--remote-debugging-port` were both 45145: two calls that each listened on port 0
// and closed again were handed the same port, and Electron answered "bind() failed: Address already in use". The helper is test code; it
// holds no product code.
//
// Module: MOD-desktop-shell
// Guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// Level: unit
//
// The expected results are written here in the tests' own text. The fake system models what the operating system does: a port that a
// server holds is given to no one else, and a port that was closed is given out again. The counter-proof (a helper that opens, reads and
// closes one server after the other) is recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:net";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";

// A system whose lowest free port is 7: `open` gives the lowest port no open server holds; closing a server frees its port; the
// `failAt`-th open fails. `held` is the set of ports open now.
function fakeSystem(failAt = null) {
  const held = new Set();
  let opened = 0;
  const open = async () => {
    opened += 1;
    if (opened === failAt) throw new Error("no more sockets");
    let port = 7;
    while (held.has(port)) port += 1;
    held.add(port);
    return { port, close: async () => { held.delete(port); } };
  };
  return { open, held };
}

// TST-885001 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a system that gives the lowest port no open server holds, starting at 7, and gives a closed port out again
// input: unusedPorts(3, that system's open)
// expect: [7, 8, 9], and no server is open afterwards
test("TST-885001: ports chosen together are three different ports, and none stays open", async () => {
  const system = fakeSystem();
  assert.deepEqual(await unusedPorts(3, system.open), [7, 8, 9]);
  assert.equal(system.held.size, 0);
});

// TST-885002 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: the same system, whose third open fails with "no more sockets"
// input: unusedPorts(3, that system's open)
// expect: it rejects with "no more sockets", and the two servers that were open are closed
test("TST-885002: a port that cannot be opened ends the choice and closes the servers already open", async () => {
  const system = fakeSystem(3);
  await assert.rejects(() => unusedPorts(3, system.open), /no more sockets/);
  assert.equal(system.held.size, 0);
});

// TST-885003 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: the machine's own sockets
// input: unusedPorts(4), then a server listens on each port on 127.0.0.1
// expect: four whole numbers between 1 and 65535 that differ from one another, and each server listens
test("TST-885003: on the machine, four ports are chosen that differ and can be listened on", async () => {
  const ports = await unusedPorts(4);
  assert.equal(ports.length, 4);
  assert.equal(new Set(ports).size, 4, `the ports ${ports.join(", ")} differ`);
  for (const port of ports) assert.ok(Number.isInteger(port) && port >= 1 && port <= 65535, `${port} is a port`);
  const servers = [];
  try {
    for (const port of ports) {
      const server = createServer();
      await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolve); });
      servers.push(server);
    }
    assert.equal(servers.length, 4);
  } finally { await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve)))); }
});

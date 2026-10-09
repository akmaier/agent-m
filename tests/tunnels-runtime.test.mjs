// Module: MOD-tunnels
// Guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-011; UC-044
// Level: unit
//
// Controlled ssh2 loopback coverage for the runtime.  The first job commit is intentionally red:
// the delivered key-only module has no runtime exports yet.

import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import * as tunnels from "../src/tunnels/index.mjs";

function dataFolder() {
  return mkdtempSync(join(tmpdir(), "agent-m-286-tunnels-"));
}

// TST-286001
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044
// given: a fresh controlled per-user data folder and a canonical reverse TunnelPlan
// input: openTunnels(dataFolder, [plan], bridgePort)
// expect: the public runtime opens the supplied plan and exposes a reverse opening or open state
test("TST-286001: public runtime accepts a canonical reverse tunnel plan", async () => {
  const folder = dataFolder();
  try {
    assert.equal(typeof tunnels.openTunnels, "function", "failure node: MOD-tunnels has no runtime opener");
    await tunnels.openTunnels(folder, [{
      direction: "reverse", jumpHost: "127.0.0.1", user: "fixture", sshPort: 1,
      remotePort: 41001, bind: "127.0.0.1", bridgePort: 4711, keyFile: "fixture",
    }], 4711);
    assert.ok(tunnels.tunnelState().some((state) => state.kind === "reverse"));
  } finally {
    await tunnels.closeTunnels?.();
    rmSync(folder, { recursive: true, force: true });
  }
});

// TST-286002
// level: unit
// module: MOD-tunnels
// guards: A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-011
// given: a controlled reverse plan whose jump-host bind is not loopback
// input: openTunnels(dataFolder, [nonLoopbackPlan], bridgePort)
// expect: NotLoopback is reported before an SSH connection or forwarding request is made
test("TST-286002: runtime refuses a non-loopback reverse plan before forwarding", async () => {
  const folder = dataFolder();
  try {
    assert.equal(typeof tunnels.openTunnels, "function", "failure node: non-loopback plans have no runtime boundary");
    await assert.rejects(
      tunnels.openTunnels(folder, [{
        direction: "reverse", jumpHost: "127.0.0.1", user: "fixture", sshPort: 1,
        remotePort: 41002, bind: "0.0.0.0", bridgePort: 4711, keyFile: "fixture",
      }], 4711),
      (error) => error?.name === "NotLoopback",
    );
  } finally {
    await tunnels.closeTunnels?.();
    rmSync(folder, { recursive: true, force: true });
  }
});

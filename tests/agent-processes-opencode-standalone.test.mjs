// opencode 2 asked with a private server: where the person's own opencode, run outside the Bridge's enclosure, holds the
// one shared background service of the user account on its port, an opencode that tries to use or start that service fails;
// with `--standalone` it runs with a private server and answers.
// Module: MOD-agent-processes
// Guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044
// Level: unit
// Run: node --test tests/agent-processes-opencode-standalone.test.mjs

import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { installedAgents } from "../src/agent-processes/index.mjs";

const fixture = () => mkdtempSync(join(tmpdir(), "agent-m-standalone-"));
const command = (folder, name, text) => writeFileSync(join(folder, name), `#!/bin/sh\n${text}\n`, { mode: 0o755 });
const withPath = async (folder, work) => {
  const prior = process.env.PATH;
  process.env.PATH = folder;
  try { return await work(); } finally { process.env.PATH = prior; }
};
// A fixture opencode 2 alone on the PATH whose shared background service's port is held by another process: any command
// but `--version` without `--standalone` fails as the real one does, ending 1 with its error on standard error; with
// `--standalone`, `models` lists the models it can use.
function opencode(folder) {
  command(folder, "opencode", `case "$*" in '--version') echo 2.2.5; exit 0;; esac
case " $* " in
  *" --standalone "*) case "$1" in models) echo 'opencode/big-pickle'; echo 'opencode/glm-5.3-flash-free'; exit 0;; esac; exit 64;;
  *) echo 'Error: Managed service port 49374 on 127.0.0.1 is already in use by another process' >&2; exit 1;;
esac`);
}

// TST-1774001
// level: unit
// module: MOD-agent-processes
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044
// given: a controlled PATH holding opencode 2.2.5 alone, which fails `models` (exit 1, "Managed service port … is already in use by another process") unless `--standalone` is given, and lists two models with it.
// input: installedAgents().
// expect: opencode is installed with version 2.2.5 and logged in, with its login step `opencode auth login`.
test("TST-1774001: opencode whose shared service is held outside is asked with a private server and is logged in", async () => {
  const folder = fixture();
  try {
    opencode(folder);
    const found = await withPath(folder, () => installedAgents());
    const { name, installed, version, loggedIn, login } = found.find((agent) => agent.name === "opencode");
    assert.deepEqual({ name, installed, version, loggedIn, login },
      { name: "opencode", installed: true, version: "2.2.5", loggedIn: true, login: "opencode auth login" });
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

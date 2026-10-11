// Module: MOD-agent-processes
// Level: unit
// Guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011; UC-017; UC-044

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { installedAgents, testAgent } from "../src/agent-processes/index.mjs";

const root = new URL("..", import.meta.url).pathname;
const fixture = () => mkdtempSync(join(tmpdir(), "agent-m-320-"));
const command = (folder, name, text) => {
  const path = join(folder, name);
  writeFileSync(path, `#!/bin/sh\n${text}\n`, { mode: 0o755 });
  return path;
};
const withPath = async (folder, work) => {
  const prior = process.env.PATH;
  process.env.PATH = folder;
  try { return await work(); } finally { process.env.PATH = prior; }
};
const registerFixture = (folder, mutate = (text) => text) => {
  cpSync(join(root, "src"), join(folder, "src"), { recursive: true });
  const path = join(folder, "src", "agent-processes", "agents.md");
  writeFileSync(path, mutate(readFileSync(path, "utf8")));
  return join(folder, "src", "agent-processes", "index.mjs");
};

// TST-320001
// level: unit
// module: MOD-agent-processes
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-011; UC-017
// given: a controlled PATH containing only register-named Claude, Codex and OpenCode executables whose version and harmless login-status outputs are constructed.
// input: installedAgents() reads the public register and performs its discovery checks.
// expect: two installed agents carry their register name, version and logged-in state; the missing third carries all platform install guidance; no fixture receives a task.
test("TST-320001: discovery reports register agents' version and own-login outcomes", async () => {
  const folder = fixture();
  try {
    const calls = join(folder, "calls");
    command(folder, "claude", `printf '%s\\n' \"$*\" >> ${calls}; case \"$*\" in '--version') echo '2.1.300';; 'auth status') echo '{\"authMethod\":\"claude.ai\"}';; *) exit 64;; esac`);
    command(folder, "codex", `printf '%s\\n' \"$*\" >> ${calls}; case \"$*\" in '--version') echo 'codex 1.2.3';; 'login status') echo 'Logged in';; *) exit 64;; esac`);
    const agents = await withPath(folder, () => installedAgents());
    assert.deepEqual(agents.filter((agent) => agent.installed).map(({ name, version, loggedIn }) => ({ name, version, loggedIn })), [
      { name: "claude", version: "2.1.300", loggedIn: true }, { name: "codex", version: "1.2.3", loggedIn: true },
    ]);
    assert.deepEqual(Object.keys(agents.find((agent) => agent.name === "opencode").install).sort(), ["linux", "macos", "windows"]);
    const missing = agents.find((agent) => agent.name === "opencode");
    assert.deepEqual({ installed: missing.installed, version: missing.version, loggedIn: missing.loggedIn }, { installed: false, version: null, loggedIn: null });
    for (const url of Object.values(missing.install)) assert.match(url, /^https:\/\//);
    assert.deepEqual(readFileSync(calls, "utf8").trim().split("\n").sort(), ["--version", "--version", "auth status", "login status"].sort());
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-320002
// level: unit
// module: MOD-agent-processes
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011
// given: a controlled PATH with one register command present and the other supported commands absent.
// input: installedAgents() performs only discovery's version/login checks.
// expect: the present entry is installed and missing commands are named unavailable without executing a task or reaching a real agent.
test("TST-320002: discovery names missing supported commands without a task", async () => {
  const folder = fixture();
  try {
    command(folder, "claude", "case \"$*\" in '--version') echo 2.1.300;; 'auth status') echo '{\"authMethod\":\"none\"}'; exit 1;; *) exit 64;; esac");
    const agents = await withPath(folder, () => installedAgents());
    assert.equal(agents.find((agent) => agent.name === "claude").installed, true);
    assert.equal(agents.find((agent) => agent.name === "claude").loggedIn, false);
    assert.match(JSON.stringify(agents.find((agent) => agent.name === "claude")), /claude auth login/);
    assert.equal(JSON.stringify(agents.find((agent) => agent.name === "claude")).includes("password"), false);
    for (const name of ["codex", "opencode"]) assert.equal(agents.find((agent) => agent.name === name).installed, false);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-320003
// level: unit
// module: MOD-agent-processes
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-011
// given: a controlled Claude executable that records its complete argument vector and returns exactly one word.
// input: testAgent(the public Claude Agent, work folder).
// expect: the invoked task asks for one word, the returned one-word answer is retained, and no other agent executable is reachable.
test("TST-320003: harmless agent test sends a one-word task", async () => {
  const folder = fixture();
  try {
    const record = join(folder, "arguments");
    command(folder, "claude", `case \"$*\" in '--version') echo 2.1.300;; 'auth status') echo '{\"authMethod\":\"claude.ai\"}';; *) printf '%s\\n' \"$@\" > ${record}; echo yes;; esac`);
    const agent = (await withPath(folder, () => installedAgents())).find((value) => value.name === "claude");
    const answer = await withPath(folder, () => testAgent(agent));
    assert.deepEqual(answer, { answered: true, version: "2.1.300" });
    const invocation = readFileSync(record, "utf8");
    assert.match(invocation, /-p|--print/);
    assert.match(invocation, /one word/i);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-320004
// level: unit
// module: MOD-agent-processes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011; UC-044
// given: a controlled Claude executable whose harmless request exits unsuccessfully after its own login check.
// input: testAgent(public Agent, work folder).
// expect: the refusal remains a named agent-test failure rather than a fabricated successful answer.
test("TST-320004: harmless agent refusal is named", async () => {
  const folder = fixture();
  try {
    command(folder, "claude", "case \"$*\" in '--version') echo 2.1.300;; 'auth status') echo '{\"authMethod\":\"claude.ai\"}';; *) echo refused >&2; exit 23;; esac");
    const agent = (await withPath(folder, () => installedAgents())).find((value) => value.name === "claude");
    const answer = await withPath(folder, () => testAgent(agent));
    assert.deepEqual(answer, { answered: false, reason: "refused" });
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-320005
// level: unit
// module: MOD-agent-processes
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-017
// given: an isolated copied MOD-agent-processes module and its actual agents.md register with one required register field removed.
// input: importing the copied public module that loads that corrupt register.
// expect: schema-breaking register data refuses module load; the test does not require a particular error class.
test("TST-320005: corrupt copied agent register refuses module load", async () => {
  const folder = fixture();
  try {
    const valid = registerFixture(join(folder, "valid"));
    await import(new URL(`file://${valid}`).href);
    const corrupt = registerFixture(join(folder, "corrupt"), (text) => {
      assert.match(text, /\|\s*Command\s*\|/, "known positive: the valid register has its required Command field");
      return text.replace(/\|\s*Command\s*\|/, "| Broken command |");
    });
    await assert.rejects(import(new URL(`file://${corrupt}`).href), (error) => error?.code !== "ERR_MODULE_NOT_FOUND" && error?.name !== "SyntaxError" && /command|register|schema/i.test(String(error.message)));
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

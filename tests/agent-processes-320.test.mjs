// Module: MOD-agent-processes
// Level: unit
// Guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011; UC-017; UC-044

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { Agent, installedAgents, testAgent } from "../src/agent-processes/index.mjs";

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
  cpSync(join(root, "src", "agent-processes"), join(folder, "agent-processes"), { recursive: true });
  const path = join(folder, "agent-processes", "agents.md");
  writeFileSync(path, mutate(readFileSync(path, "utf8")));
  return join(folder, "agent-processes", "index.mjs");
};

// TST-320001
// level: unit
// module: MOD-agent-processes
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-011; UC-017
// given: a controlled PATH containing only register-named Claude, Codex and OpenCode executables whose version and harmless login-status outputs are constructed.
// input: installedAgents() reads the public register and performs its discovery checks.
// expect: each installed agent carries its register name, installed version and observed own-login outcome; no fixture receives a task.
test("TST-320001: discovery reports register agents' version and own-login outcomes", async () => {
  const folder = fixture();
  try {
    for (const [name, version, login] of [["claude", "2.1.300", "logged-in"], ["codex", "1.2.3", "logged-in"], ["opencode", "1.0.0", "provider-a"]]) {
      command(folder, name, `case \"$1\" in --version) echo ${version};; auth) echo ${login};; login) echo ${login};; *) exit 64;; esac`);
    }
    const agents = await withPath(folder, () => installedAgents());
    assert.deepEqual(agents.map(({ name, version, login }) => ({ name, version, login })), [
      { name: "claude", version: "2.1.300", login: "logged-in" },
      { name: "codex", version: "1.2.3", login: "logged-in" },
      { name: "opencode", version: "1.0.0", login: "provider-a" },
    ]);
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
    command(folder, "claude", "case \"$1\" in --version) echo 2.1.300;; auth) echo logged-in;; *) exit 64;; esac");
    const agents = await withPath(folder, () => installedAgents());
    assert.equal(agents.find((agent) => agent.name === "claude").installed, true);
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
    command(folder, "claude", `printf '%s\\n' \"$@\" > ${record}; echo yes`);
    const answer = await withPath(folder, () => testAgent(Agent("claude"), folder));
    assert.equal(answer.answer, "yes");
    const invocation = readFileSync(record, "utf8");
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
    command(folder, "claude", "echo refused >&2; exit 23");
    await withPath(folder, () => assert.rejects(testAgent(Agent("claude"), folder), /refused|agent/i));
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
    const entry = registerFixture(folder, (text) => text.replace(/^\| claude \|[^\n]*\n/m, ""));
    await assert.rejects(import(`${new URL(`file://${entry}`).href}?corrupt=1`));
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

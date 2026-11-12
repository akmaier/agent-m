// A coding agent kept running in a pseudo-terminal — MOD-agent-processes' startSession as docs/architecture/MOD-agent-processes.md states it (ARC-055):
// "starts the agent in a pseudo-terminal, with its row's Session arguments, `participant.model` by its Model column and `chrome` as `agentDriver` takes it, in
// `workdir`, through the enclosure's `wrap` where one is given, as `agentDriver` starts it; no task is written to it"; "`type` types `text` into the terminal
// as one input; `onLine` hands each line, as the terminal shows it, once it has scrolled off the screen; `screen` the lines the screen shows now; `answer` the
// text the agent printed after the last typed text, once its screen shows the row's `waiting` pattern, else `null`; `stop` ends the agent and every process it
// started"; "It throws `AgentMissing`, `ModelUnsupported` and `AgentNotLoggedIn` before it starts." And the register's Session and Chrome columns, and
// agentDriver's `chrome` (UC-044 step 3).
// Run: node --test tests/agent-processes-sessions.test.mjs
//
// Module: MOD-agent-processes
// Guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; A CANCELLED JOB WRITES NOTHING MORE; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-049; UC-044
// Level: unit
//
// Only controlled executables run: the fixture agent of tests/agent-processes.d/terminal-agent.mjs on a PATH of its own, in a real pseudo-terminal (node-pty of
// the Bridge's packages). The Session arguments and waiting lines of the three supported agents are those measured on Claude Code 2.1.322, Codex 0.167.2 and
// opencode 2.2.5 in a pseudo-terminal of 120 columns, written here as literals. Where the module file leaves a reading open, the test states the one it takes:
//   - "the text the agent printed after the last typed text": the lines after the screen's echo of the typed text's last line, up to the waiting line, which
//     must be one the screen did not show when the text was typed.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { agentDriver, startSession } from "../src/agent-processes/index.mjs";
import { sessionOf } from "../src/agent-processes/sessions.mjs";
import { loadSchema, readRegister } from "../src/documents/index.mjs";
import { terminalAgent, WAITING } from "./agent-processes.d/terminal-agent.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const install = { macos: "https://example.invalid/", windows: "https://example.invalid/", linux: "https://example.invalid/" };
const agent = (name, over = {}) => ({ name, installed: true, version: "9.9.9", loggedIn: true, login: `${name} login`, keeps: null, chrome: name !== "opencode", install, ...over });
const participant = (model = null) => ({ name: "mac:claude", type: "CLI agent", model, context: 200000, capabilities: ["draft text"], place: "this machine", route: "bridge mac agent claude" });

// A world: a PATH that holds the fixture agents only, the files they write, and the working folder.
function world(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-sessions-")));
  const bin = join(root, "bin"), workdir = join(root, "work");
  mkdirSync(bin);
  mkdirSync(workdir);
  for (const name of ["claude", "codex", "opencode"]) terminalAgent(bin, name);
  const files = { FIXTURE_ARGV: join(root, "argv.json"), FIXTURE_TOLD: join(root, "told.txt"), FIXTURE_CHILD: join(root, "child.pid") };
  const prior = { PATH: process.env.PATH, ...Object.fromEntries(Object.keys(files).map((key) => [key, process.env[key]])) };
  Object.assign(process.env, { PATH: `${bin}:/bin:/usr/bin`, ...files });
  const opened = [];
  t.after(async () => {
    for (const session of opened) await session.stop().catch(() => {});
    for (const [key, value] of Object.entries(prior)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    rmSync(root, { recursive: true, force: true });
  });
  const read = (file) => (existsSync(files[file]) ? readFileSync(files[file], "utf8") : null);
  return { root, workdir, read, keep: (session) => { opened.push(session); return session; } };
}

const until = async (check, what, limit = 15000) => {
  for (const end = Date.now() + limit; Date.now() < end;) {
    const value = check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`timed out waiting for ${what}`);
};
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };

// TST-20261112551 · level: unit · module: MOD-agent-processes
// guards: UC-049; UC-044
// given: the production register of supported agents and its schema, read through MOD-documents
// input: the schema's columns and each row's Session and Chrome cells
// expect: the schema names Session and Chrome; claude's Session gives ["--permission-mode", "auto", "--settings", "{\"tui\":\"default\"}"], codex's ["--approve-for-me", "--no-alt-screen", "-c", "check_for_update_on_startup=false", "-c", "projects={'{workdir}'={trust_level=\"trusted\"}}"] and opencode's ["--auto"]; each row's `waiting` matches the line that agent's screen was measured to show when it waits after a message, and none matches another agent's line or a line shown while it works ("✽ Flowing… (2s · thinking)", "• Working (1s • esc to interrupt)", "■■■■■■⬝⬝ esc interrupt"); Chrome gives claude ["--chrome"], codex ["--enable", "browser_use_external"] and opencode `—`
test("TST-20261112551: the register names how each agent is started interactively in its auto mode, the line that shows it waits, and its Chrome integration", () => {
  const schema = loadSchema(readFileSync(join(ROOT, "src/agent-processes/agents.schema.md"), "utf8"), "MOD-agent-processes");
  const { rows } = readRegister(schema, "src/agent-processes/agents.md", readFileSync(join(ROOT, "src/agent-processes/agents.md"), "utf8"));
  const columns = schema.sections[0].table.columns.map(({ name }) => name);
  assert.ok(columns.includes("Session") && columns.includes("Chrome"), columns.join(", "));
  const cells = Object.fromEntries(rows.map(({ cells: each }) => [each.Agent, each]));
  const session = (name) => JSON.parse(cells[name].Session);
  assert.deepEqual(session("claude").args, ["--permission-mode", "auto", "--settings", "{\"tui\":\"default\"}"]);
  assert.deepEqual(session("codex").args, ["--approve-for-me", "--no-alt-screen", "-c", "check_for_update_on_startup=false", "-c", "projects={'{workdir}'={trust_level=\"trusted\"}}"]);
  assert.deepEqual(session("opencode").args, ["--auto"]);
  const working = ["✽ Flowing… (2s · thinking)", "• Working (1s • esc to interrupt)", "   ■■■■■■⬝⬝ esc interrupt", "❯ ", "› Ask Codex to do anything"];
  for (const name of ["claude", "codex", "opencode"]) {
    const waiting = new RegExp(session(name).waiting);
    assert.ok(waiting.test(WAITING[name]), `${name} waits: ${WAITING[name]}`);
    for (const other of Object.keys(WAITING).filter((each) => each !== name)) assert.equal(waiting.test(WAITING[other]), false, `${name}'s pattern is not ${other}'s line`);
    for (const line of working) assert.equal(waiting.test(line), false, `${name}'s pattern does not match the working line ${line}`);
  }
  assert.deepEqual(JSON.parse(cells.claude.Chrome).args, ["--chrome"]);
  assert.deepEqual(JSON.parse(cells.codex.Chrome).args, ["--enable", "browser_use_external"]);
  assert.ok(cells.opencode.Chrome === undefined || cells.opencode.Chrome === "—", "opencode has none: `—`, which the register reads as an empty cell");
});

// TST-20261112552 · level: unit · module: MOD-agent-processes
// guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; UC-049; UC-044
// given: the fixture claude and codex in a pseudo-terminal; the participant mac:claude of the model claude-opus-5-5
// input: startSession(claude, { workdir, chrome: true }, mac:claude); then startSession(codex, { workdir, chrome: false }, the participant without a model)
// expect: claude is started with ["--permission-mode", "auto", "--settings", "{\"tui\":\"default\"}", "--model", "claude-opus-5-5", "--chrome"] and no task is written to it — its screen shows its banner and nothing of a message; codex with its Session arguments, `{workdir}` given as the working folder, and no --model and no Chrome arguments
test("TST-20261112552: a session is started with its row's Session arguments, its participant's model and, where chosen, its Chrome integration, and no task", async (t) => {
  const it = world(t);
  const claude = it.keep(startSession(agent("claude"), { workdir: it.workdir, chrome: true }, participant("claude-opus-5-5")));
  await until(() => claude.screen().some((line) => line.includes("fixture claude ready")), "claude's banner");
  assert.deepEqual(JSON.parse(it.read("FIXTURE_ARGV")), ["--permission-mode", "auto", "--settings", "{\"tui\":\"default\"}", "--model", "claude-opus-5-5", "--chrome"]);
  assert.equal(it.read("FIXTURE_TOLD"), null, "no task is written to it");
  await claude.stop();
  const codex = it.keep(startSession(agent("codex"), { workdir: it.workdir, chrome: false }, participant()));
  await until(() => codex.screen().some((line) => line.includes("fixture codex ready")), "codex's banner");
  assert.deepEqual(JSON.parse(it.read("FIXTURE_ARGV")), ["--approve-for-me", "--no-alt-screen", "-c", "check_for_update_on_startup=false", "-c", `projects={'${it.workdir}'={trust_level="trusted"}}`]);
});

// TST-20261112553 · level: unit · module: MOD-agent-processes
// guards: UC-049
// given: the fixture claude in a pseudo-terminal of 40 rows, started and waiting
// input: type a text of three lines whose last is "split the requirement", which also asks for BANNER-LINES 60; then type "and the next one"
// expect: the agent takes the three lines as one message (FIXTURE_TOLD holds them, then the end marker, once); answer() is null right after the typing and, once the screen shows the waiting line, "numbered line 1" … "numbered line 60" followed by "answer to split the requirement." — what the agent printed after the echo of the text, without the echo and without the waiting line; onLine handed the lines that scrolled off — the banner and "numbered line 1" among them, in order — and screen() shows the waiting line; the second message's answer is "answer to and the next one." alone: the waiting line the screen showed when it was typed does not count
test("TST-20261112553: a text is typed as one input, and the answer is what the agent printed after it once its screen shows that it waits", async (t) => {
  const it = world(t);
  const session = it.keep(startSession(agent("claude"), { workdir: it.workdir }, participant()));
  const scrolled = [];
  session.onLine((line) => scrolled.push(line));
  session.type("Context of the page.\nBANNER-LINES 60\nsplit the requirement");
  assert.equal(session.answer(), null, "nothing is answered yet");
  const first = await until(() => session.answer(), "the first answer");
  const numbered = Array.from({ length: 60 }, (_, index) => `numbered line ${index + 1}`);
  assert.equal(first, [...numbered, "answer to split the requirement."].join("\n"));
  assert.equal(it.read("FIXTURE_TOLD"), "Context of the page.\nBANNER-LINES 60\nsplit the requirement\n--- end of message ---\n");
  assert.ok(scrolled.indexOf("fixture claude ready") >= 0 && scrolled.indexOf("fixture claude ready") < scrolled.indexOf("numbered line 1"), scrolled.slice(0, 5).join(" | "));
  assert.ok(session.screen().includes(WAITING.claude), session.screen().join("\n"));
  session.type("and the next one");
  assert.equal(session.answer(), null, "counter-proof: the waiting line already shown does not answer the new text");
  assert.equal(await until(() => session.answer(), "the second answer"), "answer to and the next one.");
});

// TST-20261112554 · level: unit · module: MOD-agent-processes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: the fixture opencode in a pseudo-terminal, which, asked so, starts a child that sleeps and writes its process id
// input: type "SPAWN-CHILD"; once answered, stop(); then a second session typed "/exit 3"
// expect: after stop() neither the agent nor its child is alive and `exited` has resolved; the second session's `exited` resolves with { exitCode: 3 } by itself, and its screen still shows "bye"
test("TST-20261112554: stop ends the agent and every process it started; an agent that exits by itself names its exit", async (t) => {
  const it = world(t);
  const session = it.keep(startSession(agent("opencode"), { workdir: it.workdir }, participant()));
  session.type("SPAWN-CHILD");
  await until(() => session.answer(), "the answer");
  const child = Number(it.read("FIXTURE_CHILD"));
  assert.ok(alive(child), "the child runs");
  await session.stop();
  await session.exited;
  await until(() => !alive(child), "the child ended", 5000);
  const second = it.keep(startSession(agent("opencode"), { workdir: it.workdir }, participant()));
  second.type("/exit 3");
  assert.deepEqual(await second.exited, { exitCode: 3 });
  assert.ok(second.screen().includes("bye"), second.screen().join("\n"));
});

// TST-20261112555 · level: unit · module: MOD-agent-processes
// guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// given: the fixture claude; sessions.mjs' sessionOf with a row of the register whose Model is `—` (null); and, as the known positive, startSession of claude logged in and installed
// input: startSession of claude not installed; of claude not logged in; sessionOf with the row without a model and a participant that names one
// expect: AgentMissing, AgentNotLoggedIn and ModelUnsupported are thrown, each before the agent starts — FIXTURE_ARGV is not written —; the known positive starts it
test("TST-20261112555: an agent that is missing, not logged in or cannot be told the model is refused before it starts", async (t) => {
  const it = world(t);
  assert.throws(() => startSession(agent("claude", { installed: false }), { workdir: it.workdir }, participant()), { name: "AgentMissing" });
  assert.throws(() => startSession(agent("claude", { loggedIn: false }), { workdir: it.workdir }, participant()), { name: "AgentNotLoggedIn" });
  const row = { name: "claude", command: "claude", session: { args: [], waiting: "^waits$" }, model: null, chrome: null };
  const helpers = { configuration: () => row, ownLoginEnvironment: () => ({ ...process.env }) };
  assert.throws(() => sessionOf(agent("claude"), { workdir: it.workdir }, participant("claude-opus-5-5"), helpers), { name: "ModelUnsupported" });
  assert.equal(it.read("FIXTURE_ARGV"), null, "nothing was started");
  const started = it.keep(startSession(agent("claude"), { workdir: it.workdir }, participant()));
  await until(() => it.read("FIXTURE_ARGV"), "the known positive starts");
  await started.stop();
});

// TST-20261112556 · level: unit · module: MOD-agent-processes
// guards: UC-044; UC-049
// given: a fixture claude for agentDriver that records its arguments and answers its task as the register's Task column reads it
// input: agentDriver(claude, { workdir, keyVariable: null, chrome: true }, the participant without a model).send(a task); the same with chrome false; and opencode, whose Chrome is `—`, with chrome true
// expect: claude is started with ["-p", "--output-format", "json", "--chrome"], then with ["-p", "--output-format", "json"]; opencode with its Task arguments alone
test("TST-20261112556: agentDriver starts an agent with its Chrome integration where the Bridge's setting asks for it and the agent has one", async (t) => {
  const it = world(t);
  const bin = join(it.root, "task-bin");
  mkdirSync(bin);
  const { writeFileSync } = await import("node:fs");
  for (const name of ["claude", "opencode"]) {
    const answer = name === "claude" ? JSON.stringify({ type: "result", result: "done" }) : JSON.stringify({ type: "text", part: { text: "done" } });
    writeFileSync(join(bin, name), `#!/bin/sh\n/bin/cat > /dev/null\nprintf '%s' "$*" > '${join(it.root, `${name}-args.txt`)}'\necho '${answer}'\n`, { mode: 0o755 });
  }
  process.env.PATH = `${bin}:/bin:/usr/bin`;
  const input = { prompt: "fixture task", parts: [], output: null, findings: [], previous: null, workdir: null };
  const args = (name) => readFileSync(join(it.root, `${name}-args.txt`), "utf8");
  await agentDriver(agent("claude"), { workdir: it.workdir, keyVariable: null, endpoint: null, chrome: true }, participant()).send(input);
  assert.equal(args("claude"), "-p --output-format json --chrome");
  await agentDriver(agent("claude"), { workdir: it.workdir, keyVariable: null, endpoint: null, chrome: false }, participant()).send(input);
  assert.equal(args("claude"), "-p --output-format json");
  await agentDriver(agent("opencode"), { workdir: it.workdir, keyVariable: null, endpoint: null, chrome: true }, participant()).send(input);
  assert.equal(args("opencode"), "run --format json --standalone");
});

// TST-20261112557 · level: unit · module: MOD-agent-processes
// guards: UC-044; THE BRIDGE FINDS THE INSTALLED AGENTS
// given: the fixture claude, codex and opencode installed on the PATH
// input: installedAgents()
// expect: each is installed; `chrome` is true for claude and codex, whose Chrome column names an integration, and false for opencode, whose Chrome is `—`
test("TST-20261112557: an installed agent says whether it has a Chrome integration", async (t) => {
  world(t);
  const { installedAgents } = await import("../src/agent-processes/index.mjs");
  const found = await installedAgents();
  assert.deepEqual(found.map(({ name, installed, chrome }) => [name, installed, chrome]), [["claude", true, true], ["codex", true, true], ["opencode", true, false]]);
});

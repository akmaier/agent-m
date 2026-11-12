// The coding agent started with its participant's model — MOD-agent-processes' agentDriver as docs/architecture/MOD-agent-processes.md states
// it: the register's Model column gives the arguments that start an agent with a named model, with the placeholder `{model}`, or `—`; `send`
// starts the agent with `participant.model` given by that column; an agent whose Model is `—` refuses a participant that names a model with
// ModelUnsupported, before it starts.
// Run: node --test tests/agent-processes-model.test.mjs
//
// Module: MOD-agent-processes
// Guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; UC-044; UC-049
// Level: unit
//
// Only controlled executables run: a fixture `claude` on a PATH of its own records its arguments. The model options of the three supported
// agents are those their vendors document — `claude --model <model>`, `codex exec --model <model>`, `opencode run --model <model>` (each
// CLI's --help on this machine) —, written here as literals. Each test states its input and its expected result before it runs.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { agentDriver } from "../src/agent-processes/index.mjs";
import { processDriver } from "../src/agent-processes/processes.mjs";
import { loadSchema, readRegister } from "../src/documents/index.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REGISTER = "src/agent-processes/agents.md";
const SCHEMA = "src/agent-processes/agents.schema.md";
const PARTICIPANT = { name: "developer-a", type: "CLI agent", model: "claude-opus-5-5", context: 200000,
  capabilities: ["draft text", "run code and tests"], place: "this machine", route: "bridge lab agent claude" };
const AGENT = { name: "claude", installed: true, version: "2.0.0", loggedIn: true,
  install: { macos: "https://example.invalid/", windows: "https://example.invalid/", linux: "https://example.invalid/" } };
const INPUT = { prompt: "fixture task", parts: [], output: null, findings: [], previous: null, workdir: null };

async function fixture(work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-model-")));
  const bin = join(root, "bin"), workdir = join(root, "work"), record = join(root, "argv.json");
  mkdirSync(bin);
  mkdirSync(workdir);
  const script = join(bin, "claude-fixture.mjs");
  writeFileSync(script, `
    import { writeFileSync } from "node:fs";
    for await (const _ of process.stdin) {}
    writeFileSync(${JSON.stringify(record)}, JSON.stringify(process.argv.slice(2)));
    process.stdout.write(JSON.stringify({ type: "result", result: "done" }) + "\\n");
  `);
  writeFileSync(join(bin, "claude"), `#!/bin/sh\nexec '${process.execPath}' '${script}' "$@"\n`, { mode: 0o755 });
  const prior = { PATH: process.env.PATH, CI: process.env.CI, GITHUB_ACTIONS: process.env.GITHUB_ACTIONS };
  process.env.PATH = bin;
  delete process.env.CI;
  delete process.env.GITHUB_ACTIONS;
  try {
    await work({ workdir, argv: () => JSON.parse(readFileSync(record, "utf8")), started: () => { try { readFileSync(record); return true; } catch { return false; } } });
  } finally {
    for (const [name, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    rmSync(root, { recursive: true, force: true });
  }
}

// TST-20261109141 · level: unit · module: MOD-agent-processes
// guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL
// given: the production register of supported agents and its schema, read through MOD-documents
// input: the schema's columns and each row's Model cell
// expect: the schema names the column Model; claude's, codex's and opencode's Model each give the arguments ["--model", "{model}"]
test("the register names, for each supported agent, the arguments that start it with a named model", () => {
  const schema = loadSchema(readFileSync(join(ROOT, SCHEMA), "utf8"), "MOD-agent-processes");
  const { rows } = readRegister(schema, REGISTER, readFileSync(join(ROOT, REGISTER), "utf8"));
  assert.ok(schema.sections[0].table.columns.some(({ name }) => name === "Model"));
  assert.deepEqual(rows.map(({ cells }) => [cells.Agent, JSON.parse(cells.Model).args]), [
    ["claude", ["--model", "{model}"]], ["codex", ["--model", "{model}"]], ["opencode", ["--model", "{model}"]]]);
});

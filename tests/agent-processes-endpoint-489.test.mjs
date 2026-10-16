// Module: MOD-agent-processes
// Level: unit
// Guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-049
// Only controlled executables run. Expected options are literals, not read from requirements or architecture documents.

import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { agentDriver } from "../src/agent-processes/index.mjs";
import { loadSchema, readRegister, writeDocument } from "../src/documents/index.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REGISTER = "src/agent-processes/agents.md";
const SCHEMA = "src/agent-processes/agents.schema.md";
const KEY_VARIABLE = "ITM489_FIXTURE_KEY";
const PARTICIPANT = { name: "fixture-endpoint-agent", type: "CI agent", model: "fixture-model", context: 200000,
  price: null, capabilities: ["draft text", "run code and tests"], place: "fixture", route: "ci hosted secret ITM489_FIXTURE_KEY" };
const AGENT = { name: "opencode", installed: true, version: "1.19.0", loggedIn: false,
  install: { macos: "https://opencode.ai/docs/", windows: "https://opencode.ai/docs/", linux: "https://opencode.ai/docs/" } };
const INPUT = { prompt: "ITM489 fixture task", parts: [], output: null, findings: [], previous: null, workdir: null };

function registerAt(root) {
  const schema = loadSchema(readFileSync(join(root, SCHEMA), "utf8"), "MOD-agent-processes");
  return { schema, ...readRegister(schema, REGISTER, readFileSync(join(root, REGISTER), "utf8")) };
}

async function fixture(work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-489-")));
  const bin = join(root, "bin"), workdir = join(root, "work"), record = join(root, "calls.jsonl");
  mkdirSync(bin);
  mkdirSync(workdir);
  const script = join(bin, "opencode-fixture.mjs");
  writeFileSync(script, `
    import { appendFileSync } from "node:fs";
    const call = { argv: process.argv.slice(2), cwd: process.cwd(), config: process.env.OPENCODE_CONFIG_CONTENT ?? null,
      hasNamedKey: process.env.ITM489_FIXTURE_KEY === "constructed-itm489-key" };
    appendFileSync(${JSON.stringify(record)}, JSON.stringify(call) + "\\n");
    process.stdout.write(JSON.stringify({ type: "text", part: { text: JSON.stringify(call) } }) + "\\n");
  `);
  writeFileSync(join(bin, "opencode"), `#!/bin/sh\nexec '${process.execPath}' '${script}' "$@"\n`, { mode: 0o755 });
  const values = { PATH: bin, CI: "true", GITHUB_ACTIONS: undefined, OPENCODE_CONFIG_CONTENT: undefined,
    [KEY_VARIABLE]: "constructed-itm489-key" };
  const prior = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  try {
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await work({ root, workdir, calls: () => readFileSync(record, "utf8").trim().split("\n").map(JSON.parse) });
  } finally {
    for (const [name, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    rmSync(root, { recursive: true, force: true });
  }
}

// TST-489001
// level: unit
// module: MOD-agent-processes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-049
// given: the production supported-agent register and its schema, read through MOD-documents
// input: read every supported agent's Endpoint cell
// expect: claude, codex and opencode each declare a nonempty Endpoint cell, whose unsupported form may be the literal dash
test("TST-489001: every supported-agent row declares Endpoint", () => {
  const { rows } = registerAt(ROOT);
  assert.deepEqual(rows.map(({ cells }) => cells.Agent), ["claude", "codex", "opencode"]);
  for (const { cells } of rows) {
    assert.equal(typeof cells.Endpoint, "string", `${cells.Agent} has an Endpoint column`);
    assert.ok(cells.Endpoint.trim(), `${cells.Agent} declares endpoint options or the unsupported marker`);
  }
});

// TST-489002
// level: unit
// module: MOD-agent-processes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-049
// given: a fixture-only opencode executable, an installed agent without saved login, and a constructed named CI key
// input: public agentDriver.send with OpenAI-compatible and Anthropic endpoint address/model options and keyVariable
// expect: each process receives its endpoint address and model, the matching documented provider, and the key's environment reference, never its value in options; task and working folder are retained
test("TST-489002: endpoint options and the named key reference reach the coding agent", async (t) => {
  for (const kind of ["openai-compatible", "anthropic"]) {
    await t.test(kind, async () => fixture(async ({ workdir, calls }) => {
      const endpoint = { kind, baseUrl: `https://${kind}.fixture.invalid/v1`, model: "fixture-model" };
      const result = await agentDriver(AGENT, { workdir, keyVariable: KEY_VARIABLE, endpoint }, PARTICIPANT).send(INPUT);
      const call = JSON.parse(result.text);
      assert.equal(calls().length, 1, "one send starts one controlled task");
      assert.equal(call.cwd, workdir);
      assert.equal(call.argv.filter((arg) => arg === INPUT.prompt).length, 1, "the complete task reaches the fixture once");
      assert.equal(call.hasNamedKey, true, "the fixture inherits the named CI key");
      const config = JSON.parse(call.config ?? "{}");
      const selected = Object.entries(config.provider ?? {}).find(([, provider]) => provider.options?.baseURL === endpoint.baseUrl);
      assert.ok(selected, "the requested endpoint address must reach the agent's provider configuration");
      const [providerId, provider] = selected;
      assert.equal(provider.options.apiKey, "{env:ITM489_FIXTURE_KEY}", "the configuration references the key by name only");
      assert.ok(Object.hasOwn(provider.models ?? {}, "fixture-model"), "the endpoint's model is declared");
      const modelFlag = call.argv.findIndex((arg) => arg === "--model" || arg === "-m");
      assert.equal(modelFlag < 0 ? config.model : call.argv[modelFlag + 1], `${providerId}/fixture-model`);
      if (kind === "openai-compatible") assert.equal(provider.npm, "@ai-sdk/openai-compatible");
      else assert.ok(providerId === "anthropic" || provider.npm === "@ai-sdk/anthropic", "the Anthropic protocol is selected");
      assert.equal(JSON.stringify({ argv: call.argv, config }).includes("constructed-itm489-key"), false, "no secret value enters options");
    }));
  }
});

// TST-489003
// level: unit
// module: MOD-agent-processes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-049
// given: a copied production register whose opencode Endpoint is set to the unsupported marker, and a controlled executable
// input: send once with endpoint omitted, then send with an endpoint through the same public driver
// expect: the omitted-endpoint task starts normally; the endpoint task throws EndpointUnsupported and starts no additional process
test("TST-489003: an unsupported register row refuses an endpoint before spawning", async () => fixture(async ({ root, workdir, calls }) => {
  const copied = join(root, "copied");
  cpSync(join(ROOT, "src"), join(copied, "src"), { recursive: true, filter: (path) => !path.includes("/node_modules") });
  const { schema, document, rows } = registerAt(copied);
  const row = rows.find(({ cells }) => cells.Agent === "opencode");
  assert.equal(typeof row?.cells.Endpoint, "string", "the production register declares the Endpoint fixture input");
  for (const section of document.sections) {
    for (const each of section.rows ?? []) if (each.cells.Agent === "opencode") each.cells.Endpoint = "\u2014";
  }
  writeFileSync(join(copied, REGISTER), writeDocument(schema, document));
  const copiedModule = await import(pathToFileURL(join(copied, "src/agent-processes/index.mjs")).href);
  const omitted = copiedModule.agentDriver(AGENT, { workdir, keyVariable: KEY_VARIABLE }, PARTICIPANT);
  assert.equal(JSON.parse((await omitted.send(INPUT)).text).config, null, "known positive: no endpoint keeps the ordinary task");
  assert.equal(calls().length, 1, "known positive: the fixture executable was started");
  await assert.rejects(async () => copiedModule.agentDriver(AGENT, { workdir, keyVariable: KEY_VARIABLE,
    endpoint: { kind: "openai-compatible", baseUrl: "https://unsupported.fixture.invalid/v1", model: "fixture-model" } }, PARTICIPANT).send(INPUT),
  { name: "EndpointUnsupported" });
  assert.equal(calls().length, 1, "the refused endpoint starts no additional process");
}));

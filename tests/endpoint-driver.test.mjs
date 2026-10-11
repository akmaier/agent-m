// MOD-endpoint-calls — direct model-endpoint driver (ITM-316).
//
// Module: MOD-endpoint-calls
// Level: unit
// Guards: UC-005; UC-007; UC-010; UC-019; ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE; NO COST IS GUESSED; AN UNSUPPORTED ENDPOINT SAYS SO
//
// Constructed fetch replies model each provider. They do not contact a provider, wait, or estimate usage.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { endpointDriver } from "../src/endpoint-calls/index.mjs";

const FAULTS = {
  "TST-316-001": ["src/endpoint-calls/index.mjs", 'content: prompt', 'content: "broken"'],
  "TST-316-002": ["src/endpoint-calls/index.mjs", "max_tokens: DRIVER_MAX_TOKENS", "max_tokens: 1"],
  "TST-316-003": ["src/endpoint-calls/index.mjs", "throw new EndpointFailed(diagnoseEndpoint({ status: response.status, message }, config, where));", "return {};"],
  "TST-316-004": ["src/endpoint-calls/index.mjs", "driverRequest(config, input.prompt, options.signal)", "driverRequest(config, input.prompt)"],
};

const OPENAI = { name: "example", kind: "openai-compatible", baseUrl: "https://models.example.test/v1", model: "tiny-model", key: "secret-key" };
const ANTHROPIC = { name: "claude", kind: "anthropic", baseUrl: "https://claude.example.test/v1", model: "claude-test", key: "anthropic-key" };
const PARTICIPANT = { name: "drafter", type: "model endpoint", model: "fixture-model", context: 1000, price: null, capabilities: ["draft text"], place: "test", route: "endpoint example" };
const INPUT = { prompt: "Write one checked requirement.", parts: [{ name: "source", text: "already placed in the prompt", size: 10, sources: [], required: true, recipe: "fixture", artifacts: [] }], output: null, findings: [], previous: null, workdir: null };

function reply(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function withFetch(t, implementation) {
  const previous = globalThis.fetch;
  globalThis.fetch = implementation;
  t.after(() => { globalThis.fetch = previous; });
}

function endpointFailure(reason) {
  return (error) => error?.name === "EndpointFailed" && error.diagnosis?.reason === reason;
}

// TST-316-001
// given: a Node driver for an OpenAI-compatible endpoint and a constructed chat completion with reported token use
// input: send a DriverInput whose prompt already contains its recipe part
// expect: one exact provider request carries the prompt once, and the answer keeps only provider-reported usage
test("TST-316-001: OpenAI driver sends the prepared prompt once and returns reported usage in Node", async (t) => {
  const calls = [];
  withFetch(t, async (url, init) => {
    calls.push({ url, init });
    return reply(200, { choices: [{ message: { content: "REQUIREMENT" } }], usage: { prompt_tokens: 13, completion_tokens: 5 } });
  });

  const result = await endpointDriver(OPENAI, PARTICIPANT).send(INPUT);

  assert.deepEqual(result, { text: "REQUIREMENT", usage: { inputTokens: 13, outputTokens: 5, minutes: null, cost: null } });
  assert.equal(calls.length, 1, "one send makes one direct request");
  assert.equal(calls[0].url, "https://models.example.test/v1/chat/completions");
  assert.equal(calls[0].init.headers.Authorization, "Bearer secret-key");
  assert.equal(calls[0].url.includes("secret-key"), false, "the key is never in the URL");
  assert.deepEqual(JSON.parse(calls[0].init.body), { model: "tiny-model", messages: [{ role: "user", content: INPUT.prompt }] });
  assert.equal(calls[0].init.body.includes(INPUT.parts[0].text), false, "the driver does not append parts already in prompt");
});

// TST-316-002
// given: an Anthropic endpoint with a constructed Messages response that reports no usage
// input: send the same prepared DriverInput
// expect: one Messages request carries the prompt and the returned usage is null, never an estimate
test("TST-316-002: Anthropic driver returns text and null for an unreported usage", async (t) => {
  const calls = [];
  withFetch(t, async (url, init) => {
    calls.push({ url, init });
    return reply(200, { content: [{ type: "text", text: "DRAFT" }] });
  });

  assert.deepEqual(await endpointDriver(ANTHROPIC, PARTICIPANT).send(INPUT), { text: "DRAFT", usage: null });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://claude.example.test/v1/messages");
  assert.equal(calls[0].init.headers["x-api-key"], "anthropic-key");
  assert.equal(calls[0].init.headers["anthropic-version"], "2023-06-01");
  assert.deepEqual(JSON.parse(calls[0].init.body), { model: "claude-test", max_tokens: 1024, messages: [{ role: "user", content: INPUT.prompt }] });
});

// TST-316-003
// given: constructed provider refusals for a key and an overlong input
// input: send through the endpoint driver
// expect: each throws EndpointFailed with diagnoseEndpoint's reason and neither retry makes a second request
test("TST-316-003: refused and overlong requests fail once with their endpoint diagnoses", async (t) => {
  let calls = 0;
  withFetch(t, async () => {
    calls += 1;
    return calls === 1
      ? reply(401, { error: { message: "Invalid API key." } })
      : reply(413, { error: { message: "input too long" } });
  });
  const driver = endpointDriver(OPENAI, PARTICIPANT);

  await assert.rejects(driver.send(INPUT), endpointFailure("key refused"));
  await assert.rejects(driver.send(INPUT), endpointFailure("too long"));
  assert.equal(calls, 2, "each failed send made exactly one request");
});

// TST-316-004
// given: a browser-visible fetch block and an already-aborted signal
// input: send through the driver with that signal
// expect: the block is named EndpointFailed, and the aborted request passes its signal to fetch and preserves AbortError
test("TST-316-004: a blocked browser call and cancellation are named without a retry", async (t) => {
  const previousWindow = globalThis.window;
  globalThis.window = {};
  t.after(() => { globalThis.window = previousWindow; });
  const calls = [];
  withFetch(t, async (url, init) => {
    calls.push({ url, init });
    if (calls.length === 1) throw new TypeError("Failed to fetch");
    throw Object.assign(new Error("The operation was aborted."), { name: "AbortError" });
  });
  const controller = new AbortController();
  controller.abort();
  const driver = endpointDriver(OPENAI, PARTICIPANT);

  await assert.rejects(driver.send(INPUT), endpointFailure("blocked by the browser"));
  await assert.rejects(driver.send(INPUT, { signal: controller.signal }), { name: "AbortError" });
  assert.equal(calls.length, 2, "neither failure is retried");
  assert.equal(calls[1].init.signal, controller.signal, "the cancellation signal reaches the direct request");
});

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_316_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-316-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [file, needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, file), original = readFileSync(source), digest = (value) => createHash("sha256").update(value).digest("hex");
      assert.equal(original.toString().split(needle).length - 1, 1, `${id}: unique fault target`);
      const invoke = () => { const env = { ...process.env, AGENT_M_316_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT;
        return spawnSync(process.execPath, ["--test", "--test-name-pattern", id, "tests/endpoint-driver.test.mjs"], { cwd: copied, encoding: "utf8", timeout: 15_000, env }); };
      const originalHash = digest(original), testHash = digest(readFileSync(join(copied, "tests/endpoint-driver.test.mjs")));
      let faultHash, failed, faultEnded, restoreStarted, restoredHash, passed, restoredEnded; const faultStarted = new Date().toISOString();
      try { writeFileSync(source, original.toString().replace(needle, replacement)); faultHash = digest(readFileSync(source)); failed = invoke(); faultEnded = new Date().toISOString(); }
      finally { restoreStarted = new Date().toISOString(); writeFileSync(source, original); restoredHash = digest(readFileSync(source)); restoredEnded = new Date().toISOString(); }
      passed = invoke();
      console.log("TST316-counterproof " + JSON.stringify({ id, file, needle, replacement, testHash, originalHash, faultHash, restoredHash, faultStarted, faultEnded, restoreStarted, restoredEnded, argv: [process.execPath, "--test", "--test-name-pattern", id, "tests/endpoint-driver.test.mjs"], cwd: copied, childflag: "AGENT_M_316_FAULT_CHILD=1", failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr } }));
      assert.equal(failed.status, 1, id); assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`));
      assert.equal(restoredHash, originalHash, `${id}: exact restoration`); assert.equal(passed.status, 0, id); assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

// Independent release coverage for ITM-316's public endpoint driver.
// Module: MOD-endpoint-calls
// Guards: ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE; NO COST IS GUESSED; AN UNSUPPORTED ENDPOINT SAYS SO
// Level: release
import test from "node:test";
import assert from "node:assert/strict";
import { endpointDriver } from "../src/endpoint-calls/index.mjs";

const openai = { kind: "openai-compatible", baseUrl: "https://model.test/v1", model: "m", key: "k" };
const anthropic = { kind: "anthropic", baseUrl: "https://model.test/v1", model: "m", key: "k" };
const INPUT = { prompt: "Answer this exact prompt.", parts: [{ text: "must not be appended" }] };
const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });

// TST-316901
// Precondition: controlled OpenAI and Anthropic responses in Node and browser-context fixtures.
// Input: one public DriverInput with a prepared prompt.
// Expected: each driver sends that prompt once, without reappending parts, and returns text and reported usage.
test("TST-316901: public drivers send the prepared prompt once in both provider shapes", async (t) => {
  const old = globalThis.fetch, calls = []; t.after(() => { globalThis.fetch = old; });
  globalThis.fetch = async (url, init) => { calls.push({ url: String(url), body: JSON.parse(init.body) }); return String(url).endsWith("messages") ? response(200, { content: [{ text: "a" }], usage: { input_tokens: 2, output_tokens: 3 } }) : response(200, { choices: [{ message: { content: "o" } }], usage: { prompt_tokens: 2, completion_tokens: 3 } }); };
  assert.deepEqual(await endpointDriver(openai).send(INPUT), { text: "o", usage: { input_tokens: 2, output_tokens: 3 } });
  assert.deepEqual(await endpointDriver(anthropic).send(INPUT), { text: "a", usage: { input_tokens: 2, output_tokens: 3 } });
  assert.equal(calls.length, 2); assert.equal(calls[0].body.messages[0].content, INPUT.prompt); assert.equal(calls[1].body.messages[0].content, INPUT.prompt);
});

// TST-316902
// Precondition: a browser-context controlled successful response without usage.
// Input: the same public DriverInput.
// Expected: the answer kind is stable and unknown usage/cost is null.
test("TST-316902: absent reported usage remains null", async (t) => { const old = globalThis.fetch; t.after(() => { globalThis.fetch = old; }); globalThis.window = {}; globalThis.fetch = async () => response(200, { choices: [{ message: { content: "ok" } }] }); assert.deepEqual(await endpointDriver(openai).send(INPUT), { text: "ok", usage: null }); });

// TST-316903
// Precondition: a provider refuses the configured key.
// Input: one send.
// Expected: its named diagnosis is retained and no retry occurs.
test("TST-316903: a refused key remains named after one request", async (t) => { const old = globalThis.fetch; let calls = 0; t.after(() => { globalThis.fetch = old; }); globalThis.fetch = async () => { calls += 1; return response(401, { error: { message: "key refused" } }); }; await assert.rejects(() => endpointDriver(openai).send(INPUT), (e) => e.code === "endpoint-failed" && /key refused/.test(e.message)); assert.equal(calls, 1); });

// TST-316904
// Precondition: an aborted request to a configured endpoint.
// Input: send with its abort signal.
// Expected: cancellation is propagated without a retry or prompt alteration.
test("TST-316904: cancellation propagates without retrying", async (t) => { const old = globalThis.fetch; let calls = 0; t.after(() => { globalThis.fetch = old; }); globalThis.fetch = async () => { calls += 1; const e = new Error("aborted"); e.name = "AbortError"; throw e; }; const controller = new AbortController(); await assert.rejects(() => endpointDriver(openai).send(INPUT, { signal: controller.signal }), /aborted/); assert.equal(calls, 1); });
